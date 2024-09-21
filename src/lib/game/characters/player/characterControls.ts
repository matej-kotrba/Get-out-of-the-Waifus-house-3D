import * as THREE from 'three';
import preloadMachine, {
	type AnimationsToPreloadOptions
} from '$lib/game/general/PreloadService.svelte';
import worldObjects from '$lib/game/general/WorldObjects';
import tooltipService from '$lib/game/general/TooltipService';
import player from './Player.svelte';
import { EMPTY_HAND, inventoryItemsRecord } from '$lib/game/item/inventory/items-record';
import listenerService, { type KeypressListenerKeys } from '$lib/game/general/ListenerService';
import { DIRECTIONS, INTERACTION } from '$lib/game/constants/controls';
import type { Collider, KinematicCharacterController, Ray, RigidBody } from '@dimforge/rapier3d';
import { getRapierProperties } from '$lib/game/physics/rapier';

const allowedAnimations: AnimationsToPreloadOptions[] = [
	'idle',
	'run',
	'walk',
	'meleeAttack',
	'walkWithItem',
	'equipStand'
] as const;

export type CharacterAction = (typeof allowedAnimations)[number];
export type CharacterAnimationsMap = Map<CharacterAction, THREE.AnimationAction>;

type BlockingAnimation = {
	type: CharacterAction;
	action: THREE.AnimationAction;
	options?: {
		reversed: boolean;
	};
};

export class CharacterControls {
	model: THREE.Object3D;
	mixer: THREE.AnimationMixer;
	animationsMap: CharacterAnimationsMap = new Map();
	orbit: THREE.Object3D;
	camera: THREE.Camera;

	blockingAnimationsQueue: BlockingAnimation[] = [];
	currentAction: CharacterAction;

	walkDirection = new THREE.Vector3();
	rotateAngle = new THREE.Vector3(0, 1, 0);
	rotateQuaternion = new THREE.Quaternion();
	cameraTarget = new THREE.Vector3();

	fadeDuration = 0.2;
	runVelocity = 5;
	walkVelocity = 2;
	storedFall = 0;

	// Current item in hand
	itemInHand: THREE.Object3D | undefined = undefined;

	// Physics
	physicsCharacterController: KinematicCharacterController;
	rigidBody: RigidBody;
	collider: Collider;
	ray: Ray;
	lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

	constructor(
		model: THREE.Object3D,
		orbit: THREE.Object3D,
		camera: THREE.Camera,
		currentAction: CharacterAction
	) {
		this.model = model;
		this.animationsMap = new Map();
		this.mixer = new THREE.AnimationMixer(model);

		const { RAPIER, world } = getRapierProperties();
		this.physicsCharacterController = world.createCharacterController(0.01);
		this.physicsCharacterController.enableSnapToGround(0.5);

		const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
		this.rigidBody = world.createRigidBody(bodyDesc);

		const dynamicCollider = RAPIER.ColliderDesc.ball(0.28);
		this.collider = world.createCollider(
			dynamicCollider,
			this.rigidBody.handle as unknown as RigidBody
		);

		this.ray = new RAPIER.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });

		const animations = allowedAnimations
			.map((animation) => [preloadMachine.getLoadedAnimation(animation), animation])
			.filter((animation) => animation[1] !== undefined) as [
			THREE.AnimationClip,
			AnimationsToPreloadOptions
		][];
		animations.forEach(([clip, action]) => {
			if (!allowedAnimations.includes(action)) return;
			this.animationsMap.set(action, this.mixer.clipAction(clip));
		});

		this.orbit = orbit;
		this.camera = camera;
		this.currentAction = currentAction;
		this.animationsMap.forEach((value, key) => {
			if (key === this.currentAction) {
				value.play();
			}
		});
		this.camera = camera;

		// Set initial physics position
		this.rigidBody.setNextKinematicTranslation(new THREE.Vector3(0, 0.5, 0));
		world.step();
		const initial = this.rigidBody.translation();
		this.model.position.set(initial.x, initial.y, initial.z);
		this.updateCameraTarget(initial.x, initial.y, initial.z);

		const minMaxZoom = [0.5, 0.8];
		listenerService.subscribe('wheel', (event) => {
			const retyped = event as WheelEvent;
			if (listenerService.keys[';']) {
				let newScale = orbit.scale.x + retyped.deltaY * 0.001;
				if (newScale < minMaxZoom[0]) {
					newScale = minMaxZoom[0];
				} else if (newScale > minMaxZoom[1]) {
					newScale = minMaxZoom[1];
				}
				orbit.scale.setScalar(newScale);
			} else {
				if (player.inventory) {
					player.inventory.selectedSlot += retyped.deltaY > 0 ? 1 : -1;
					this.initializeItemInHandToRender();
				}
			}
		});

		listenerService.subscribe('keypress', (event) => {
			const retypedEvent = event as KeyboardEvent;
			if (retypedEvent.key.toLowerCase() === INTERACTION) {
				const groundItem = this.getClosestGroundItem();
				if (groundItem) {
					groundItem.onPickup();
					this.initializeItemInHandToRender();
				}
			}
		});
	}

	public update(delta: number, keys: KeypressListenerKeys) {
		if (this.isAbleToInteractWithGroundItem()) {
			const groundItem = this.getClosestGroundItem();
			tooltipService.setFromGroundItem(groundItem);
		} else {
			tooltipService.clear();
		}

		const directionPressed = Object.values(DIRECTIONS).some((key) => keys[key] === true);

		let play: CharacterAction = 'idle';
		if (keys['q']) {
			play = 'meleeAttack';
		} else if (directionPressed && keys['shift']) {
			play = 'run';
		} else if (directionPressed) {
			if (this.itemInHand) {
				play = 'walkWithItem';
			} else {
				play = 'walk';
			}
		} else {
			play = 'idle';
		}

		if (this.blockingAnimationsQueue.length > 0) {
			play = this.blockingAnimationsQueue[0].type;
		}

		if (this.currentAction !== play) {
			const toPlay = this.animationsMap.get(play);
			const current = this.animationsMap.get(this.currentAction);

			current?.fadeOut(this.fadeDuration);
			toPlay?.reset().fadeIn(this.fadeDuration).play();

			this.currentAction = play;
		}

		this.mixer.update(delta);

		if (
			this.blockingAnimationsQueue[0] &&
			this.isBlockingAnimationFinished(this.blockingAnimationsQueue[0])
		) {
			this.firstOutBlockingAnimation();
		}

		let velocity = 0;
		if (this.isMobilityAction(this.currentAction)) {
			this.updateCharacterRotation(keys, delta);
			velocity = this.currentAction === 'run' ? this.runVelocity : this.walkVelocity;
		}

		const moveX = this.walkDirection.x * velocity * delta;
		const moveZ = this.walkDirection.z * velocity * delta;

		// this.walkDirection.y += -0.0001; //this.lerp(this.storedFall, -9.81 * delta, 0.1);
		// this.storedFall = this.walkDirection.y;

		// Physics
		this.physicsCharacterController.computeColliderMovement(
			this.collider,
			new THREE.Vector3(moveX, 0, moveZ)
		);
		const correctedMovement = this.physicsCharacterController.computedMovement();
		this.rigidBody.setNextKinematicTranslation(correctedMovement);

		if (this.walkDirection.y > correctedMovement.y) {
		}

		this.model.position.x += correctedMovement.x;
		this.model.position.y += correctedMovement.y;
		this.model.position.z += correctedMovement.z;
		this.updateCameraTarget(correctedMovement.x, correctedMovement.y, correctedMovement.z);
	}

	private initializeItemInHandToRender() {
		const playerRightHand = player.joints.get('rightHandPalm');
		if (this.itemInHand && playerRightHand) {
			playerRightHand.remove(this.itemInHand);
		}

		const item = player.inventory?.quickSlotSelectedItem;
		if (!item?.id || item.id === EMPTY_HAND) {
			this.itemInHand = undefined;
			this.addBlockingAnimation('equipStand', { reversed: true });
			return;
		}
		const record = inventoryItemsRecord[item.id];
		const model = preloadMachine.getLoadedItem(item.id);
		if (!model || !record) return;

		playerRightHand?.add(model);
		this.addBlockingAnimation('equipStand');

		this.itemInHand = model;
		model.scale.setScalar(1);

		model.position.x += 7.6;
		model.position.z += 3.2;

		model.rotation.x = -1.2;
		model.rotation.y = 0;
		model.rotation.z = -1.6;
	}

	private addBlockingAnimation(action: CharacterAction, options?: { reversed: boolean }) {
		const animation = this.animationsMap.get(action);
		// THIS MAY CHANGE
		this.blockingAnimationsQueue = this.blockingAnimationsQueue.filter(
			(anim) => anim.type !== action
		);
		//
		if (!animation) return;
		animation.reset();
		animation.clampWhenFinished = true;
		animation.timeScale = options?.reversed ? -1 : 1;
		animation.repetitions = 1;
		this.blockingAnimationsQueue.push({
			action: animation,
			type: action,
			options: { reversed: options?.reversed ?? false }
		});
	}

	private isBlockingAnimationFinished(animation: BlockingAnimation) {
		if (animation.options?.reversed) {
			return animation.action.time <= 0;
		}

		return (
			animation.action.time > 0 && animation.action.time >= animation.action.getClip().duration
		);
	}

	private firstOutBlockingAnimation() {
		if (this.blockingAnimationsQueue.length > 0) {
			this.blockingAnimationsQueue.shift();
		}
	}

	private isAbleToInteractWithGroundItem() {
		for (const item of worldObjects.groundItems) {
			const distance = this.model.position.distanceTo(item.model.position);
			if (distance < 2) {
				return true;
			}
		}
	}

	private getClosestGroundItem() {
		let closestItem = worldObjects.groundItems[0];
		for (const item of worldObjects.groundItems) {
			const distance = this.model.position.distanceTo(item.model.position);
			if (distance < 2 && distance < this.model.position.distanceTo(closestItem.model.position)) {
				closestItem = item;
			}
		}
		return closestItem;
	}

	private isMobilityAction(action: CharacterAction) {
		return action === 'run' || action === 'walk' || action === 'walkWithItem';
	}

	private updateCharacterRotation(keys: KeypressListenerKeys, delta: number) {
		const cameraWorldPosition = new THREE.Vector3();
		this.camera.getWorldPosition(cameraWorldPosition);

		const angleCameraDirection = Math.atan2(
			cameraWorldPosition.x - this.model.position.x,
			cameraWorldPosition.z - this.model.position.z
		);
		const directionOffset = this.dirationOffset(keys);

		this.rotateQuaternion.setFromAxisAngle(
			this.rotateAngle,
			angleCameraDirection + directionOffset + Math.PI
		);
		this.model.quaternion.rotateTowards(this.rotateQuaternion, delta * 7);

		this.camera.getWorldDirection(this.walkDirection);
		this.walkDirection.y = 0;
		this.walkDirection.normalize();
		this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);
	}

	private updateCameraTarget(moveX: number, moveY: number, moveZ: number) {
		this.orbit.position.x += moveX;
		this.orbit.position.y += moveY;
		this.orbit.position.z += moveZ;
	}

	private dirationOffset(keysPressed: KeypressListenerKeys) {
		let directionOffset = 0;

		if (keysPressed[DIRECTIONS.forward]) {
			if (keysPressed[DIRECTIONS.left]) {
				directionOffset = Math.PI / 4;
			} else if (keysPressed[DIRECTIONS.right]) {
				directionOffset = Math.PI / -4;
			}
		} else if (keysPressed[DIRECTIONS.backward]) {
			if (keysPressed[DIRECTIONS.left]) {
				directionOffset = Math.PI / 4 + Math.PI / 2;
			} else if (keysPressed[DIRECTIONS.right]) {
				directionOffset = Math.PI / -4 - Math.PI / 2;
			} else {
				directionOffset = Math.PI;
			}
		} else if (keysPressed[DIRECTIONS.left]) {
			directionOffset = Math.PI / 2;
		} else if (keysPressed[DIRECTIONS.right]) {
			directionOffset = Math.PI / -2;
		}

		return directionOffset;
	}
}

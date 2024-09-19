import * as THREE from 'three';
import preloadMachine, {
	type AnimationsToPreloadOptions
} from '$lib/game/general/PreloadService.svelte';
import worldObjects from '$lib/game/general/WorldObjects';
import tooltipService from '$lib/game/general/TooltipService';
import player from './Player.svelte';
import {
	EMPTY_HAND,
	inventoryItemsRecord
} from '$lib/game/item/inventory/items-record';
import listenerService, {
	type KeypressListenerKeys
} from '$lib/game/general/ListenerService';
import { DIRECTIONS, INTERACTION } from '$lib/game/constants/controls';
import type { Ray, RigidBody } from '@dimforge/rapier3d';
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
export type CharacterAnimationsMap = Map<
	CharacterAction,
	THREE.AnimationAction
>;

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

	storedFall = 0;
	fadeDuration = 0.2;
	runVelocity = 5;
	walkVelocity = 2;

	// Current item in hand
	itemInHand: THREE.Object3D | undefined = undefined;

	// Physics
	ray: Ray;
	rigidBody: RigidBody;
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

		this.ray = new RAPIER.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });

		const bodyDesc =
			RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(-1, 3, 1);
		this.rigidBody = world.createRigidBody(bodyDesc);
		const dynamicCollider = RAPIER.ColliderDesc.ball(0.28);
		world.createCollider(
			dynamicCollider,
			this.rigidBody.handle as unknown as RigidBody
		);

		const animations = allowedAnimations
			.map((animation) => [
				preloadMachine.getLoadedAnimation(animation),
				animation
			])
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

		const directionPressed = Object.values(DIRECTIONS).some(
			(key) => keys[key] === true
		);

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

		this.walkDirection.x = this.walkDirection.y = this.walkDirection.z = 0;

		let velocity = 0;

		if (
			this.blockingAnimationsQueue[0] &&
			this.isBlockingAnimationFinished(this.blockingAnimationsQueue[0])
		) {
			this.firstOutBlockingAnimation();
		}

		if (this.isMobilityAction(this.currentAction)) {
			this.updateCharacterRotation(keys, delta);

			velocity =
				this.currentAction === 'run' ? this.runVelocity : this.walkVelocity;
		}

		const { world } = getRapierProperties();
		const translation = this.rigidBody.translation();
		if (translation.y < -1) {
			this.rigidBody.setNextKinematicTranslation({ x: 0, y: 10, z: 0 });
		} else {
			const cameraPositionOffset = this.orbit.position.sub(this.model.position);
			this.model.position.x = translation.x;
			this.model.position.y = translation.y;
			this.model.position.z = translation.z;
			this.updateCameraTarget(cameraPositionOffset);

			this.walkDirection.y += this.lerp(this.storedFall, -9.81 * delta, 0.1);
			this.storedFall = this.walkDirection.y;
			this.ray.origin.x = translation.x;
			this.ray.origin.y = translation.y;
			this.ray.origin.z = translation.z;
			const hit = world.castRay(this.ray, 0.5, false, 0xfffffffff);
			if (hit) {
				const point = this.ray.pointAt(hit.timeOfImpact);
				const diff = translation.y - (point.y + 0.28);
				if (diff < 0.0) {
					this.storedFall = 0;
					this.walkDirection.y = this.lerp(0, Math.abs(diff), 0.5);
				}
			}

			this.walkDirection.x = this.walkDirection.x * velocity * delta;
			this.walkDirection.z = this.walkDirection.z * velocity * delta;

			this.rigidBody.setNextKinematicTranslation({
				x: translation.x + this.walkDirection.x,
				y: translation.y + this.walkDirection.y,
				z: translation.z + this.walkDirection.z
			});
			// const moveX = this.walkDirection.x * velocity * delta;
			// const moveZ = this.walkDirection.z * velocity * delta;
			// this.model.position.x += moveX;
			// this.model.position.z += moveZ;
			// this.updateCameraTarget(moveX, moveZ);
		}
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

	private addBlockingAnimation(
		action: CharacterAction,
		options?: { reversed: boolean }
	) {
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
			animation.action.time > 0 &&
			animation.action.time >= animation.action.getClip().duration
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
			if (
				distance < 2 &&
				distance < this.model.position.distanceTo(closestItem.model.position)
			) {
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

	private updateCameraTarget(cameraPositionOffset: THREE.Vector3) {
		const rigidTranslation = this.rigidBody.translation();
		this.orbit.position.x = rigidTranslation.x + cameraPositionOffset.x;
		this.orbit.position.y = rigidTranslation.y + cameraPositionOffset.y;
		this.orbit.position.z = rigidTranslation.z + cameraPositionOffset.z;

		this.cameraTarget.x = rigidTranslation.x;
		this.cameraTarget.y = rigidTranslation.y + 1;
		this.cameraTarget.z = rigidTranslation.z;
	}

	// private updateCameraTarget(moveX: number, moveZ: number) {
	// 	this.orbit.position.x += moveX;
	// 	this.orbit.position.z += moveZ;
	// }

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

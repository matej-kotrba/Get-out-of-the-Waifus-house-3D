import * as THREE from 'three';
import type { KeypressListenerKeys } from '$lib/game/general/ListenerService';
import preloadMachine, {
	type AnimationsToPreloadOptions
} from '$lib/game/general/PreloadService.svelte';
import worldObjects from '$lib/game/general/WorldObjects';
import tooltipService from '$lib/game/general/TooltipService';
import player from './Player.svelte';
import { inventoryItemsRecord } from '$lib/game/item/inventory/items-record';
import listenerService2 from '$lib/game/general/ListenerService2';
import listenerMachine from '$lib/game/general/ListenerService';
import { DIRECTIONS, INTERACTION } from '$lib/game/constants/controls';
import playerVarsMachine from '$lib/game/general/PlayerVarsService';

const allowedAnimations: AnimationsToPreloadOptions[] = [
	'idle',
	'run',
	'walk',
	'meleeAttack',
	'walkWithItem'
] as const;

export type CharacterAction = (typeof allowedAnimations)[number];
export type CharacterAnimationsMap = Map<
	CharacterAction,
	THREE.AnimationAction
>;

export class CharacterControls {
	model: THREE.Object3D;
	mixer: THREE.AnimationMixer;
	animationsMap: CharacterAnimationsMap = new Map();
	orbit: THREE.Object3D;
	camera: THREE.Camera;

	currentAction: CharacterAction;

	walkDirection = new THREE.Vector3();
	rotateAngle = new THREE.Vector3(0, 1, 0);
	rotateQuaternion = new THREE.Quaternion();
	cameraTarget = new THREE.Vector3();

	fadeDuration = 0.2;
	runVelocity = 5;
	walkVelocity = 2;

	// Current item in hand
	itemInHand: THREE.Object3D | undefined = undefined;

	constructor(
		model: THREE.Object3D,
		orbit: THREE.Object3D,
		camera: THREE.Camera,
		currentAction: CharacterAction
	) {
		this.model = model;
		this.animationsMap = new Map();
		this.mixer = new THREE.AnimationMixer(model);

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
		listenerService2.subscribe('wheel', (event) => {
			console.log('asd');
			const retyped = event as WheelEvent;
			if (listenerMachine.keys[';']) {
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
					this.renderItemInHandOnMouseScroll();
				}
			}
		});

		listenerService2.subscribe('keypress', (event) => {
			const retypedEvent = event as KeyboardEvent;
			if (retypedEvent.key === INTERACTION) {
				const groundItem = this.getClosestGroundItem();
				if (groundItem) {
					groundItem.onPickup();
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
			play = 'walk';
		} else {
			play = 'idle';
		}

		if (this.currentAction !== play) {
			const toPlay = this.animationsMap.get(play);
			const current = this.animationsMap.get(this.currentAction);

			current?.fadeOut(this.fadeDuration);
			toPlay?.reset().fadeIn(this.fadeDuration).play();

			this.currentAction = play;
		}

		this.mixer.update(delta);

		if (this.isMobilityAction(this.currentAction)) {
			this.updateCharacterRotation(keys, delta);

			const velocity =
				this.currentAction === 'run' ? this.runVelocity : this.walkVelocity;
			const moveX = this.walkDirection.x * velocity * delta;
			const moveZ = this.walkDirection.z * velocity * delta;
			this.model.position.x += moveX;
			this.model.position.z += moveZ;
			this.updateCameraTarget(moveX, moveZ);
		}
	}

	private renderItemInHandOnMouseScroll() {
		const item = player.inventory?.selectedItem;
		if (!item?.id) return;
		const record = inventoryItemsRecord[item.id];
		const model = preloadMachine.getLoadedItem(item.id);
		if (!model || !record) return;
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

	private updateCameraTarget(moveX: number, moveZ: number) {
		this.orbit.position.x += moveX;
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

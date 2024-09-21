import rayFactory from '$lib/game/effects/Ray';
import type { ItemsToPreloadOptions } from '$lib/game/general/PreloadService.svelte';
import updateService from '$lib/game/general/UpdateService';
import * as THREE from 'three';
import { getMacheteItem } from './items/Machete';
import player from '$lib/game/characters/player/Player.svelte';
import worldObjects from '$lib/game/general/WorldObjects';
import type { Model } from '$lib/types/game';

export const itemTypeMethodsRecord = {
	machete: getMacheteItem()
} as const;

export type ItemTypeMethodsRecordType = keyof typeof itemTypeMethodsRecord;

export type GroundItemTemplate = {
	type: ItemsToPreloadOptions;
	loadModel(
		loadingManager: THREE.LoadingManager,
		onLoad?: (model: THREE.Group<THREE.Object3DEventMap>) => void
	): void;
};

export type GroundItemRestProps = {
	model: Model;
	initialPosition: THREE.Vector3;
};

export class GroundItem {
	public type: GroundItemTemplate['type'];

	public model: GroundItemRestProps['model'];
	public rays: THREE.Group<THREE.Object3DEventMap>;
	public initialPosition: GroundItemRestProps['initialPosition'];

	constructor(groundItem: Omit<GroundItemTemplate, 'loadModel'>, restProps: GroundItemRestProps) {
		this.type = groundItem.type;

		this.model = restProps.model;

		this.rays = new THREE.Group();
		const rays = rayFactory.createRaysAtArea('point', {
			count: 5,
			position: restProps.initialPosition
		});
		rayFactory.addRaysToScene(rays, this.rays);
		updateService.subscribe((delta, time) => {
			rayFactory.rayAnimateEffect(rays, delta, time);
		});

		this.initialPosition = restProps.initialPosition;

		this.model.position.copy(this.initialPosition);
	}

	public onPickup() {
		if (player.inventory?.addItemToQuickSlot(this.type)) {
			this.destroy();
		}
	}

	public destroy() {
		worldObjects.removeGroundItem(this);
		this.model.removeFromParent();
		this.rays.removeFromParent();
	}

	public addToScene(scene: THREE.Scene) {
		scene.add(this.model);
		scene.add(this.rays);
	}
}

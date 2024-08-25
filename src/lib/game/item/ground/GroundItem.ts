import rayFactory from '$lib/game/effects/Ray';
import type { ItemsToPreloadOptions } from '$lib/game/general/PreloadService.svelte';
import updateMachine from '$lib/game/general/UpdateService';
import * as THREE from 'three';
import { getMacheteItem } from './items/Machete';

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
	onPickup(): void;
	destroy(): void;
};

export type GroundItemRestProps = {
	model: THREE.Object3D<THREE.Object3DEventMap>;
	initialPosition: THREE.Vector3;
};

export class GroundItem {
	public type: GroundItemTemplate['type'];
	public onPickup: GroundItemTemplate['onPickup'];
	public destroy: GroundItemTemplate['destroy'];

	public model: GroundItemRestProps['model'];
	public rays: THREE.Group<THREE.Object3DEventMap>;
	public initialPosition: GroundItemRestProps['initialPosition'];

	constructor(
		groundItem: Omit<GroundItemTemplate, 'loadModel'>,
		restProps: GroundItemRestProps
	) {
		this.type = groundItem.type;
		this.onPickup = groundItem.onPickup;
		this.destroy = groundItem.destroy;

		this.model = restProps.model;

		this.rays = new THREE.Group();
		const rays = rayFactory.createRaysAtArea('point', {
			count: 5,
			position: restProps.initialPosition
		});
		rayFactory.addRaysToScene(rays, this.rays);
		updateMachine.subscribe((delta, time) => {
			rayFactory.rayAnimateEffect(rays, delta, time);
		});

		this.initialPosition = restProps.initialPosition;

		this.model.position.copy(this.initialPosition);
	}

	public addToScene(scene: THREE.Scene) {
		scene.add(this.model);
		scene.add(this.rays);
	}
}

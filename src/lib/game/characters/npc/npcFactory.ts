import type { ModelsToPreloadOptions } from '$lib/game/general/PreloadService.svelte';
import preloadService from '$lib/game/general/PreloadService.svelte';
import updateService from '$lib/game/general/UpdateService';
import { initialize } from '$lib/three/setup.svelte';
import type { Model } from '$lib/types/game';
import type { Vector3 } from 'three';
import * as THREE from 'three';

export class NpcFactory {
	public static createNpc(skin: ModelsToPreloadOptions, coords: Vector3): Npc {
		const model = preloadService.getLoadedModel(skin);
		if (!model) throw new Error('Npc is either not loaded or does not exist');
		return new Npc(model, coords);
	}
}

// TODO: Later extract some properties like `model` to different more general class
class Npc {
	#model: Model;

	constructor(model: Model, coords: Vector3) {
		this.#model = model;

		const { scene } = initialize.getProperties();

		this.#model.position.set(coords.x, coords.y, coords.z);
		scene.add(this.#model);

		const animationMixer = new THREE.AnimationMixer(this.#model);
		const animation = preloadService.getLoadedAnimation('neutralIdle');
		if (animation) {
			animationMixer.clipAction(animation).play();
		}

		updateService.subscribe((delta) => {
			animationMixer.update(delta);
		});

		this.createQuestMark();
	}

	private createQuestMark() {
		const group = new THREE.Group();

		const rectGeometry = new THREE.BoxGeometry(0.3, 1, 0.05);
		const rectMaterial = new THREE.MeshBasicMaterial({ color: 0xebc334 });
		const rect = new THREE.Mesh(rectGeometry, rectMaterial);

		const circleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 32);
		const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xebc334 });
		const circle = new THREE.Mesh(circleGeometry, circleMaterial);

		rect.position.set(this.#model.position.x, this.#model.position.y + 3.4, this.#model.position.z);
		circle.position.set(
			this.#model.position.x,
			this.#model.position.y + 2.5,
			this.#model.position.z
		);

		group.add(rect, circle);

		const { scene, camera } = initialize.getProperties();
		scene.add(group);

		updateService.subscribe(() => {
			const position = new THREE.Vector3();
			if (!camera) return;
			camera.getWorldPosition(position);
			circle.lookAt(position);
			rect.lookAt(position);
			circle.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
		});
	}
}

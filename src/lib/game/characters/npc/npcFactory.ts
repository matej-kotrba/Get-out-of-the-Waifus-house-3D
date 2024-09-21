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
	}
}

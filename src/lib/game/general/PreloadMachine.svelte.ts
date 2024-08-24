import * as THREE from 'three';
import { EXRLoader, FBXLoader, RGBELoader } from 'three/examples/jsm/Addons.js';
import type { GroundItemTemplate } from '../item/ground/GroundItem';
import { getMacheteItem } from '../item/ground/items/Machete';
import type { CharacterAction } from '$lib/three/characterControls.svelte';

export type PreloadedParts = 'items' | 'animations' | 'models' | 'hdris';

export type ItemType = 'machete';

type AnimationsToPreload = CharacterAction;

type PromiseResponse = (value: unknown) => void;

class PreloadMachine {
	public isPreloading: boolean = $state(true);
	public preloadedParts: Record<PreloadedParts, boolean> = $state({
		items: false,
		animations: false,
		models: false,
		hdris: false
	});

	// Preloading items data
	#itemsToPreload: GroundItemTemplate[] = [getMacheteItem()];
	#itemsLoaded: {
		[key in ItemType]?: THREE.Group<THREE.Object3DEventMap>;
	} = {};

	// Preloading animations data
	#animationsToPreload: AnimationsToPreload[] = [
		'idle',
		'walk',
		'walkWithItem',
		'run',
		'meleeAttack'
	];
	#animationsLoaded: Map<AnimationsToPreload, THREE.AnimationClip> = new Map();

	// Preloading models data
	// #modelstoPreload: string[] = ["machete"];
	#modelsLoaded: Map<
		string,
		() => Promise<THREE.Group<THREE.Object3DEventMap>>
	> = new Map();

	// Preloading HDRIs
	#hdrisToPreload: string[] = ['forest'];
	#hdrisLoaded: Map<string, THREE.Texture> = new Map();

	// Subscriber properties
	#callbacks: (() => void)[] = [];

	constructor() {
		this.preload();
	}

	get itemsLoaded() {
		return this.#itemsLoaded;
	}

	get animationsLoaded() {
		return this.#animationsLoaded;
	}

	public async getLoadedModel(key: string) {
		const fn = this.#modelsLoaded.get(key);
		if (fn) {
			return await fn();
		}
	}

	public getLoadedHDRi(key: string) {
		return this.#hdrisLoaded.get(key);
	}

	public subscribeOnPreloadDone(callback: () => void) {
		if (this.isPreloading) {
			this.#callbacks.push(callback);
		}
	}

	private async preload() {
		THREE.Cache.enabled = true;
		await this.preloadHandler(this.preloadModels);
		// Disable cache to prevent caching of other resources
		THREE.Cache.enabled = false;
		await Promise.all([
			this.preloadHandler(this.preloadItemModels),
			this.preloadHandler(this.preloadAnimations),
			this.preloadHandler(this.preloadHDRIs)
		]);
		// Enable it again so it can be used later
		THREE.Cache.enabled = true;
		this.isPreloading = false;
		this.#callbacks.forEach((callback) => callback());
		this.#callbacks = [];
	}

	private preloadItemModels(res: PromiseResponse) {
		const loadingManager = new THREE.LoadingManager();
		loadingManager.addHandler(/\.exr$/i, new EXRLoader());

		loadingManager.onLoad = () => {
			preloadMachine.preloadedParts['items'] = true;
			res('done');
		};

		this.#itemsToPreload.forEach((item) => {
			item.loadModel(loadingManager, (model) => {
				this.#itemsLoaded[item.type] = model;
			});
		});
	}

	private preloadAnimations(res: PromiseResponse) {
		const loadingManager = new THREE.LoadingManager();
		const loader = new FBXLoader(loadingManager);

		loadingManager.onLoad = () => {
			preloadMachine.preloadedParts['animations'] = true;
			res('done');
		};

		this.#animationsToPreload.forEach((item) => {
			loader.load(`animations/${item}.fbx`, (a) => {
				this.#animationsLoaded.set(item, a.animations[0]);
			});
		});
	}

	private preloadModels(res: PromiseResponse) {
		const loadingManager = new THREE.LoadingManager();
		const loader = new FBXLoader(loadingManager);

		loadingManager.onLoad = () => {
			preloadMachine.preloadedParts['models'] = true;
			res('done');
		};

		const loadFn = (res: PromiseResponse) => {
			loader.load('models/characters/bot.fbx', (fbxTemp) => {
				fbxTemp.traverse((c) => {
					c.castShadow = true;
				});
				fbxTemp.scale.setScalar(0.01);
				res(fbxTemp);
			});
		};
		loadFn(() => {});

		const wrapped = async () => {
			const fbx: THREE.Group<THREE.Object3DEventMap> = await new Promise(
				(res) => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-ignore
					loadFn(res);
				}
			);

			return fbx;
		};

		this.#modelsLoaded.set('bot', wrapped);
	}

	private preloadHDRIs(res: PromiseResponse) {
		const loadingManager = new THREE.LoadingManager();
		const loader = new RGBELoader(loadingManager);

		loadingManager.onLoad = () => {
			preloadMachine.preloadedParts['hdris'] = true;
			res('done');
		};

		this.#hdrisToPreload.forEach((item) => {
			loader.load(`HDRi/${item}.hdr`, (texture) => {
				texture.mapping = THREE.EquirectangularReflectionMapping;
				this.#hdrisLoaded.set(item, texture);
			});
		});
	}

	private async preloadHandler(callback: (res: PromiseResponse) => void) {
		return await new Promise((res) => {
			callback.bind(this)(res);
		});
	}
}

const preloadMachine = new PreloadMachine();
export default preloadMachine;

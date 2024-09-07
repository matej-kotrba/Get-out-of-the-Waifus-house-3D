import * as THREE from 'three';
import { EXRLoader, FBXLoader, RGBELoader } from 'three/examples/jsm/Addons.js';
import {
	itemTypeMethodsRecord,
	type ItemTypeMethodsRecordType
} from '../item/ground/GroundItem';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export type PreloadedParts =
	| 'items'
	| 'animations'
	| 'models'
	| 'hdris'
	| 'textures';

export const itemsToPreload: ItemTypeMethodsRecordType[] = ['machete'] as const;

export const animationsToPreload = [
	'idle',
	'walk',
	'walkWithItem',
	'run',
	'meleeAttack',
	'equipStand'
] as const;

export const hdrisToPreload = ['forest'] as const;

export const texturesToPreload = ['leafy_grass'] as const;
const textureMapsNamingsToPreload = {
	map: 'diff.jpg',
	normalMap: 'nor.jpg',
	displacementMap: 'disp.png',
	roughnessMap: 'arm.jpg',
	metalnessMap: 'arm.jpg',
	aoMap: 'arm.jpg'
};

type PreloadedTexture = {
	[Key in keyof typeof textureMapsNamingsToPreload]: THREE.Texture;
};

export type ItemsToPreloadOptions = (typeof itemsToPreload)[number];
export type AnimationsToPreloadOptions = (typeof animationsToPreload)[number];
export type HDRIsToPreloadOptions = (typeof hdrisToPreload)[number];

type PromiseResponse = (value: unknown) => void;

class PreloadService {
	public isPreloading: boolean = $state(true);
	public preloadedParts: Record<PreloadedParts, boolean> = $state({
		items: false,
		animations: false,
		models: false,
		hdris: false,
		textures: false
	});

	// Preloading items data
	#itemsToPreload: ItemsToPreloadOptions[] = itemsToPreload;
	#itemsLoaded: Map<ItemsToPreloadOptions, THREE.Object3D> = new Map();

	// Preloading animations data
	#animationsToPreload = animationsToPreload;
	#animationsLoaded: Map<AnimationsToPreloadOptions, THREE.AnimationClip> =
		new Map();

	// Preloading models data
	// #modelsToPreload: string[] = ["bot"];
	#modelsLoaded: Map<string, THREE.Group<THREE.Object3DEventMap>> = new Map();

	// Preloading HDRIs
	#hdrisToPreload = hdrisToPreload;
	#hdrisLoaded: Map<string, THREE.Texture> = new Map();

	// Preloading textures
	#texturesToPreload = texturesToPreload;
	#texturesLoaded: Map<string, PreloadedTexture> = new Map();

	// Subscriber properties
	#callbacks: (() => void)[] = [];

	constructor() {
		this.preload();
	}

	public subscribeOnPreloadDone(callback: () => void) {
		if (this.isPreloading) {
			this.#callbacks.push(callback);
		}
	}

	public getLoadedItem(key: ItemsToPreloadOptions) {
		const original = this.#itemsLoaded.get(key);
		if (original) {
			const copy = clone(original);
			return copy;
		}
	}

	public getLoadedAnimation(key: AnimationsToPreloadOptions) {
		const animation = this.#animationsLoaded.get(key);
		if (!animation) return;
		return animation.clone();
	}

	public getLoadedModel(key: string) {
		const model = this.#modelsLoaded.get(key);
		if (!model) return;
		return clone(model);
	}

	public getLoadedHDRi(key: HDRIsToPreloadOptions) {
		return this.#hdrisLoaded.get(key);
	}

	public getLoadedTexture(key: (typeof texturesToPreload)[number]) {
		return this.#texturesLoaded.get(key);
	}

	private async preload() {
		THREE.Cache.enabled = true;
		await this.preloadHandler(this.preloadModels);
		// Disable cache to prevent caching of other resources
		THREE.Cache.enabled = false;
		await Promise.all([
			this.preloadHandler(this.preloadItemModels),
			this.preloadHandler(this.preloadAnimations),
			this.preloadHandler(this.preloadHDRIs),
			this.preloadHandler(this.preloadTextures)
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

		this.#itemsToPreload.forEach((type) => {
			const loadFn = itemTypeMethodsRecord[type].loadModel;
			loadFn(loadingManager, (model) => {
				this.#itemsLoaded.set(type, model);
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

		loader.load('models/characters/bot.fbx', (fbxTemp) => {
			fbxTemp.traverse((c) => {
				c.castShadow = true;
			});
			fbxTemp.scale.setScalar(0.01);
			this.#modelsLoaded.set('bot', fbxTemp);
		});
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

	private preloadTextures(res: PromiseResponse) {
		const loadingManager = new THREE.LoadingManager();
		const loader = new THREE.TextureLoader(loadingManager);

		loadingManager.onLoad = () => {
			preloadMachine.preloadedParts['textures'] = true;
			res('done');
		};

		this.#texturesToPreload.forEach((item) => {
			const loadedData: {
				[Key in keyof PreloadedTexture]?: PreloadedTexture[Key];
			} = {};
			Object.entries(textureMapsNamingsToPreload).forEach(
				([mapName, filename]) => {
					loader.load(`textures/${item}/${filename}`, (texture) => {
						loadedData[mapName as keyof PreloadedTexture] = texture;
						texture.colorSpace = THREE.SRGBColorSpace;
					});
				}
			);
			this.#texturesLoaded.set(item, loadedData as PreloadedTexture);
		});
	}

	private async preloadHandler(callback: (res: PromiseResponse) => void) {
		return await new Promise((res) => {
			callback.bind(this)(res);
		});
	}
}

const preloadMachine = new PreloadService();
export default preloadMachine;

import Inventory from '$lib/game/inventory/Inventory.svelte';
import { CharacterControls } from './characterControls';
import { initialize } from '$lib/three/setup.svelte';
import preloadService from '$lib/game/general/PreloadService.svelte';
import type { Model } from '$lib/types/game';

type Joints = 'leftHandPalm' | 'rightHandPalm';

class Player {
	isInitialized: boolean = false;
	joints: Map<Joints, Model> = new Map();

	// Player stats
	hp: number;
	maxHp: number;

	// Player linked data
	inventory: Inventory | undefined = $state(undefined);
	characterControls: CharacterControls | undefined;
	model: Model | undefined;

	constructor() {
		this.hp = 1000;
		this.maxHp = 1000;
	}

	public initialize() {
		const { orbit, camera, scene } = initialize.getProperties();
		const model = preloadService.getLoadedModel('bot');
		if (!model) {
			throw new Error('Player model not loaded');
		}

		this.initializeModelsPartsOfBody(model);
		this.inventory = new Inventory();
		this.characterControls = new CharacterControls(model, orbit, camera, 'idle');

		this.model = model;
		scene.add(model);
	}

	public getPlayerModelPosition() {
		return this.model?.position;
	}

	private initializeModelsPartsOfBody(model: Model) {
		const leftHandPalm = model.getObjectByName('mixamorigLeftHandIndex1');
		const rightHandPalm = model.getObjectByName('mixamorigRightHandIndex1');

		if (!leftHandPalm || !rightHandPalm) {
			throw new Error('Player model parts not found');
		}

		this.joints.set('leftHandPalm', leftHandPalm);
		this.joints.set('rightHandPalm', rightHandPalm);
	}
}

const player = new Player();
export default player;

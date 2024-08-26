import Inventory from '$lib/game/inventory/Inventory.svelte';
import { CharacterControls } from './characterControls';
import { initialize } from '$lib/three/setup.svelte';
import preloadMachine from '$lib/game/general/PreloadService.svelte';
import * as THREE from 'three';

type Joints = 'leftHandPalm' | 'rightHandPalm';

class Player {
	isInitialized: boolean = false;
	joints: Map<Joints, THREE.Object3D<THREE.Object3DEventMap>> = new Map();

	// Player stats
	hp: number;
	maxHp: number;

	// Player linked data
	inventory: Inventory | undefined = $state(undefined);
	characterControls: CharacterControls | undefined;

	constructor() {
		this.hp = 1000;
		this.maxHp = 1000;
	}

	public async initialize() {
		const { orbit, camera } = initialize.getProperties();
		const model = preloadMachine.getLoadedModel('bot');
		if (!model) {
			throw new Error('Player model not loaded');
		}
		this.initializeModelsPartsOfBody(model);
		this.inventory = new Inventory();
		this.characterControls = new CharacterControls(
			model,
			orbit,
			camera,
			'idle'
		);
	}

	private initializeModelsPartsOfBody(
		model: THREE.Object3D<THREE.Object3DEventMap>
	) {
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

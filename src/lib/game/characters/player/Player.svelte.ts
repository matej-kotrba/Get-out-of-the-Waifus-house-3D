import Inventory from '$lib/game/inventory/Inventory.svelte';
import { CharacterControls } from './characterControls';
import { initialize } from '$lib/three/setup.svelte';
import preloadMachine from '$lib/game/general/PreloadMachine.svelte';

class Player {
	isInitialized: boolean = false;

	// Player stats
	hp: number;
	maxHp: number;

	// Player linked data
	inventory: Inventory | undefined;
	characterControls: CharacterControls | undefined;

	constructor() {
		this.hp = 1000;
		this.maxHp = 1000;
	}

	public async initialize() {
		const { orbit, camera } = initialize.getProperties();
		const model = await preloadMachine.getLoadedModel('bot');
		if (!model) {
			throw new Error('Player model not loaded');
		}
		console.log(initialize.getProperties());
		this.inventory = new Inventory();
		this.characterControls = new CharacterControls(
			model,
			orbit,
			camera,
			'idle'
		);
	}
}

const player = new Player();
export default player;

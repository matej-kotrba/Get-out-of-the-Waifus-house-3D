import type { GroundItem } from '../item/ground/GroundItem';
import { initialize } from '$lib/three/setup.svelte';
import type { Npc } from '../characters/npc/npcFactory';

class WorldObjects {
	structures: unknown[] = [];
	npcs: Npc[] = [];
	enemies: unknown[] = [];
	groundItems: GroundItem[] = [];

	public addGroundItem(...groundItems: GroundItem[]) {
		const { scene } = initialize.getProperties();
		for (const groundItem of groundItems) {
			this.groundItems.push(groundItem);
			groundItem.addToScene(scene);
		}
	}

	public removeGroundItem(groundItem: GroundItem) {
		const index = this.groundItems.indexOf(groundItem);
		if (index === -1) {
			return;
		}
		this.groundItems.splice(index, 1);
	}
}

const worldObjects = new WorldObjects();
export default worldObjects;

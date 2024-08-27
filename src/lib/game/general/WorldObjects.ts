import type { GroundItem } from '../item/ground/GroundItem';
import { initialize } from '$lib/three/setup.svelte';

class WorldObjects {
	structures: unknown[] = [];
	npcs: unknown[] = [];
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

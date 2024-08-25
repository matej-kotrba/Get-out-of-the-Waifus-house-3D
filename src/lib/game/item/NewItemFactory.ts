import { GroundItem, type GroundItemTemplate } from './ground/GroundItem';
import * as THREE from 'three';
import preloadMachine from '../general/PreloadService.svelte';

class NewItemFactory {
	public createGroundItem(
		groundItem: GroundItemTemplate,
		initialPosition: THREE.Vector3
	): GroundItem {
		const model = preloadMachine.getLoadedItem(groundItem.type);
		if (!model) {
			throw new Error('Ground item model not loaded');
		}

		return new GroundItem(groundItem, {
			initialPosition,
			model: model
		});
	}

	public async createHandItem() {}
}

const newItemFactory = new NewItemFactory();

export default newItemFactory;

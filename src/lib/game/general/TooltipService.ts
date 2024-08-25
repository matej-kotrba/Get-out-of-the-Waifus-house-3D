import { CSS2DObject } from 'three/examples/jsm/Addons.js';
import type { GroundItem } from '../item/ground/GroundItem';
import { inventoryItemsRecord } from '../item/inventory/items-record';
import { initialize } from '$lib/three/setup.svelte';

class TooltipMachine {
	#tooltip: CSS2DObject | undefined;
	#lastRenderedItem: GroundItem | undefined;

	public setFromGroundItem(groundItem: GroundItem) {
		const { scene } = initialize.getProperties();

		if (groundItem === this.#lastRenderedItem) return;
		else this.clear();

		this.#lastRenderedItem = groundItem;

		const title = inventoryItemsRecord[groundItem.type].displayName;
		// const image = inventoryItemsRecord[groundItem.type].image;
		const description = inventoryItemsRecord[groundItem.type].description;

		const wrapper = document.createElement('div');
		wrapper.style.width = '16rem';
		wrapper.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
		wrapper.style.padding = '1rem';
		const header = document.createElement('h4');
		header.style.fontSize = '1.5rem';
		header.innerText = title;
		const paragraph = document.createElement('p');
		paragraph.innerText = description ?? '';
		// const img = document.createElement('img');

		wrapper.appendChild(header);
		wrapper.appendChild(paragraph);

		const cPoint = new CSS2DObject(wrapper);
		cPoint.position.copy(groundItem.model.position);
		cPoint.position.y += 1;

		this.#tooltip = cPoint;
		scene.add(cPoint);
	}

	public clear() {
		const { scene } = initialize.getProperties();

		if (this.#tooltip) {
			this.#tooltip.clear();
			this.#lastRenderedItem = undefined;
			scene.remove(this.#tooltip);
		}
	}

	public update() {}
}

const tooltipService = new TooltipMachine();
export default tooltipService;

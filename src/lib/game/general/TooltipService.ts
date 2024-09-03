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
		const image = inventoryItemsRecord[groundItem.type].quickslotImage;
		const description = inventoryItemsRecord[groundItem.type].description;

		const wrapper = document.createElement('div');
		wrapper.style.width = '24rem';
		wrapper.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
		wrapper.style.padding = '1rem';

		const wrapper__container = document.createElement('div');
		wrapper__container.style.display = 'flex';
		wrapper__container.style.gap = '0.5rem';
		wrapper__container.style.alignItems = 'center';

		const content__container = document.createElement('div');

		const header = document.createElement('h4');
		header.style.fontSize = '1.5rem';
		header.innerText = title;

		const img = document.createElement('img');
		img.src = image;
		img.style.width = '8rem';
		img.style.filter = 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))';

		const paragraph = document.createElement('p');
		paragraph.style.fontSize = '1.1rem';
		paragraph.innerText = description ?? '';

		wrapper__container.appendChild(img);

		content__container.appendChild(header);
		content__container.appendChild(paragraph);

		wrapper__container.appendChild(content__container);

		wrapper.appendChild(wrapper__container);

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

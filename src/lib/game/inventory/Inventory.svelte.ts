import type { InventoryKeys } from '../item/inventory/items-record';

const INVENTORY_SIZE = 5;

type InventoryItem = {
	id?: InventoryKeys;
	slotId: number;
};

class Inventory {
	items: InventoryItem[] = [];
	#selectedSlot: number = $state(0);

	constructor() {
		const proxyHandler: ProxyHandler<InventoryItem> = {
			set: (
				target: InventoryItem,
				prop: keyof InventoryItem,
				value: unknown
			) => {
				console.log('Setting', prop, 'to', value, 'with target', target);
				return true;
			}
		};

		for (let i = 0; i < INVENTORY_SIZE; i++) {
			this.items.push(
				new Proxy<InventoryItem>({ slotId: i, id: 'fist' }, proxyHandler)
			);
		}
		this.items[1].id = 'machete';
	}

	public get selectedSlot(): number {
		return this.#selectedSlot;
	}

	public set selectedSlot(index: number) {
		if (index < 0) {
			index = INVENTORY_SIZE - 1;
		} else if (index >= INVENTORY_SIZE) {
			index = 0;
		} else {
			this.#selectedSlot = index;
		}
	}

	private loadInventoryItems() {}
}

const inventory = new Inventory();
export default inventory;

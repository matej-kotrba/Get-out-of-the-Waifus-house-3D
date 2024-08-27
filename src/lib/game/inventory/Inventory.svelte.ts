import type { ItemTypeMethodsRecordType } from '../item/ground/GroundItem';
import {
	EMPTY_HAND,
	type InventoryKeysType
} from '../item/inventory/items-record';

const INVENTORY_SIZE = 5;

type InventoryItem = {
	id?: InventoryKeysType;
	slotId: number;
};

export default class Inventory {
	items: InventoryItem[] = $state([]);
	#selectedSlot: number = $state(0);

	constructor() {
		const proxyHandler: ProxyHandler<InventoryItem> = {
			set: (
				target: InventoryItem,
				prop: keyof InventoryItem,
				value: unknown
			) => {
				// console.log('Setting', prop, 'to', value, 'with target', target);
				if (prop === 'id') {
					target['id'] = value as InventoryKeysType;
				}

				return true;
			}
		};

		for (let i = 0; i < INVENTORY_SIZE; i++) {
			this.items.push(
				new Proxy<InventoryItem>({ slotId: i, id: EMPTY_HAND }, proxyHandler)
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

	public get selectedItem(): InventoryItem {
		return this.items[this.selectedSlot];
	}

	public addItemToInventory(groundItemKey: ItemTypeMethodsRecordType): boolean {
		for (const slot of this.items) {
			if (slot.id !== EMPTY_HAND) continue;
			slot.id = groundItemKey;
			return true;
		}
		return false;
	}
}

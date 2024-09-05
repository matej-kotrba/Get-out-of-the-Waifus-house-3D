import type { ItemTypeMethodsRecordType } from '../item/ground/GroundItem';
import {
	EMPTY_HAND,
	type InventoryKeysType
} from '../item/inventory/items-record';

const INVENTORY_SIZE = 5;

type QuickSlotItem = {
	id?: InventoryKeysType;
	slotId: number;
};

type InventoryItem = {
	id: InventoryKeysType;
	colIdx: number;
	rowIdx: number;
};

export default class Inventory {
	#quickslotItems: QuickSlotItem[] = $state([]);
	#inventoryItems: InventoryItem[] = $state([]);

	#selectedSlot: number = $state(0);

	constructor() {
		// const proxyHandler: ProxyHandler<Item> = {
		// 	set: (target: Item, prop: keyof Item, value: unknown) => {
		// 		// console.log('Setting', prop, 'to', value, 'with target', target);
		// 		if (prop === 'id') {
		// 			target['id'] = value as InventoryKeysType;
		// 		}

		// 		return true;
		// 	}
		// };

		for (let i = 0; i < INVENTORY_SIZE; i++) {
			this.#quickslotItems.push({ slotId: i, id: EMPTY_HAND });
		}
		this.#quickslotItems[1].id = 'machete';

		this.#inventoryItems.push({
			id: 'machete',
			colIdx: 0,
			rowIdx: 0
		});
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

	public get quickSlotSelectedItem(): QuickSlotItem {
		return this.#quickslotItems[this.selectedSlot];
	}

	public get quickslotItems(): QuickSlotItem[] {
		return this.#quickslotItems;
	}

	public get inventoryItems(): InventoryItem[] {
		return this.#inventoryItems;
	}

	public addItemToQuickSlot(groundItemKey: ItemTypeMethodsRecordType): boolean {
		for (const slot of this.#quickslotItems) {
			if (slot.id !== EMPTY_HAND) continue;
			slot.id = groundItemKey;
			return true;
		}
		return false;
	}

	public setInventoryItems(items: InventoryItem[]) {
		this.#inventoryItems = items;
	}

	public addItemToInventory(
		groundItemKey: ItemTypeMethodsRecordType,
		[row, col]: [number, number]
	): void {
		const inventoryItem = {
			id: groundItemKey,
			colIdx: col,
			rowIdx: row
		};
		this.#inventoryItems.push(inventoryItem);
	}
}

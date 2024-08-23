import type { InventoryKeys } from "../item/inventory/items-record";

const INVENTORY_SIZE = 5;

type InventoryItem = {
  id?: InventoryKeys;
  slotId: number;
}

class Inventory {
  items: InventoryItem[] = [];
  #selectedSlot: number = $state(0);

  constructor() {
    for (let i = 0; i < INVENTORY_SIZE; i++) {
      this.items.push({ slotId: i, id: "fist" });
    }
    this.items[1].id = "machete";
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
}

const inventory = new Inventory();
export default inventory;
const INVENTORY_SIZE = 5;

type InventoryItem = {
  id: string;
  slotId: number;
}

class Inventory {
  items: InventoryItem[] = [];

  constructor() {
    this.items = Array(INVENTORY_SIZE).fill(null);
  }
}

const inventory = new Inventory();
export default inventory;
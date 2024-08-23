type InventoryItem = {
  displayName: string;
  image: string;
}

export type InventoryKeys = "machete" | "fist"

type InventoryItemsRecord = Record<InventoryKeys, InventoryItem>;

export const inventoryItemsRecord: InventoryItemsRecord = {
  "fist": {
    displayName: "Fist",
    image: "/models/images/inventory/fist.png"
  },
  "machete": {
    displayName: "Machete",
    image: "/models/images/inventory/machete.png"
  }
}
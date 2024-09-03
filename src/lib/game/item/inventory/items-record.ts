import { itemsToPreload } from '$lib/game/general/PreloadService.svelte';

export type InventoryItem = {
	displayName: string;
	quickslotImage: string;
	inventoryImage: string;
	size: [number, number];
	description?: string;
};

export const EMPTY_HAND = 'fist';

export const InventoryKeys = [EMPTY_HAND, ...itemsToPreload] as const;
export type InventoryKeysType = (typeof InventoryKeys)[number];

type InventoryItemsRecord = Record<InventoryKeysType, InventoryItem>;

export const inventoryItemsRecord: InventoryItemsRecord = {
	[EMPTY_HAND]: {
		displayName: 'Fist',
		quickslotImage: '/models/images/inventory-quickslot/fist.png',
		inventoryImage: '/models/images/inventory-quickslot/fist.png',
		size: [1, 1],
		description: 'Your bare hands. Not very effective, but better than nothing.'
	},
	machete: {
		displayName: 'Machete',
		quickslotImage: '/models/images/inventory-quickslot/machete.png',
		inventoryImage: '/models/images/inventory-expanded/machete.png',
		size: [2, 1],
		description:
			'Sharp close-range weapon used primarly for cutting down bushes and trees. Can be used differently though.'
	}
};

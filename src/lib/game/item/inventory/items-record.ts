import type { ItemsToPreloadOptions } from '$lib/game/general/PreloadService.svelte';

type InventoryItem = {
	displayName: string;
	image: string;
	description?: string;
};

export type InventoryKeys = 'fist' | ItemsToPreloadOptions;

type InventoryItemsRecord = Record<InventoryKeys, InventoryItem>;

export const inventoryItemsRecord: InventoryItemsRecord = {
	fist: {
		displayName: 'Fist',
		image: '/models/images/inventory/fist.png'
	},
	machete: {
		displayName: 'Machete',
		image: '/models/images/inventory/machete.png',
		description:
			'Sharp close-range weapon used primarly for cutting down bushes and trees. Can be used differently though.'
	}
};

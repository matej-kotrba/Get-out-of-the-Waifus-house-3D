<script context="module" lang="ts">
	export type Inventory = {
		slots: InventorySlot[];
	};

	export type InventorySlot = {
		name: string;
		displayName: string;
		quantity: number;
	};
</script>

<script lang="ts">
	// type Props = {
	// 	inventory: Inventory;
	// 	currentlySelectedSlotIndex: number;
	// };

	// const { inventory, currentlySelectedSlotIndex }: Props = $props();
</script>

<div class="absolute left-0 top-0 bg-red-500">asdalskd</div>

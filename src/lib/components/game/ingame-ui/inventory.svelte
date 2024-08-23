<script lang="ts">
	import inventory from '$lib/game/inventory/Inventory';
	import { inventoryItemsRecord } from '$lib/game/item/inventory/items-record';
</script>

<div
	class="fixed bottom-0 right-0 flex items-end"
	style="width: {inventory['items'].length * 75}px;"
>
	{#each inventory['items'] as slot}
		{#if slot.id}
			{@const record = inventoryItemsRecord[slot.id]}
			<div class="basis-0" style="flex-grow: {inventory.selectedSlot === slot.slotId ? '2' : '1'};">
				<img src={record.image} alt={record.displayName} />
			</div>
		{/if}
	{/each}
</div>

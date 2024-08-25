<script lang="ts">
	import player from '$lib/game/characters/player/Player.svelte';
	import { inventoryItemsRecord } from '$lib/game/item/inventory/items-record';
</script>

{#if player.inventory}
	<div
		class="fixed bottom-0 right-0 flex items-end"
		style="width: {player.inventory['items'].length * 75}px;"
	>
		{#each player.inventory['items'] as slot}
			{#if slot.id}
				{@const record = inventoryItemsRecord[slot.id]}
				<div
					class="basis-0"
					style="flex-grow: {player.inventory.selectedSlot === slot.slotId
						? '2'
						: '1'};"
				>
					<img src={record.image} alt={record.displayName} />
				</div>
			{/if}
		{/each}
	</div>
{/if}

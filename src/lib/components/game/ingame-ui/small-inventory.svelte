<script lang="ts">
	import player from '$lib/game/characters/player/Player.svelte';
	import { inventoryItemsRecord } from '$lib/game/item/inventory/items-record';
</script>

{#if player.inventory?.selectedSlot !== undefined}
	<div
		class="fixed bottom-0 right-0 flex items-end"
		style="width: {player.inventory['items'].length * 70}px;"
	>
		{#each player.inventory['items'] as slot}
			{#if slot.id}
				{@const record = inventoryItemsRecord[slot.id]}
				<div
					class="basis-0 duration-100"
					class:gradient-effect={player.inventory.selectedSlot === slot.slotId}
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

<style>
	.gradient-effect {
		background-image: linear-gradient(
			180deg,
			transparent,
			rgba(244, 201, 7, 0.852) 100%
		);
	}
</style>

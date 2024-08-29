<script lang="ts">
	import type { Options } from '@sveltejs/vite-plugin-svelte';
	import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';

	const FLIP_DURATION = 200;

	let itemsInInventory = $state([]);

	let optionsInventory = $derived({
		items: itemsInInventory,
		flipDurationMs: FLIP_DURATION,
		dropFromOthersDisabled: true
	}) as Options;

	function handleDnd(e: any) {
		itemsInInventory = e.detail.items;
	}
</script>

<div
	use:dndzone={optionsInventory}
	onconsider={handleDnd}
	onfinalize={handleDnd}
	style={itemsInInventory.find((tile) => tile[SHADOW_ITEM_MARKER_PROPERTY_NAME])
		? 'background: rgba(255, 255, 255, 0.2)'
		: ''}
	class="aspect-square rounded-lg bg-pink-500"
></div>

<script lang="ts">
	import {
		dndzone,
		SHADOW_ITEM_MARKER_PROPERTY_NAME,
		type Options
	} from 'svelte-dnd-action';

	const FLIP_DURATION = 200;

	let items = $state([]);

	let options = $derived({
		items,
		flipDurationMs: FLIP_DURATION,
		dropFromOthersDisabled: items.length
	}) as Options;

	function handleDnd(e: any) {
		items = e.detail.items;
	}
</script>

<div
	style={items.find((tile) => tile[SHADOW_ITEM_MARKER_PROPERTY_NAME])
		? 'background: rgba(255, 255, 255, 0.2)'
		: ''}
	use:dndzone={options}
	onconsider={handleDnd}
	onfinalize={handleDnd}
	class="aspect-square rounded-lg bg-pink-500"
>
	{#each items as tile (tile.id)}
		{tile.letter}
	{/each}
</div>

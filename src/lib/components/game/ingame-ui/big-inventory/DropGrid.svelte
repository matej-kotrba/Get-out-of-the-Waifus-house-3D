<script lang="ts">
	import {
		dndzone,
		SHADOW_ITEM_MARKER_PROPERTY_NAME,
		type Options
	} from 'svelte-dnd-action';
	import Slot from './Slot.svelte';
	import type { Item } from './big-inventory.svelte';
	import Empty from './Empty.svelte';

	type Props = {
		inventorySize: number;
		tileSize?: [number, number];
	};

	const { inventorySize, tileSize }: Props = $props();

	const boardGrid = $derived(
		Array.from({ length: inventorySize }, (_, i) =>
			Array.from({ length: inventorySize }, (_, j) => ({ id: i * 15 + j }))
		)
	);

	const FLIP_DURATION = 200;

	let items = $state<Item[]>([]);

	let options = $derived({
		items,
		flipDurationMs: FLIP_DURATION
	}) as Options;

	function handleDnd(e: any) {
		items = e.detail.items;
	}

	function getTileX() {
		return tileSize ? tileSize[0] : 1;
	}

	function getTileY() {
		return tileSize ? tileSize[1] : 1;
	}
</script>

<div
	class="inventory-split__tiles absolute inset-0 max-w-[50rem] bg-[#00000050] p-2"
	style="opacity: {tileSize ? 1 : 0};"
>
	{#each boardGrid as col, index}
		{#each col as square, index1 (index1)}
			<div class="relative h-full w-full rounded-lg">
				{#if index === 1 && index1 === 2}
					<div
						use:dndzone={options}
						onconsider={handleDnd}
						onfinalize={handleDnd}
						class="absolute border-2 border-yellow-400"
						style="width: calc({100 * getTileX()}% + {0.5 *
							(getTileX() - 1)}rem); height: calc({100 * getTileY()}% + {0.5 *
							(getTileY() - 1)}rem); {items.find(
							(tile) => tile[SHADOW_ITEM_MARKER_PROPERTY_NAME]
						)
							? 'background: rgba(255, 255, 255, 0.2)'
							: ''}"
					>
						<Empty />
					</div>
				{/if}
			</div>
		{/each}
	{/each}
</div>

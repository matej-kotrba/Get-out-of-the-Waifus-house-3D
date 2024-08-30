<script context="module" lang="ts">
	export type Item = {
		id: number;
		name: string;
		size: [number, number];
		isDndShadowItem?: boolean;
	};
</script>

<script lang="ts">
	import { dndzone, type Options } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import Slot from './Slot.svelte';
	import DropGrid from './DropGrid.svelte';
	import { on } from 'svelte/events';
	import OutsideTile from './OutsideTile.svelte';

	const INVENTORY_SIZE = 8;
	const FLIP_DURATION = 200;

	let idx = 0;

	let items = $state<Item[]>([
		{ id: idx++, name: 'A', size: [1, 1] },
		{ id: idx++, name: 'B', size: [2, 1] },
		{ id: idx++, name: 'C', size: [1, 2] },
		{ id: idx++, name: 'D', size: [2, 2] },
		{ id: idx++, name: 'E', size: [3, 2] },
		{ id: idx++, name: 'F', size: [2, 3] }
	]);

	let options = $derived({
		items,
		flipDurationMs: FLIP_DURATION,
		morphDisabled: true,
		centreDraggedOnCursor: true
	}) as Options;

	function handleDnd(e: any) {
		items = e.detail.items;
	}

	const boardGrid = Array.from({ length: INVENTORY_SIZE }, (_, i) =>
		Array.from({ length: INVENTORY_SIZE }, (_, j) => ({ id: i * 15 + j }))
	);

	let currentlyDraggedItem = $state<Item | null>(null);

	function handleDragStart(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLDivElement;
		},
		item: Item
	) {
		currentlyDraggedItem = item;
	}

	function endDragEvent() {
		currentlyDraggedItem = null;
	}
</script>

<svelte:window on:mouseup={endDragEvent} />

<section
	class="absolute inset-0 bg-[#00000055] p-8"
	style="--inventory-size: {INVENTORY_SIZE};"
>
	<div
		class="inventory-split h-full w-full rounded-2xl border-8 border-indigo-900 bg-indigo-600"
	>
		<div class="relative h-fit max-w-[50rem]">
			<div class="inventory-split__tiles aspect-square p-2">
				{#each boardGrid as col, index}
					{#each col as square, index2}
						<div class="h-full w-full">
							<Slot />
						</div>
					{/each}
				{/each}
			</div>
			<DropGrid
				inventorySize={INVENTORY_SIZE}
				tileSize={currentlyDraggedItem?.size}
			/>
		</div>
		<!-- svelte-ignore event_directive_deprecated -->
		<div use:dndzone={options} on:consider={handleDnd} on:finalize={handleDnd}>
			{#each items as item (item.id)}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					animate:flip={{ duration: FLIP_DURATION }}
					on:mousedown={(e) => handleDragStart(e, item)}
					class="w-fit"
				>
					<OutsideTile {item} />
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.inventory-split {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 2rem;
	}

	:global(.inventory-split__tiles) {
		display: grid;
		grid-template-columns: repeat(var(--inventory-size), 1fr);
		grid-template-rows: repeat(var(--inventory-size), 1fr);
		grid-auto-rows: max-content;
		gap: 0.5rem;
		overflow-y: auto;
	}
</style>

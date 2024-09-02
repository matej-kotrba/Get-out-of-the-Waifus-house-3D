<script context="module" lang="ts">
	export type Item = {
		id: number;
		name: string;
		size: [number, number];
	};
</script>

<script lang="ts">
	import { DragAndDropContext } from './dropzone.svelte';

	const INVENTORY_SIZE = 8;
	let inventoryGrid: HTMLElement | null = $state(null);
	let inventoryGridWidth = $derived.by(() => {
		if (!inventoryGrid) return;
		const rect = inventoryGrid.getBoundingClientRect();
		return rect.width / INVENTORY_SIZE;
	});

	const draggableItems: { name: string; size: [number, number] }[] = $state([
		{
			name: 'Item 1',
			size: [1, 1]
		},
		{
			name: 'Item 2',
			size: [2, 1]
		},
		{
			name: 'Item 3',
			size: [2, 2]
		}
	]);

	const context = new DragAndDropContext<{
		name: string;
	}>([], INVENTORY_SIZE);
	const { draggable, draggedNode, dropzone } = context.get();

	const boardGrid = Array.from({ length: INVENTORY_SIZE }, (_, i) =>
		Array.from({ length: INVENTORY_SIZE }, (_, j) => ({ id: i * 15 + j }))
	);
</script>

<section
	class="absolute inset-0 bg-[#00000055] p-8"
	style="--inventory-size: {INVENTORY_SIZE};"
>
	<div
		class="inventory-split h-full w-full rounded-2xl border-8 border-indigo-900 bg-indigo-600"
	>
		<div bind:this={inventoryGrid} class="relative h-fit max-w-[50rem]">
			<div class="inventory-split__tiles aspect-square p-2">
				{#each boardGrid as col, idxRow}
					{#each col as square, idxCol}
						{@const isRelated = context.items.find(
							(item) => item.id === `${idxRow}${idxCol}`
						)?.relatesTo}
						{@const size = context.items.find(
							(item) => item.id === `${idxRow}${idxCol}`
						)?.size}
						<div
							use:dropzone={{
								id: `${idxRow}${idxCol}`,
								addClassesOnDragStart: ['!border-yellow-500'],
								itemsInDropzoneLimit: 1,
								onDragEnterClasses: ['bg-pink-600']
							}}
							class="h-full w-full border-2 border-slate-400 bg-pink-500 duration-100"
							style={`${isRelated ? 'display: none;' : ''};${size ? `grid-column: span ${size[0]}; grid-row: span ${size[1]}` : ''}`}
						></div>
						<!-- {#if idxRow === 1 && idxCol === 4}
								<div
									class="w-fit border border-white p-2 text-xl"
									use:draggable={{
										id: `${idxRow}${idxCol}`,
										item: { name: 'halooo' },
										originalNodeClassesOnDrag: ['opacity-0'],
										size: [1, 1]
									}}
								>
									xd
								</div>
							{/if} -->
						<!-- <div class="absolute border-2 border-yellow-400" style="width: calc({100 * getTileX()}% + {0.5 *
							(getTileX() - 1)}rem); height: calc({100 * getTileY()}% + {0.5 *
							(getTileY() - 1)}rem);">

						</div> -->
					{/each}
				{/each}
			</div>
		</div>
		<div>
			{#each draggableItems as item}
				<div
					class="h-full w-full border border-white text-xl"
					style="width: {inventoryGridWidth
						? item.size[0] * inventoryGridWidth + 'px'
						: 'auto'}; height: {inventoryGridWidth
						? item.size[1] * inventoryGridWidth + 'px'
						: 'auto'}"
					use:draggable={{
						item: { name: item.name },
						originalNodeClassesOnDrag: ['opacity-0'],
						pixelSize: inventoryGridWidth
							? {
									width: item.size[0] * inventoryGridWidth - 2 - 4,
									height: item.size[1] * inventoryGridWidth - 2 - 4
								}
							: undefined,
						// draggedNodeClassed: inventoryGridWidth
						// 	? [
						// 			`max-w-[${item.size[0] * inventoryGridWidth}px]`,
						// 			`max-h-[${item.size[1] * inventoryGridWidth}px]`
						// 		]
						// 	: [],
						size: item.size
					}}
				></div>
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
		overflow-y: auto;
	}
</style>

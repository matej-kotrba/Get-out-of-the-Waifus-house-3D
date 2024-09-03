<script lang="ts">
	import type { InventoryItem } from '$lib/game/item/inventory/items-record';
	import { DragAndDropContext } from './dropzone.svelte';

	const INVENTORY_SIZE = 8;
	let inventoryGrid: HTMLElement | null = $state(null);
	let inventoryGridWidth = $derived.by(() => {
		if (!inventoryGrid) return;
		const rect = inventoryGrid.getBoundingClientRect();
		return rect.width / INVENTORY_SIZE;
	});

	const draggableItemsInInventory: InventoryItem[] = $state([]);

	const draggableItemsOnGround: InventoryItem[] = $state([
		{
			displayName: 'Item 1',
			size: [2, 1],
			quickslotImage: '/models/images/inventory-quickslot/machete.png',
			inventoryImage: '/models/images/inventory-expanded/machete.png'
		}
	]);

	const context = new DragAndDropContext<{
		name: string;
	}>([], INVENTORY_SIZE);
	const { draggable, draggedNode, dropzone } = context.get();

	const boardGrid = Array.from({ length: INVENTORY_SIZE }, (_, i) =>
		Array.from({ length: INVENTORY_SIZE }, (_, j) => ({ id: i * 15 + j }))
	);

	function getTileSizeExcludingBorders(
		sizeMultplier: number,
		inventoryGridWidth: number
	) {
		return sizeMultplier * inventoryGridWidth - 2 - 4;
	}
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
							class="h-full w-full select-none border-2 border-slate-400 bg-pink-500 duration-100"
							style={`${isRelated ? 'display: none;' : ''};${size ? `grid-column: span ${size[0]}; grid-row: span ${size[1]}` : ''}`}
						></div>
					{/each}
				{/each}
			</div>
		</div>
		<div>
			{#each draggableItemsOnGround as item}
				<div
					class="h-full w-full cursor-grab select-none border border-white text-xl"
					style="width: {inventoryGridWidth
						? getTileSizeExcludingBorders(item.size[0], inventoryGridWidth) +
							'px'
						: 'auto'}; height: {inventoryGridWidth
						? getTileSizeExcludingBorders(item.size[1], inventoryGridWidth) +
							'px'
						: 'auto'}"
					use:draggable={{
						item: { name: item.displayName },
						originalNodeClassesOnDrag: ['opacity-0'],
						pixelSize: inventoryGridWidth
							? {
									width: getTileSizeExcludingBorders(
										item.size[0],
										inventoryGridWidth
									),
									height: getTileSizeExcludingBorders(
										item.size[1],
										inventoryGridWidth
									)
								}
							: undefined,
						size: item.size
					}}
				>
					<img
						src={item.inventoryImage}
						alt={item.displayName}
						class="pointer-events-none h-full w-full object-cover"
					/>
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
		overflow-y: auto;
	}
</style>

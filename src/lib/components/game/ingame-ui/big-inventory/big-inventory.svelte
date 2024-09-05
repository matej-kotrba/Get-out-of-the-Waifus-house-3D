<script lang="ts">
	import {
		inventoryItemsRecord,
		type InventoryItem
	} from '$lib/game/item/inventory/items-record';
	import { DragAndDropContext } from './dropzone.svelte';
	import player from '$lib/game/characters/player/Player.svelte';
	import type { ItemTypeMethodsRecordType } from '$lib/game/item/ground/GroundItem';

	type InventoryItemInInventory = InventoryItem & {
		itemKey: ItemTypeMethodsRecordType;
		colIdx: number;
		rowIdx: number;
	};

	const INVENTORY_SIZE = 6;
	let inventoryGrid: HTMLElement | null = $state(null);
	let inventoryGridWidth = $derived.by(() => {
		if (!inventoryGrid) return;
		const rect = inventoryGrid.getBoundingClientRect();
		return rect.width / INVENTORY_SIZE;
	});

	const draggableItemsInInventory: InventoryItemInInventory[] = player.inventory
		? player.inventory?.inventoryItems.map((item) => {
				return {
					...item,
					...inventoryItemsRecord[item.id],
					itemKey: item.id as ItemTypeMethodsRecordType
				};
			})
		: [];

	// [
	// 	{
	// 		displayName: 'Item 1',
	// 		size: [2, 1],
	// 		quickslotImage: '/models/images/inventory-quickslot/machete.png',
	// 		inventoryImage: '/models/images/inventory-expanded/machete.png',
	// 		colIdx: 1,
	// 		rowIdx: 2
	// 	}
	// ];

	const draggableItemsOnGround: (InventoryItem & {
		itemKey: ItemTypeMethodsRecordType;
	})[] = [
		{
			itemKey: 'machete',
			displayName: 'Item 1',
			size: [2, 1],
			quickslotImage: '/models/images/inventory-quickslot/machete.png',
			inventoryImage: '/models/images/inventory-expanded/machete.png'
		}
	];

	const context = new DragAndDropContext<{
		id: ItemTypeMethodsRecordType;
		name: string;
	}>(
		draggableItemsInInventory.map((item) => {
			return {
				id: `${item.rowIdx}${item.colIdx}`,
				size: item.size,
				relatesTo: undefined,
				item: { name: item.displayName, id: item.itemKey }
			};
		}),
		INVENTORY_SIZE
	);
	const { draggable, dropzone } = context.get();

	const boardGrid = Array.from({ length: INVENTORY_SIZE }, (_, i) =>
		Array.from({ length: INVENTORY_SIZE }, (_, j) => ({ id: i * 15 + j }))
	);

	function getTileSizeExcludingBorders(
		sizeMultplier: number,
		inventoryGridWidth: number
	) {
		return sizeMultplier * inventoryGridWidth - 2 - 4;
	}

	$effect(() => {
		context.draggedNode;
		player.inventory?.setInventoryItems(
			context.items
				.filter((item) => Boolean(item.item))
				.map((item) => {
					return {
						colIdx: Number(item.id[1]),
						rowIdx: Number(item.id[0]),
						id: item.item!.id
					};
				})
		);
	});
</script>

<div
	class="inventory-split h-full w-full rounded-2xl border-8 border-indigo-900 bg-indigo-600"
	style="--inventory-size: {INVENTORY_SIZE};"
>
	<div bind:this={inventoryGrid} class="relative h-fit max-w-[50rem]">
		<div class="inventory-split__tiles aspect-square p-2">
			{#each boardGrid as col, idxRow (idxRow)}
				{#each col as square, idxCol (idxCol)}
					{@const isRelated = context.items.find(
						(item) => item.id === `${idxRow}${idxCol}`
					)?.relatesTo}
					{@const size = context.items.find(
						(item) => item.id === `${idxRow}${idxCol}`
					)?.size}
					{@const item = draggableItemsInInventory.find(
						(item) => item.colIdx === idxCol && item.rowIdx === idxRow
					)}
					<div
						use:dropzone={{
							id: `${idxRow}${idxCol}`,
							addClassesOnDragStart: ['!border-yellow-500'],
							itemsInDropzoneLimit: 1,
							onDragEnterClasses: ['bg-pink-600']
						}}
						class="h-full w-full select-none border-2 border-slate-400 bg-pink-500 duration-100"
						style={`${isRelated ? 'display: none;' : ''};${size ? `grid-column: span ${size[0]}; grid-row: span ${size[1]}` : ''}`}
					>
						{#if item}
							<div
								class="h-full w-full cursor-grab select-none border border-white text-xl"
								style="width: {inventoryGridWidth
									? getTileSizeExcludingBorders(
											item.size[0],
											inventoryGridWidth
										) + 'px'
									: 'auto'}; height: {inventoryGridWidth
									? getTileSizeExcludingBorders(
											item.size[1],
											inventoryGridWidth
										) + 'px'
									: 'auto'}"
								use:draggable={{
									id: `${idxRow}${idxCol}`,
									item: { name: item.displayName, id: item.itemKey },
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
						{/if}
					</div>
				{/each}
			{/each}
		</div>
	</div>
	<div>
		{#each draggableItemsOnGround as item}
			<div
				class="h-full w-full cursor-grab select-none border border-white text-xl"
				style="width: {inventoryGridWidth
					? getTileSizeExcludingBorders(item.size[0], inventoryGridWidth) + 'px'
					: 'auto'}; height: {inventoryGridWidth
					? getTileSizeExcludingBorders(item.size[1], inventoryGridWidth) + 'px'
					: 'auto'}"
				use:draggable={{
					item: { name: item.displayName, id: item.itemKey },
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

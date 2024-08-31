<script context="module" lang="ts">
	export type Item = {
		id: number;
		name: string;
		size: [number, number];
	};
</script>

<script lang="ts">
	import { createDragAndDropContext } from './dropzone';

	const INVENTORY_SIZE = 8;

	let draggedItemSize: [number, number] = [1, 1];
	const draggableItems: { id: string; name: string }[] = $state([
		{
			id: '1',
			name: 'Item 1'
		},
		{
			id: '2',
			name: 'Item 2'
		},
		{
			id: '3',
			name: 'Item 3'
		}
	]);

	const { draggable, draggedNode, dropzone } =
		createDragAndDropContext(draggableItems);

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
		<div class="relative h-fit max-w-[50rem]">
			<div class="inventory-split__tiles aspect-square p-2">
				{#each boardGrid as col, index}
					{#each col as square, index2}
						<div
							use:dropzone={{
								addClassesOnDragStart: ['border-yellow-500', 'border-4'],
								itemsInDropzoneLimit: 1
							}}
							class="h-full w-full rounded-lg bg-pink-500 duration-100"
						>
							<!-- <div class="absolute border-2 border-yellow-400" style="width: calc({100 * getTileX()}% + {0.5 *
							(getTileX() - 1)}rem); height: calc({100 * getTileY()}% + {0.5 *
							(getTileY() - 1)}rem);">

						</div> -->
						</div>
					{/each}
				{/each}
			</div>
		</div>
		<div>
			{#each draggableItems as item}
				<div
					class="w-fit border border-white p-2 text-xl"
					use:draggable={{
						originalNodeClassesOnDrag: ['opacity-0'],
						itemId: item.id
					}}
				>
					{item.name}
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

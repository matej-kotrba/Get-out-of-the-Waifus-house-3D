<script context="module" lang="ts">
	export type Item = {
		id: number;
		name: string;
	};
</script>

<script lang="ts">
	import {
		dndzone,
		SHADOW_ITEM_MARKER_PROPERTY_NAME,
		type Options
	} from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	const INVENTORY_SPACE = 50;
	const FLIP_DURATION = 200;

	let itemsOnGround: Item[] = $state([
		{ id: 1, name: 'lol' },
		{ id: 2, name: 'lol2' },
		{ id: 3, name: 'lol3' }
	]);

	let optionsOnGround = $derived({
		items: itemsOnGround,
		flipDurationMs: FLIP_DURATION,
		morphDisabled: true
	});

	function handleDnd(e: any) {
		itemsOnGround = e.detail.items;
	}
</script>

<section class="absolute inset-0 bg-[#00000055] p-8">
	<div
		class="inventory-split h-full w-full rounded-2xl border-8 border-indigo-900 bg-indigo-600"
	>
		<div class="inventory-split__tiles p-2">
			{#each itemsInInventory as space (space.id)}{/each}
		</div>
		<div
			use:dndzone={optionsOnGround}
			onconsider={handleDnd}
			onfinalize={handleDnd}
		>
			{#each itemsOnGround as item (item.id)}
				<div animate:flip={{ duration: FLIP_DURATION }}>
					<div class="border border-white p-6">
						{item.name}
					</div>
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

	.inventory-split__tiles {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
		grid-auto-rows: max-content;
		gap: 1rem;
		overflow-y: auto;
	}
</style>

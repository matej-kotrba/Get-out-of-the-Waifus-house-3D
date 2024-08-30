<script context="module" lang="ts">
	export type Item = {
		id: number;
		name: string;
		isDndShadowItem?: boolean;
	};
</script>

<script lang="ts">
	import { dndzone, type Options } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import Slot from './Slot.svelte';

	const INVENTORY_SPACE = 50;
	const FLIP_DURATION = 200;

	let idx = 0;

	let items = $state<Item[]>([
		{ id: idx++, name: 'A' },
		{ id: idx++, name: 'B' },
		{ id: idx++, name: 'C' },
		{ id: idx++, name: 'D' },
		{ id: idx++, name: 'E' },
		{ id: idx++, name: 'F' },
		{ id: idx++, name: 'G' }
	]);

	let options = $derived({
		items,
		flipDurationMs: FLIP_DURATION,
		morphDisabled: true
	}) as Options;

	function handleDnd(e: any) {
		items = e.detail.items;
	}

	const boardGrid = Array.from({ length: 15 }, (_, i) =>
		Array.from({ length: 15 }, (_, j) => ({ id: i * 15 + j }))
	);
</script>

<section class="absolute inset-0 bg-[#00000055] p-8">
	<div
		class="inventory-split h-full w-full rounded-2xl border-8 border-indigo-900 bg-indigo-600"
	>
		<div class="inventory-split__tiles p-2">
			{#each boardGrid as col}
				<div class="col">
					{#each col as square}
						<Slot />
					{/each}
				</div>
			{/each}
		</div>
		<div use:dndzone={options} onconsider={handleDnd} onfinalize={handleDnd}>
			{#each items as item (item.id)}
				<div animate:flip={{ duration: FLIP_DURATION }} class="w-fit">
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

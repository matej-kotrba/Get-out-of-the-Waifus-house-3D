<script lang="ts">
	const INVENTORY_SPACE = 50;
</script>

<section class="absolute inset-0 bg-[#00000055] p-8">
	<div
		class="inventory-split h-full w-full rounded-2xl border-8 border-indigo-900 bg-indigo-600"
	>
		<div class="inventory-split__tiles p-2">
			{#each Array.from(Array(INVENTORY_SPACE).keys()) as space}
				<div class="aspect-square rounded-lg bg-pink-500"></div>
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

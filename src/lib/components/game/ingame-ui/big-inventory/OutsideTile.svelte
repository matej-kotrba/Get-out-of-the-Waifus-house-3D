<script lang="ts">
	import type { Item } from './big-inventory.svelte';

	type Props = {
		item: Item;
	};

	const { item }: Props = $props();
</script>

<div class="border border-white p-6">
	{item.name}
</div>

<script lang="ts">
	import type { Item } from './big-inventory.svelte';

	type Props = {
		item: Item;
	};

	const { item }: Props = $props();

	console.log(item.id);
</script>

<div
	class="grid h-full w-full place-content-center rounded-lg bg-white text-black"
>
	{item.name}
</div>

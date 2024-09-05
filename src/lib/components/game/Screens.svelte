<script lang="ts">
	import BigInventory from './ingame-ui/big-inventory/big-inventory.svelte';
	import screenService, {
		type Screen
	} from '$lib/game/general/ScreenService.svelte';
	import type { Component } from 'svelte';

	$effect(() => {
		console.log(screenService.getScreenToggleStatus('Inventory'));
	});

	const screenComponentToKeyRecord: Record<Screen, Component> = {
		Inventory: BigInventory
	};
</script>

{#each Object.entries(screenComponentToKeyRecord) as [key, value]}
	{#if screenService.getScreenToggleStatus(key as Screen)}
		{#if value}
			<svelte:component this={value} />
		{/if}
	{/if}
{/each}

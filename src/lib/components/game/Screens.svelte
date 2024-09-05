<script lang="ts">
	import BigInventory from './ingame-ui/big-inventory/big-inventory.svelte';
	import updateService from '$lib/game/general/UpdateService';
	import tooltipService from '$lib/game/general/TooltipService';
	import screenService, {
		type Screen
	} from '$lib/game/general/ScreenService.svelte';
	import type { Component } from 'svelte';
	import { fly } from 'svelte/transition';

	const screenComponentToKeyRecord: Record<Screen, Component> = {
		Inventory: BigInventory
	};

	// Stops the game if any screen is open
	$effect(() => {
		if (screenService.isAnyScreenOpened()) {
			updateService.stop();
			tooltipService.clear();
		} else {
			updateService.start();
		}
	});
</script>

{#each Object.entries(screenComponentToKeyRecord) as [key, value]}
	{#if screenService.getScreenToggleStatus(key as Screen)}
		<div transition:fly={{ y: 600, duration: 300 }}>
			{#if value}
				<section
					class="fixed left-0 top-0 z-[1000] h-screen w-screen bg-[#00000055] p-8"
				>
					<svelte:component this={value} />
				</section>
			{/if}
		</div>
	{/if}
{/each}

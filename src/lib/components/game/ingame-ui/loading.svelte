<script lang="ts">
	import preloadService from '$lib/game/general/PreloadService.svelte';
</script>

{#if preloadService && preloadService.isPreloading === true}
	{@const preloadingParts = Object.values(preloadService.preloadedParts)}
	{@const preloadingPartsDoneCount = preloadingParts.filter((part) => part === true).length}
	{@const preloadingPartsCount = preloadingParts.length}
	<div
		class="fixed left-0 top-0 z-10 grid h-screen w-screen place-content-center bg-black text-white"
	>
		<div class="relative h-24 w-80 border border-white">
			<div
				class="h-full bg-white"
				style="width: {(preloadingPartsDoneCount / preloadingPartsCount) * 100}%;"
			></div>
		</div>
	</div>
{/if}

<script lang="ts">
	import preloadMachine from '$lib/game/general/PreloadMachine.svelte';
</script>

{#if preloadMachine && preloadMachine.isPreloading === true}
	<div
		class="fixed left-0 top-0 z-10 grid h-screen w-screen place-content-center bg-black text-white"
	>
		<span class="text-8xl">Loading...</span>
	</div>
{/if}

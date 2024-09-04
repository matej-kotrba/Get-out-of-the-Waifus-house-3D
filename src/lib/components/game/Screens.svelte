<script lang="ts">
	import BigInventory from './ingame-ui/big-inventory/big-inventory.svelte';
	import screenService from '$lib/game/general/ScreenService.svelte';

	$effect(() => {
		console.log(screenService.getScreenToggleStatus('Inventory'));
	});
</script>

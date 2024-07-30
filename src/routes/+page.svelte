<script lang="ts">
	import LandingAnimation from '$lib/components/main-menu/landing-animation.svelte';

	const textToAnimate = 'Get out of the Waifus house';
</script>

<h2 class="text-dancing mt-2 text-center text-6xl font-bold text-white">
	{textToAnimate}
</h2>
<LandingAnimation {textToAnimate} />

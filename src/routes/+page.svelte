<script lang="ts">
	import LandingAnimation from '$lib/components/main-menu/landing-animation.svelte';

	const textToAnimate = 'Some very long text';
</script>

<h2 class="mt-2 text-center text-6xl font-bold text-white">
	{textToAnimate}
</h2>
<LandingAnimation {textToAnimate} />

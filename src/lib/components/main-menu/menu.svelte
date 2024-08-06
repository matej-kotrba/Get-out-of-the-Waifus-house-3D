<script lang="ts">
	import MenuButton from './menu-button.svelte';
</script>

<div class="grid h-screen items-center">
	<div class="h-72 w-full bg-slate-800"></div>

	<section class="mx-auto flex w-fit flex-col items-stretch gap-2 self-start">
		<MenuButton>New game</MenuButton>
		<MenuButton>Levels</MenuButton>
		<MenuButton>About</MenuButton>
	</section>
</div>

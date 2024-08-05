<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';

	type Props = {
		href?: string;
		onClick?: MouseEventHandler<HTMLAnchorElement>;
		class?: string;
		children: any;
	};

	let { children, href, onClick, class: className }: Props = $props();
</script>

<div class="relative">
	<div class="borders">
		<div></div>
		<div></div>
	</div>
	<a {href} onclick={onClick} class={twMerge('px-8 py-4 text-6xl', className)}>
		{@render children()}
	</a>
</div>

<style>
	.borders > div {
		position: absolute;
		width: 100%;
		height: 2px;
		background-color: var(--color-slate-800);
		right: 0;
		transform-origin: right;
	}
</style>

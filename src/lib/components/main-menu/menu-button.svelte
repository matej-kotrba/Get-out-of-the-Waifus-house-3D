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

<a {href} onclick={onClick} class="btn-container relative isolate cursor-pointer text-center">
	<div class="hover-effect"></div>
	<div class="borders">
		<div></div>
		<div></div>
	</div>
	<div class={twMerge('content px-8 py-4 text-6xl', className)}>
		{@render children()}
	</div>
</a>

<style>
	.hover-effect {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		background-color: white;
		z-index: -99;
		transform: scaleX(0);
		transform-origin: left;
		opacity: 0;
		transition:
			transform 0.4s ease,
			opacity 0.4s;
		transition-delay: 0s;
	}

	.btn-container:hover .hover-effect {
		transform: scaleX(1);
		opacity: 1;
		transition-delay: 0.4s;
	}

	.content {
		color: white;
		transition: color 0.3s;
	}

	.btn-container:hover .content {
		color: black;
		transition-delay: 0.4s;
	}

	.borders > div {
		position: absolute;
		width: 100%;
		height: 2px;
		background-color: white;
		right: 0;
		transform-origin: right;
		transform: scaleX(0);
		transition: transform 0.3s cubic-bezier(0.81, 0.285, 0.805, 0.615);
	}

	.borders > div:nth-of-type(1) {
		top: 0;
	}

	.borders > div:nth-of-type(2) {
		bottom: 0;
	}

	.btn-container:hover .borders > div {
		transform: scaleX(1);
	}
</style>

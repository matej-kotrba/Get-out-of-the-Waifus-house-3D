<script lang="ts">
	type Props = {
		textToAnimate: string;
	};

	let { textToAnimate }: Props = $props();

	let titleContainer: HTMLElement | null = null;

	function onLetterEffectAnimationEnd(index: number) {
		setTimeout(() => {
			if (index === textToAnimate.length - 1) {
				titleContainer?.classList.add('dissapear');
			}
		}, 1000);
	}
</script>

<h1
	bind:this={titleContainer}
	class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-9xl font-bold"
>
	{#each textToAnimate as letter, i}
		{#if letter !== ' '}
			<div
				class="letter-appear inline-block"
				style="--letter: {letter}; animation-delay: {i * 0.1}s"
			>
				<span>{letter}</span>
				<div
					class="letter-effect"
					style="animation-delay: {i * 0.1}s"
					on:animationend={() => onLetterEffectAnimationEnd(i)}
				>
					{letter}
				</div>
			</div>
		{:else}
			<span>&nbsp;</span>
		{/if}
	{/each}
</h1>

<style>
	.letter-appear {
		animation: appear 0.5s ease-in-out;
		animation-fill-mode: forwards;
		opacity: 0;
		position: relative;
	}

	.letter-effect {
		position: absolute;
		color: red;
		top: 0;
		left: 0;
		filter: blur(2px);
		animation: letter-effect-appear 1s ease-in-out forwards;
	}

	:global(.dissapear) {
		filter: blur(20px);
		opacity: 0;
		translate: 0 -100%;
		transition: 1.5s ease;
	}

	@keyframes appear {
		from {
			opacity: 0;
			transform: translateX(-100%);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes letter-effect-appear {
		0% {
			opacity: 0;
		}
		40% {
			opacity: 1;
			scale: 4;
		}
		60% {
			opacity: 1;
		}
		80% {
			opacity: 0.5;
			scale: 1;
			filter: blur(2px);
		}
		100% {
			opacity: 1;
			scale: 1;
			filter: blur(0px);
		}
	}
</style>

<script lang="ts">
	type Props = {
		onClick?: (
			e: MouseEvent & {
				currentTarget: EventTarget & HTMLButtonElement;
			}
		) => void;
		children: any;
	};

	let { children, onClick }: Props = $props();
</script>

<button onclick={onClick} type="button" class="border border-white px-8 py-4 text-6xl">
	{@render children()}
</button>

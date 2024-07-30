<script lang="ts">
	type Props = {
		onClick: () => void;
		children: any;
	};

	let { children } = $props();
</script>

<button>
	{@render children()}
</button>

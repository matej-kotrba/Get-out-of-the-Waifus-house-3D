<script lang="ts">
	type Props = {
		onClick: () => void;
	};

	let { children } = $props();
</script>

<button>
	<!-- {@render children()} -->
</button>

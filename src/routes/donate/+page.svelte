<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_URL_DONATE } from '$env/static/public';
	import { onMount } from 'svelte';
	onMount(() => {
		goto(PUBLIC_URL_DONATE);
	});
</script>

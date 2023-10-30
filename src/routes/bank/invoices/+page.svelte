<script lang="ts">
	import { goto } from '$app/navigation';
	import { hideMainButton, showBackButton } from '$lib/utilities';
	import { onMount } from 'svelte';

	onMount(() => {
		showBackButton(() => goto('/bank'));
		hideMainButton();
	});
</script>

<h1>Рахунок-фактури</h1>

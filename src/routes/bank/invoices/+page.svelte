<script lang="ts">
	import { goto } from '$app/navigation';
	import { showBackButton } from '$lib/utilities';
	import { onMount } from 'svelte';

	onMount(() => showBackButton(() => goto('/bank')));
</script>

<h1>Рахунок-фактури</h1>

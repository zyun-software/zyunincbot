<script lang="ts">
	import { goto } from '$app/navigation';
	import { showBackButton } from '$lib/utilities';
	import { onMount } from 'svelte';

	onMount(() => showBackButton(() => goto('/')));
</script>

<div class="p-4">Тут буде допомога, можливо...</div>

<script lang="ts">
	import { hideBackButton, hideMainButton } from '$lib/utilities';
	import { onMount } from 'svelte';
	onMount(() => {
		hideBackButton();
		hideMainButton();
	});
</script>

<div class="h-screen flex justify-center flex-col px-4">
	<div class="text-center text-2xl">⛔️ Ви заблоковані</div>
</div>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { hideMainButton, showBackButton } from '$lib/utilities';
	import { onMount } from 'svelte';

	const button =
		'p-3 w-full block bg-tg-secondary-bg-color hover:bg-tg-button-color text-center rounded';

	onMount(() => {
		showBackButton(() => goto('/'));
		hideMainButton();
	});
</script>

<div class="p-4">
	<blockquote class="mb-4 p-2 rounded border border-tg-hint-color">
		🎰 Ласкаво просимо до нашого казино!
	</blockquote>
	...
</div>

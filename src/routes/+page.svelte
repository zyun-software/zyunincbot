<script lang="ts">
	import { PUBLIC_URL_DONATE } from '$env/static/public';
	import { hideBackButton } from '$lib/utilities';
	import { onMount } from 'svelte';

	const row = 'grid grid-cols-3 gap-2 mb-2';
	const button =
		'p-3 w-full block bg-tg-secondary-bg-color hover:bg-tg-button-color text-center rounded';

	onMount(() => hideBackButton());
</script>

<div class="p-4">
	<div class="{row} mb-2">
		<a href="/bank" class={button}>
			<span class="block mb-2 text-3xl">🏦</span>
			<span>Zyun Банк</span>
		</a>
		<a href="/shop" class={button}>
			<span class="block mb-2 text-3xl">🛍️</span>
			<span>Магазин</span>
		</a>
		<a href="/warehouse" class={button}>
			<span class="block mb-2 text-3xl">📦</span>
			<span>Склад</span>
		</a>
	</div>
	<div class={row}>
		<a href="/help" class={button}>
			<span class="block mb-2 text-3xl">❓</span>
			<span>Допомога</span>
		</a>
		<a href="/api" class={button}>
			<span class="block mb-2 text-3xl">🤖</span>
			<span>API</span>
		</a>
		<a href={PUBLIC_URL_DONATE} class={button}>
			<span class="block mb-2 text-3xl">💸</span>
			<span>Підтримати</span>
		</a>
	</div>
</div>

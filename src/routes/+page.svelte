<script lang="ts">
	import { PUBLIC_URL_DONATE } from '$env/static/public';
	import { hideBackButton, hideMainButton } from '$lib/utilities';
	import { onMount } from 'svelte';

	export let data;

	if (data.business_name && /[а-яА-Я]/.test(data.business_name)) {
		data.business_name = data.business_name.replaceAll('_', ' ');
	}

	const row = 'grid grid-cols-3 gap-2 mb-2';
	const button =
		'p-3 w-full block bg-tg-secondary-bg-color hover:bg-tg-button-color text-center rounded';

	onMount(() => {
		hideBackButton();
		hideMainButton();
	});
</script>

<div class="p-4">
	<blockquote class="mb-4 p-2 rounded border border-tg-hint-color">
		<div>👋 Вітаю, <b>{data.nickname}</b>!</div>
		{#if data.emoji && data.business_name}
			<div>💼 Це бізнес рахунок, <b>{data.emoji} {data.business_name}</b>!</div>
		{/if}
	</blockquote>
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
		<a href="/api" class={button}>
			<span class="block mb-2 text-3xl">🤖</span>
			<span>API</span>
		</a>
		<a href="/help" class={button}>
			<span class="block mb-2 text-3xl">❓</span>
			<span>Допомога</span>
		</a>
		<a href={PUBLIC_URL_DONATE} class={button}>
			<span class="block mb-2 text-3xl">💸</span>
			<span>Підтримати</span>
		</a>
	</div>
	<blockquote class="my-4 text-tg-hint-color text-sm text-center">
		{data.quote}
		<button on:click={() => location.reload()}>🔄</button>
	</blockquote>
</div>

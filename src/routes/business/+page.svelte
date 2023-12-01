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
		🌐 Тут ви можете вести власну справу, купувати або продавати товари та послуги!
	</blockquote>
	<div class="grid grid-cols-3 gap-2 mb-2">
		<a href="/business/shop" class={button}>
			<span class="block mb-2 text-3xl">🛍️</span>
			<span>Магазин</span>
		</a>
		<a href="/business/warehouse" class={button}>
			<span class="block mb-2 text-3xl">📦</span>
			<span>Склад</span>
		</a>
		<a href="/business/order" class={button}>
			<span class="block mb-2 text-3xl">📑</span>
			<span>Чек</span>
		</a>
	</div>
</div>

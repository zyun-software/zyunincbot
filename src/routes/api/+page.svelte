<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_URL_API } from '$env/static/public';
	import { showBackButton } from '$lib/utilities';
	import { onMount } from 'svelte';

	export let data;
	export let form;

	const token = data?.token ?? form?.token ?? '';

	onMount(() => showBackButton(() => goto('/')));
</script>

<div class="p-4">
	<form method="post" action="?/genetateToken" class="mb-4">
		<fieldset class="grid grid-cols-3 items-center mb-2">
			<label for="token">🤖 Токен</label>
			<input
				id="token"
				name="token"
				type="text"
				value={token}
				readonly
				class="p-2 col-span-2 bg-tg-secondary-bg-color rounded w-full"
				placeholder="API токен"
				required
			/>
		</fieldset>
		<button class="w-full p-2 rounded bg-tg-button-color"
			>Згенерувати {token === '' ? '' : 'новий '}токен</button
		>
	</form>
	{#if token.length > 0}
		Переказ коштів
		<pre class="rounded p-2 bg-tg-secondary-bg-color overflow-auto mb-2">
curl --location '{PUBLIC_URL_API}/transfer-money' \
--header 'Token: {token}' \
--header 'Content-Type: application/json' \
--data '&#123;
	"receiver": "Ziozyun",
	"amount": "115",
	"comment": "На цукерки"
&#125;'</pre>
		Створення чеку
		<pre class="rounded p-2 bg-tg-secondary-bg-color overflow-auto mb-2">
curl --location '{PUBLIC_URL_API}/create-invoice' \
--header 'Token: {token}' \
--header 'Content-Type: application/json' \
--data '[
	&#123;
		"name": "Діаманти",
		"price": 200,
		"quantity": 1,
		"description": "Стак діамантів"
	&#125;
]'</pre>
		Перегляд чеку
		<pre class="rounded p-2 bg-tg-secondary-bg-color overflow-auto mb-2">
curl --location '{PUBLIC_URL_API}/find-invoice' \
--header 'Token: {token}' \
--header 'Content-Type: application/json' \
--data '&#123;
	"id": "1"
&#125;'</pre>
	{/if}
</div>

<script lang="ts">
	import { goto } from '$app/navigation';
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
	<div class="rounded p-2 bg-tg-secondary-bg-color mb-2">Переказ коштів</div>
	<div class="rounded p-2 bg-tg-secondary-bg-color mb-2">Створення чеку</div>
	<div class="rounded p-2 bg-tg-secondary-bg-color mb-2">Перегляд чеку</div>
</div>

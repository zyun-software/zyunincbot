<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ProductType } from '$lib/server';
	import { alertUtility, showBackButton } from '$lib/utilities';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	onMount(() => showBackButton(() => goto('/')));

	const basket = writable<ProductType[]>([]);
</script>

<div class="p-4">
	<form
		method="post"
		action="?/add"
		class="mb-4"
		use:enhance={() =>
			({ result, update }) => {
				if (result.status === 200 && result.type === 'success') {
					if (!result.data?.success) {
						alertUtility(result.data?.message);
					} else {
					}

					console.log(result?.data);
				}

				update({
					reset: false
				});
			}}
	>
		<fieldset class="grid grid-cols-3 items-center mb-2">
			<label for="code">#️⃣ Код</label>
			<input
				id="code"
				name="code"
				type="number"
				class="p-2 col-span-2 bg-tg-secondary-bg-color rounded w-full"
				placeholder="Код товару"
				required
			/>
		</fieldset>
		<button class="w-full p-2 rounded bg-tg-button-color">Додати товар в кошик</button>
	</form>
	{#if ($basket ?? []).length === 0}
		<div class="mt-4 text-tg-hint-color text-sm text-center">🧐 Кошик порожній</div>
	{/if}
</div>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ProductType } from '$lib/server';
	import {
		alertUtility,
		confirmUtility,
		hideMainButton,
		showBackButton,
		showMainButton
	} from '$lib/utilities';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	export let form;

	onMount(() => {
		hideMainButton();
		showBackButton(() => goto('/business'));
		basket.subscribe(() => {
			showPayButton();
		});
		if (form?.message) {
			alertUtility(form?.message);
		}
	});

	const basket = writable<ProductType[]>([]);

	let payButton: HTMLButtonElement;

	const addToBasket = (product: any) => {
		basket.update((data) => [product, ...data.filter((item) => item.id !== product.id)]);
	};

	const showPayButton = () => {
		if ($basket.length > 0) {
			const amount = $basket.reduce((accumulator, currentItem) => {
				const product = currentItem.price * currentItem.quantity;
				return accumulator + product;
			}, 0);
			showMainButton(`Придбати товари на суму ${amount} ₴`, () => {
				confirmUtility('❓ Дійсно придбати товари?', (yes) => {
					if (yes) {
						payButton.click();
					}
				});
			});
		} else {
			hideMainButton();
		}
	};
</script>

<form class="hidden" method="post" action="?/pay">
	<input
		type="text"
		name="goods"
		value={JSON.stringify(
			$basket.map((item) => {
				return {
					id: item.id,
					quantity: item.quantity
				};
			})
		)}
	/>
	<button bind:this={payButton} />
</form>

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
						addToBasket(result.data?.product);
					}
				}

				update({
					reset: false
				});
			}}
	>
		<fieldset class="grid grid-cols-3 items-center mb-2">
			<label for="code">#️⃣&nbsp;Код</label>
			<input
				id="code"
				name="code"
				type="number"
				class="p-2 col-span-2 bg-tg-secondary-bg-color rounded w-full"
				placeholder="Код товару"
				required
			/>
		</fieldset>
		<fieldset class="grid grid-cols-3 items-center mb-2">
			<label for="quantity">🔢&nbsp;Кількість</label>
			<input
				id="quantity"
				name="quantity"
				type="number"
				min="1"
				class="p-2 col-span-2 bg-tg-secondary-bg-color rounded w-full"
				placeholder="Кількість товару"
				required
			/>
		</fieldset>
		<button class="w-full p-2 rounded bg-tg-button-color">Додати товар в кошик</button>
	</form>
	{#if $basket.length === 0}
		<div class="mt-4 text-tg-hint-color text-sm text-center">🧐 Кошик порожній</div>
	{:else}
		{#each $basket as { id, name, description, stack, price, quantity }, i}
			<div class="p-3 rounded bg-tg-secondary-bg-color mb-2">
				<table class="w-full table-auto mb-2">
					<tbody>
						<tr>
							<td>🏷️&nbsp;Назва</td>
							<td>{name}{stack > 1 ? ` x${stack}` : ''}</td>
						</tr>
						<tr>
							<td>💰&nbsp;Ціна</td>
							<td>{price} ₴</td>
						</tr>
						<tr>
							<td>🔢&nbsp;Кількість</td>
							<td>{quantity}</td>
						</tr>
						<tr>
							<td>📄&nbsp;Опис</td>
							<td>{description}</td>
						</tr>
					</tbody>
				</table>
				<button
					on:click={() => {
						basket.update((data) => data.filter((_, ind) => ind !== i));
					}}
					class="w-full rounded p-2 bg-red-500"
				>
					Видалити
				</button>
			</div>
		{/each}
	{/if}
</div>

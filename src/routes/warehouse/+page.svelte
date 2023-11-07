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

	export let data;
	export let form;

	let pageData = data?.products ?? form?.products;

	let products = writable<ProductType[]>(pageData?.items ?? []);
	let loadMore = pageData?.more ?? false;

	let selectedInx = -1;
	let filterPage = 1;
	let filterName = form?.name ?? '';

	let active: 'list' | 'add' = 'list';

	let editAction: HTMLInputElement;
	let createButton: HTMLButtonElement;
	let editButton: HTMLButtonElement;
	let loadMoreButton: HTMLButtonElement;
	let filterButton: HTMLButtonElement;

	onMount(() => {
		if (form?.message) {
			alertUtility(form.message);
		}
		showBackButton(() => goto('/'));
	});

	function updateProducts(items: any) {
		products.update((data) => [...data, ...items]);
	}
</script>

<div class="p-4">
	<div class="grid grid-cols-3 gap-2 mb-4">
		<button
			on:click={() => {
				active = 'list';
				hideMainButton();
			}}
			class="p-3 text-center rounded col-span-2 {active === 'list'
				? 'bg-tg-button-color'
				: 'bg-tg-secondary-bg-color hover:bg-tg-button-color'}"
		>
			📑 Ваші товари
		</button>
		<button
			on:click={() => {
				active = 'add';
				showMainButton('Додати товар', () => createButton.click());
			}}
			class="p-3 text-center rounded {active === 'add'
				? 'bg-tg-button-color'
				: 'bg-tg-secondary-bg-color hover:bg-tg-button-color'}"
		>
			📋 Додати
		</button>
	</div>

	{#if active === 'list'}
		<form
			method="post"
			action="?/loadMore"
			use:enhance={() =>
				({ result, update }) => {
					if (result.status === 200 && result.type === 'success') {
						loadMore = !!result.data?.more ?? false;

						selectedInx = -1;

						if (result.data?.items) {
							updateProducts(result.data.items);
						}
					}

					update({
						reset: false
					});
				}}
		>
			<input type="hidden" name="page" value={filterPage} />
			<input type="hidden" name="name" value={filterName} />
			<button class="hidden" bind:this={loadMoreButton} />
		</form>
		<form method="post" action="?/loadList" class="mb-4">
			<button class="hidden" bind:this={filterButton} />
			<fieldset class="grid grid-cols-3 items-center">
				<label for="filter_name">🏷️&nbsp;Назва</label>
				<input
					id="filter_name"
					name="name"
					type="search"
					bind:value={filterName}
					class="p-2 col-span-2 bg-tg-secondary-bg-color rounded w-full"
					placeholder="Назва товару"
					on:input={() =>
						showMainButton('Фільтрувати товари за назвою', () => {
							hideMainButton();
							filterButton.click();
						})}
				/>
			</fieldset>
		</form>

		<section>
			{#if ($products ?? []).length === 0}
				<div class="mt-4 text-tg-hint-color text-sm text-center">
					🧐 {filterName === '' ? 'У вас відсутні товари' : 'Товари за вказаною назвою не знайдено'}
				</div>
			{/if}
			{#each $products ?? [] as { id, name, description, stack, price, quantity }, inx}
				<article class="mb-2 bg-tg-secondary-bg-color p-4 rounded">
					<button
						class="text-left w-full"
						on:click={() => (selectedInx = selectedInx === inx ? -1 : inx)}
					>
						<div class="grid grid-cols-3{selectedInx === inx ? '' : ' mb-2'}">
							<div>#️⃣&nbsp;Код</div>
							<div class="col-span-2">{id}</div>
						</div>
						{#if selectedInx !== inx}
							<div class="grid grid-cols-3">
								<div>🏷️&nbsp;Назва</div>
								<div class="col-span-2">{name}</div>
							</div>
						{/if}
					</button>
					{#if selectedInx === inx}
						<form method="post" action="?/edit" class="mt-2 mb-4">
							<input type="hidden" name="id" value={id} />
							<input type="hidden" name="action" value="edit" bind:this={editAction} />
							<fieldset class="grid grid-cols-3 items-center mb-2">
								<label for="edit_name">🏷️&nbsp;Назва</label>
								<input
									id="edit_name"
									name="name"
									type="search"
									value={name}
									class="p-2 col-span-2 bg-tg-bg-color rounded w-full"
									placeholder="Назва товару"
									required
								/>
							</fieldset>
							<fieldset class="grid grid-cols-3 items-center mb-2">
								<label for="edit_stack">🔢&nbsp;Стак</label>
								<input
									id="edit_stack"
									name="stack"
									type="number"
									value={stack}
									min={1}
									max={64}
									class="p-2 col-span-2 bg-tg-bg-color rounded w-full"
									placeholder="К-ть предметів в товарі"
									required
								/>
							</fieldset>
							<fieldset class="grid grid-cols-3 items-center mb-2">
								<label for="edit_price">💰&nbsp;Ціна</label>
								<input
									type="number"
									id="edit_price"
									name="price"
									value={price}
									min={1}
									class="p-2 col-span-2 bg-tg-bg-color rounded w-full"
									placeholder="Ціна товару"
									required
								/>
							</fieldset>
							<fieldset class="grid grid-cols-3 items-center mb-2">
								<label for="edit_quantity">📦&nbsp;Запас</label>
								<input
									type="number"
									id="edit_quantity"
									name="quantity"
									value={quantity}
									min={0}
									class="p-2 col-span-2 bg-tg-bg-color rounded w-full"
									placeholder="Запас стаків на складі"
									required
								/>
							</fieldset>
							<fieldset class="grid grid-cols-3">
								<label class="mt-2" for="edit_description">📄&nbsp;Опис</label>
								<textarea
									id="edit_description"
									name="description"
									value={description}
									class="p-2 col-span-2 bg-tg-bg-color rounded w-full"
									placeholder="Опис товару"
								/>
							</fieldset>
							<button class="hidden" bind:this={editButton} />
						</form>
						<div class="grid grid-cols-2 gap-2">
							<button
								on:click={() => {
									editAction.value = 'edit';
									editButton.click();
								}}
								class="p-2 rounded bg-green-500">Оновити</button
							>
							<button
								on:click={() => {
									confirmUtility(`❓ Дійсно видалити товар з кодом #️${id}?`, (yes) => {
										if (yes) {
											editAction.value = 'delete';
											editButton.click();
										}
									});
								}}
								class="p-2 rounded bg-red-500">Видалити</button
							>
						</div>
					{/if}
				</article>
			{/each}
			{#if loadMore}
				<button
					on:click={() => {
						filterPage++;

						setTimeout(() => loadMoreButton.click(), 10);
					}}
					class="mt-4 p-3 rounded bg-tg-secondary-bg-color text-center hover:bg-tg-button-color block w-full"
					>🔄 Завантажити ще</button
				>
			{/if}
		</section>
	{:else if active === 'add'}
		<form method="post" action="?/add">
			<fieldset class="grid grid-cols-3 items-center mb-2">
				<label for="create_name">🏷️&nbsp;Назва</label>
				<input
					id="create_name"
					name="name"
					type="search"
					class="p-2 col-span-2 bg-tg-secondary-bg-color rounded w-full"
					placeholder="Назва товару"
					required
				/>
			</fieldset>
			<fieldset class="grid grid-cols-3 items-center mb-2">
				<label for="create_stack">🔢&nbsp;Стак</label>
				<input
					id="create_stack"
					name="stack"
					type="number"
					min={1}
					max={64}
					class="p-2 col-span-2 bg-tg-secondary-bg-color rounded w-full"
					placeholder="К-ть предметів в товарі"
					required
				/>
			</fieldset>
			<fieldset class="grid grid-cols-3 items-center mb-2">
				<label for="create_price">💰&nbsp;Ціна</label>
				<input
					type="number"
					id="create_price"
					name="price"
					min={1}
					class="p-2 col-span-2 bg-tg-secondary-bg-color rounded w-full"
					placeholder="Ціна товару"
					required
				/>
			</fieldset>
			<fieldset class="grid grid-cols-3 items-center mb-2">
				<label for="create_quantity">📦&nbsp;Запас</label>
				<input
					type="number"
					id="create_quantity"
					name="quantity"
					min={0}
					class="p-2 col-span-2 bg-tg-secondary-bg-color rounded w-full"
					placeholder="Запас стаків на складі"
					required
				/>
			</fieldset>
			<fieldset class="grid grid-cols-3">
				<label class="mt-2" for="create_description">📄&nbsp;Опис</label>
				<textarea
					id="create_description"
					name="description"
					class="p-2 col-span-2 bg-tg-secondary-bg-color rounded w-full"
					placeholder="Опис товару"
				/>
			</fieldset>
			<button class="hidden" bind:this={createButton} />
		</form>
	{/if}
</div>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Invoice from '$lib/components/invoice.svelte';
	import type { InvoiceItemType, InvoiceType } from '$lib/server';
	import {
		alertUtility,
		confirmUtility,
		hideMainButton,
		showBackButton,
		showMainButton
	} from '$lib/utilities';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let activeTab: 'list' | 'search' | 'add' = 'list';

	export let data;
	export let form;

	let invoice: InvoiceType | null = null;
	let canDelete: boolean = false;

	let invoices = writable<InvoiceType[]>(data?.invoices?.items ?? []);
	let loadMore = data?.invoices?.more ?? false;
	let loadMoreButton: HTMLButtonElement;

	let page = 1;

	let doForm: {
		action: 'pay' | 'delete' | '';
		id: string;
	} = {
		action: '',
		id: ''
	};

	let doButton: HTMLButtonElement;

	let selectedId = '';

	const emptyPosition: InvoiceItemType = {
		name: '',
		price: 1,
		quantity: 1,
		description: ''
	};

	let createForm: InvoiceItemType = { ...emptyPosition };

	let positions = writable<InvoiceItemType[]>([]);

	let createInvoiceButton: HTMLButtonElement;

	onMount(() => {
		if (form?.message) {
			alertUtility(form.message);
		}
		hideMainButton();
		showBackButton(() => {
			hideMainButton();
			goto('/bank');
		});
	});

	const updateInvoices = (items: any) => {
		invoices.update((data) => [...data, ...items]);
	};

	const setInvoice = (inv: any, canDel: boolean) => {
		invoice = inv;
		canDelete = canDel;
	};
</script>

<div class="p-4">
	<div class="mb-4 grid grid-cols-3 gap-2">
		<button
			on:click={() => {
				invoice = null;
				hideMainButton();
				activeTab = 'list';
			}}
			class="rounded p-3 {activeTab === 'list' ? 'bg-tg-button-color' : 'bg-tg-secondary-bg-color'}"
		>
			📑 Список
		</button>
		<button
			on:click={() => {
				hideMainButton();
				activeTab = 'search';
			}}
			class="rounded p-3 {activeTab === 'search'
				? 'bg-tg-button-color'
				: 'bg-tg-secondary-bg-color'}"
		>
			🔍 Пошук</button
		>
		<button
			on:click={() => {
				invoice = null;
				activeTab = 'add';
			}}
			class="rounded p-3 {activeTab === 'add' ? 'bg-tg-button-color' : 'bg-tg-secondary-bg-color'}"
		>
			📋 Новий
		</button>
	</div>
	{#if activeTab === 'list'}
		<form
			method="post"
			action="?/loadMore"
			class="hidden"
			use:enhance={() =>
				({ result, update }) => {
					if (result.status === 200 && result.type === 'success') {
						loadMore = !!result.data?.more ?? false;

						if (result.data?.items) {
							updateInvoices(result.data.items);
						}
					}

					update({
						reset: false
					});
				}}
		>
			<input type="hidden" name="page" value={page} />
			<button bind:this={loadMoreButton} />
		</form>
		{#if $invoices.length === 0}
			<div class="mt-4 text-tg-hint-color text-sm text-center">🧐 Чеки відсутні</div>
		{:else}
			{#each $invoices as invoice}
				<Invoice {invoice} bind:id={selectedId} />
			{/each}
			{#if loadMore}
				<button
					on:click={() => {
						page++;
						setTimeout(() => loadMoreButton.click(), 10);
					}}
					class="p-3 rounded bg-tg-secondary-bg-color text-center hover:bg-tg-button-color block w-full"
				>
					🔄 Завантажити ще
				</button>
			{/if}
		{/if}
	{:else if activeTab === 'search'}
		<form method="post" class="hidden" action="?/do">
			<input type="text" name="action" bind:value={doForm.action} />
			<input type="number" name="id" bind:value={doForm.id} />
			<button bind:this={doButton} />
		</form>
		{#if invoice === null}
			<form
				method="post"
				action="?/findInvoice"
				use:enhance={() =>
					({ result, update }) => {
						if (result.status === 200 && result.type === 'success') {
							setInvoice(result?.data?.invoice, !!result?.data?.canDelete);
							if (result?.data?.canPay) {
								showMainButton('Оплатити', () => {
									confirmUtility('❓ Дійсно оплатити цей чек?', (yes) => {
										if (yes) {
											doForm.action = 'pay';
											doForm.id = invoice?.id ?? '';
											setTimeout(() => doButton.click(), 10);
										}
									});
								});
							}
							if (!!!result?.data?.invoice) {
								alertUtility('❌ Чек не знайдено');
							}
						}

						update();
					}}
			>
				<fieldset class="grid grid-cols-2 items-center mb-2">
					<label for="code">🆔 Код</label>
					<input
						id="code"
						name="id"
						type="number"
						placeholder="Код"
						class="p-2 rounded bg-tg-secondary-bg-color"
						required
					/>
				</fieldset>
				<button class="p-2 rounded bg-tg-button-color w-full">Знайти</button>
			</form>
		{:else}
			<button
				class="w-full rounded p-2 bg-tg-button-color mb-2"
				on:click={() => {
					invoice = null;
					canDelete = false;
					hideMainButton();
				}}>Знайти інший</button
			>
			<Invoice {invoice} id={invoice.id} />
			{#if canDelete}
				<button
					class="w-full rounded p-2 bg-red-500"
					on:click={() => {
						confirmUtility('❓ Дійсно оплатити цей чек?', (yes) => {
							if (yes) {
								doForm.action = 'delete';
								doForm.id = invoice?.id ?? '';
								setTimeout(() => doButton.click(), 10);
							}
						});
					}}
				>
					Видалити
				</button>
			{/if}
		{/if}
	{:else}
		{#if $positions.length > 0}
			{#each $positions as { name, price, quantity, description }, i}
				<div class="mb-2 bg-tg-secondary-bg-color rounded p-3">
					<div class="grid grid-cols-3 gap-2">
						<div>🏷️ Назва</div>
						<div class="col-span-2">{name}</div>
					</div>
					<div class="grid grid-cols-3 gap-2">
						<div>💰 Ціна</div>
						<div class="col-span-2">{price}</div>
					</div>
					<div class="grid grid-cols-3 gap-2">
						<div>🔢 Кількість</div>
						<div class="col-span-2">{quantity}</div>
					</div>
					<div class="grid grid-cols-3 gap-2 mb-2">
						<div>📄 Опис</div>
						<div class="col-span-2">{description}</div>
					</div>
					<button
						on:click={() => {
							positions.update((data) => {
								const result = data.filter((_, ind) => ind !== i);
								if (result.length === 0) {
									hideMainButton();
								}

								return result;
							});
						}}
						class="rounded p-2 bg-red-500 w-full">Видалити</button
					>
				</div>
			{/each}
		{/if}
		<form action="?/createInvoice" method="post" class="hidden">
			<input type="hidden" name="invoice" value={JSON.stringify($positions)} required />
			<button bind:this={createInvoiceButton} />
		</form>
		<form
			on:submit={() => {
				positions.update((data) => [...data, { ...createForm }]);
				createForm = { ...emptyPosition };
				showMainButton('Виписати чек', () => {
					confirmUtility('❓ Виписати чек за вказаними параметрами?', (yes) => {
						if (yes) {
							createInvoiceButton.click();
						}
					});
				});
			}}
		>
			<fieldset class="grid grid-cols-3 gap-2 items-center mb-2">
				<label for="name">🏷️ Назва</label>
				<input
					id="name"
					type="text"
					bind:value={createForm.name}
					placeholder="Назва"
					class="p-2 bg-tg-secondary-bg-color rounded col-span-2"
					required
				/>
			</fieldset>
			<fieldset class="grid grid-cols-3 gap-2 items-center mb-2">
				<label for="price">💰 Ціна</label>
				<input
					id="price"
					type="number"
					bind:value={createForm.price}
					placeholder="Ціна"
					class="p-2 bg-tg-secondary-bg-color rounded col-span-2"
					min="1"
					required
				/>
			</fieldset>
			<fieldset class="grid grid-cols-3 gap-2 items-center mb-2">
				<label for="quantity">🔢 Кількість</label>
				<input
					id="quantity"
					type="number"
					bind:value={createForm.quantity}
					placeholder="Кількість"
					class="p-2 bg-tg-secondary-bg-color rounded col-span-2"
					min="1"
					required
				/>
			</fieldset>
			<fieldset class="grid grid-cols-3 mb-2">
				<label class="mt-2" for="description">📄 Опис</label>
				<textarea
					id="description"
					name="description"
					bind:value={createForm.description}
					class="p-2 bg-tg-secondary-bg-color rounded col-span-2"
					placeholder="Опис"
					required
				/>
			</fieldset>
			<button class="rounded p-2 bg-tg-button-color w-full">Додати</button>
		</form>
	{/if}
</div>

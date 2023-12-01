<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import {
		alertUtility,
		confirmUtility,
		getDateString,
		hideMainButton,
		months,
		showBackButton,
		showMainButton,
		type TransactionItemType
	} from '$lib/utilities';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let sendTransferMoneyForm = false;
	let showTransferMoneyButton = false;
	let transferMoneyButton: HTMLButtonElement;
	let transferMoneyReceiverId: number;
	let transferMoneyAmount: number | null = null;

	let showFilter = false;
	let filterButton: HTMLButtonElement;
	let filterCode: string | null = null;
	let filterPage = 1;
	let filterAddresseeId: string = '-1';
	let filterDate: string = '';

	export let data;
	export let form;

	const balance = data.balance ?? 0;
	const balanceFormatted = balance.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1 ');

	const addressees = data.addressees ?? [];

	let selectedTransactionIndex = -1;

	let transactions = writable<TransactionItemType[]>(data?.transactions?.items ?? []);
	let loadMore = data?.transactions?.more ?? false;

	onMount(() => {
		if (form?.transferMoneyResult) {
			alertUtility(form.transferMoneyResult);
		}

		showBackButton(() => goto('/'));
	});

	const updateTransactions = (items: any) => {
		transactions.update((data) => (filterPage === 1 ? items : [...data, ...items]));
	};
</script>

<header class="px-4 mt-10">
	<div class="flex items-center justify-center mb-8">
		<span class="text-4xl font-bold mr-2">{balanceFormatted}</span>
		<span class="text-3xl mr-2">c</span>
		<button
			on:click={() => location.reload()}
			class="p-2 rounded bg-tg-secondary-bg-color hover:bg-tg-button-color">🔄</button
		>
	</div>
	<nav class="grid grid-cols-2 gap-2">
		<button
			on:click={() => {
				showTransferMoneyButton = !showTransferMoneyButton;
				if (!showTransferMoneyButton) {
					transferMoneyAmount = null;
					transferMoneyReceiverId = 0;
				} else {
					showFilter = false;
				}
				hideMainButton();
			}}
			class="p-3 rounded text-center {showTransferMoneyButton
				? 'bg-tg-button-color'
				: 'bg-tg-secondary-bg-color'}">💸 Кошти</button
		>
		<button
			on:click={() => {
				showFilter = !showFilter;
				if (!showFilter) {
					hideMainButton();
				} else {
					showTransferMoneyButton = false;
					transferMoneyAmount = null;
					showMainButton('Застосувати фільтр', () => {
						filterPage = 1;
						showFilter = false;
						hideMainButton();
						setTimeout(() => filterButton.click(), 10);
					});
				}
			}}
			class="p-3 rounded text-center {showFilter
				? 'bg-tg-button-color'
				: 'bg-tg-secondary-bg-color'}">🔍 Фільтр</button
		>
	</nav>
	<form
		method="post"
		action="?/transferMoney"
		class="mt-4{showTransferMoneyButton ? '' : ' hidden'}"
		on:submit={(e) => {
			if ((transferMoneyAmount ?? 0) < 1) {
				e.preventDefault();
				alertUtility('😶 Невірна сума переказу');
			} else if ((transferMoneyAmount ?? 0) > balance) {
				e.preventDefault();
				alertUtility('🤧 У вас на рахунку недостатньо коштів для здійснення переказу');
			} else if (!sendTransferMoneyForm) {
				e.preventDefault();
				confirmUtility('❓ Підтвердити переказ коштів', (yes) => {
					if (yes) {
						sendTransferMoneyForm = true;
						transferMoneyButton.click();
					}
				});
			}
		}}
	>
		<fieldset class="grid grid-cols-2 items-center mb-2">
			<label for="receiver">📥 Отримувач</label>
			<select
				id="receiver"
				name="receiver_id"
				class="p-2 bg-tg-secondary-bg-color rounded w-full"
				bind:value={transferMoneyReceiverId}
				required
			>
				<option value={0}>Zyun Банк</option>
				{#each addressees ?? [] as { id, nickname, business_name }}
					<option value={id}
						>{(() => {
							let data = business_name ?? nickname;
							if (data && /[а-яА-Я]/.test(data)) {
								data = data.replaceAll('_', ' ');
							}

							return data;
						})()}</option
					>
				{/each}
			</select>
		</fieldset>
		<fieldset class="grid grid-cols-2 items-center mb-2">
			<label for="amount">💰 Сума</label>
			<input
				id="amount"
				name="amount"
				type="number"
				bind:value={transferMoneyAmount}
				on:input={() => {
					if (
						transferMoneyAmount !== null &&
						transferMoneyAmount <= balance &&
						transferMoneyAmount > 0
					) {
						showMainButton('Здійснити переказ', () => transferMoneyButton.click());
					} else {
						hideMainButton();
					}
				}}
				class="p-2 bg-tg-secondary-bg-color rounded w-full"
				placeholder="Сума"
				required
			/>
		</fieldset>

		<fieldset class="grid grid-cols-2 mb-2">
			<label for="comment" class="mt-2">💬 Коментар</label>
			<textarea
				id="comment"
				name="comment"
				placeholder="Коментар"
				maxlength={200}
				class="p-2 bg-tg-secondary-bg-color rounded w-full"
			/>
		</fieldset>
		<button class="hidden" bind:this={transferMoneyButton} />
	</form>
	<form
		method="post"
		action="?/loadMore"
		class="mt-4{showFilter ? '' : ' hidden'}"
		use:enhance={() =>
			({ result, update }) => {
				if (result.status === 200 && result.type === 'success') {
					loadMore = !!result.data?.more ?? false;

					selectedTransactionIndex = -1;

					if (result.data?.items) {
						updateTransactions(result.data.items);
					}
				}

				update({
					reset: false
				});
			}}
	>
		<input type="hidden" name="page" value={filterPage} />
		<fieldset class="grid grid-cols-2 items-center mb-2">
			<label for="code">🆔 Код транзакції</label>
			<input
				id="code"
				name="code"
				type="number"
				bind:value={filterCode}
				class="p-2 bg-tg-secondary-bg-color rounded w-full"
				placeholder="Код"
			/>
		</fieldset>
		{#if filterCode === null}
			<fieldset class="grid grid-cols-2 items-center mb-2">
				<label for="addressee">📥 Адресат</label>
				<select
					id="addressee"
					name="addressee_id"
					bind:value={filterAddresseeId}
					class="p-2 bg-tg-secondary-bg-color rounded w-full"
				>
					<option value="-1">Будь-який</option>
					<option value="0">Zyun Банк</option>
					{#each addressees ?? [] as { id, nickname, business_name }}
						<option value={id}>{business_name ?? nickname}</option>
					{/each}
				</select>
			</fieldset>
			<fieldset class="grid grid-cols-2 items-center">
				<label for="date">📅 Від</label>
				<input
					id="date"
					name="date"
					type="datetime-local"
					bind:value={filterDate}
					class="p-2 bg-tg-secondary-bg-color rounded w-full"
					placeholder="Дата"
				/>
			</fieldset>
		{/if}
		<button class="hidden" bind:this={filterButton} />
	</form>
</header>
<section class="p-4">
	{#if $transactions.length === 0}
		<div class="my-4 text-tg-hint-color text-sm text-center">🧐 Транзакції не знайдено</div>
	{/if}
	{#each $transactions as transaction, i}
		{#if i < 1 || transaction.date.day !== $transactions[i - 1].date.day || transaction.date.month !== $transactions[i - 1].date.month || transaction.date.year !== $transactions[i - 1].date.year}
			<div class="my-4 text-tg-hint-color text-sm text-center">
				{getDateString(transaction.date)}
			</div>
		{/if}
		<div
			class="rounded my-6 {selectedTransactionIndex === i ? ' ' : 'hover:'}bg-tg-secondary-bg-color"
		>
			<button
				class="flex items-center space-x-4 w-full text-left text-xl {selectedTransactionIndex === i
					? 'p-4'
					: ''} transition-all delay-100"
				on:click={() => (selectedTransactionIndex = selectedTransactionIndex === i ? -1 : i)}
				tabindex="0"
			>
				{#if transaction.nickname === 'Zyun Банк' || !!transaction.emoji}
					<span class="text-center w-12 text-4xl">{transaction.emoji ?? '🏦'}</span>
				{:else}
					<img src="https://cravatar.eu/helmhead/{transaction.nickname}" class="w-12" alt="" />
				{/if}
				<span class="flex-grow"
					>{(() => {
						let data = transaction.business_name ?? transaction.nickname;
						if (data && /[а-яА-Я]/.test(data)) {
							data = data.replaceAll('_', ' ');
						}

						return data;
					})()}</span
				>
				<span class={transaction.amount >= 0 ? 'text-green-500' : ''}>{transaction.amount}</span>
			</button>
			<div class={selectedTransactionIndex === i ? 'px-4 pb-4' : ''}>
				<table class="table-auto w-full{selectedTransactionIndex === i ? '' : ' hidden'}">
					<tbody>
						<tr>
							<td class="font-semibold">🆔&nbsp;Код</td>
							<td>{transaction.id}</td>
						</tr>
						<tr>
							<td class="font-semibold">📅&nbsp;Дата</td>
							<td>
								{transaction.date.day}
								{months[transaction.date.month - 1]}
								{transaction.date.year},
								{transaction.date.hour > 9 ? '' : '0'}{transaction.date.hour}:{transaction.date
									.minute > 9
									? ''
									: '0'}{transaction.date.minute}
							</td>
						</tr>
						<tr>
							<td class="font-semibold align-top">💬&nbsp;Коментар</td>
							<td>{transaction.comment}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	{/each}
</section>
{#if loadMore}
	<footer class="px-4 mb-2">
		<button
			on:click={() => {
				filterPage++;
				setTimeout(() => filterButton.click(), 10);
			}}
			class="mb-4 p-3 rounded bg-tg-secondary-bg-color text-center hover:bg-tg-button-color block w-full"
			>🔄 Завантажити ще</button
		>
	</footer>
{/if}

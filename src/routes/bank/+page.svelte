<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		alertUtility,
		getDateString,
		hideMainButton,
		months,
		showBackButton,
		showMainButton,
		type DateType
	} from '$lib/utilities';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let showMoneyTransfer = false;
	let receiver_id: number;
	let sum: number | null = null;

	let showSearch = false;
	let code: number | null = null;
	let addressee_id: number;
	let date: string | null = null;

	export let data;

	let balance = data.balance;
	let selectedTransactionIndex = -1;

	let transactions = writable<
		{
			id: number;
			nickname: string;
			sum: number;
			date: DateType;
		}[]
	>([
		{
			id: 1,
			nickname: 'Ziozyun',
			sum: -1000000,
			date: {
				day: 29,
				month: 10,
				year: 2023,
				hour: 3,
				minute: 18
			}
		},
		{
			id: 2,
			nickname: 'NeMoKyryl',
			sum: 100,
			date: {
				day: 29,
				month: 10,
				year: 2023,
				hour: 1,
				minute: 58
			}
		},
		{
			id: 3,
			nickname: 'Han__Salo',
			sum: 80,
			date: {
				day: 28,
				month: 10,
				year: 2023,
				hour: 14,
				minute: 37
			}
		},
		{
			id: 4,
			nickname: 'MuzukGruzin',
			sum: -12,
			date: {
				day: 25,
				month: 10,
				year: 1985,
				hour: 14,
				minute: 37
			}
		}
	]);

	onMount(() => {
		showBackButton(() => goto('/'));
	});
</script>

<header class="px-4 py-2">
	<div class="mb-2 flex items-center">
		<span class="text-4xl font-bold mr-2">{balance}</span>
		<span class="text-3xl mr-2">₴</span>
		<button class="p-2 rounded bg-tg-secondary-bg-color hover:bg-tg-button-color">🔄</button>
	</div>
	<nav class="grid grid-cols-3 gap-2">
		<button
			on:click={() => {
				showMoneyTransfer = !showMoneyTransfer;
				if (!showMoneyTransfer) {
					sum = null;
				} else {
					showSearch = false;
				}
				hideMainButton();
			}}
			class="p-3 rounded text-center {showMoneyTransfer
				? 'bg-tg-button-color'
				: 'bg-tg-secondary-bg-color'}">💸 Кошти</button
		>
		<button
			on:click={() => {
				showSearch = !showSearch;
				if (!showSearch) {
					hideMainButton();
				} else {
					showMoneyTransfer = false;
					sum = null;
					showMainButton('Застосувати фільтр', () => {
						alertUtility('Фільтр застосовано', () => {
							showSearch = false;
							hideMainButton();
						});
					});
				}
			}}
			class="p-3 rounded text-center {showSearch
				? 'bg-tg-button-color'
				: 'bg-tg-secondary-bg-color'}">🔍 Фільтр</button
		>
		<a href="/bank/invoices" class="p-3 rounded bg-tg-secondary-bg-color text-center">📑 Рахунок</a>
	</nav>
	{#if showMoneyTransfer}
		<div class="mt-4">
			<fieldset class="grid grid-cols-2 items-center mb-2">
				<label for="receiver">📥 Отримувач</label>
				<select
					id="receiver"
					class="p-2 bg-tg-secondary-bg-color rounded w-full"
					bind:value={receiver_id}
				>
					<option value="0">Zyun Банк</option>
					<option value="1">Ziozyun</option>
					<option value="2">NeMoKyryl</option>
					<option value="3">MuzukGruzin</option>
				</select>
			</fieldset>
			<fieldset class="grid grid-cols-2 items-center w-full">
				<label for="sum">💰 Сума</label>
				<input
					id="sum"
					type="number"
					bind:value={sum}
					on:input={() => {
						if (sum !== null && sum <= balance && sum > 0) {
							showMainButton('Переказати кошти', () => {
								alertUtility('Переказ надіслано типу', () => {
									showMoneyTransfer = false;
									sum = null;
									hideMainButton();
								});
							});
						} else {
							hideMainButton();
						}
					}}
					class="p-2 bg-tg-secondary-bg-color rounded"
					placeholder="Сума"
				/>
			</fieldset>
		</div>
	{/if}
	{#if showSearch}
		<div class="mt-4">
			<fieldset class="grid grid-cols-2 items-center mb-2">
				<label for="code">🆔 Код</label>
				<input
					id="code"
					type="number"
					bind:value={code}
					class="p-2 bg-tg-secondary-bg-color rounded w-full"
					placeholder="Код"
				/>
			</fieldset>
			{#if code === null}
				<fieldset class="grid grid-cols-2 items-center mb-2">
					<label for="receiver">📥 Адресат</label>
					<select
						id="receiver"
						class="p-2 bg-tg-secondary-bg-color rounded w-full"
						bind:value={addressee_id}
					>
						<option value="-1">Будь-який</option>
						<option value="0">Zyun Банк</option>
						<option value="1">Ziozyun</option>
						<option value="2">NeMoKyryl</option>
						<option value="3">MuzukGruzin</option>
					</select>
				</fieldset>
				<fieldset class="grid grid-cols-2 items-center">
					<label for="date">📅 Дата</label>
					<input
						id="date"
						type="date"
						bind:value={date}
						class="p-2 bg-tg-secondary-bg-color rounded w-full"
						placeholder="Дата"
					/>
				</fieldset>
			{/if}
		</div>
	{/if}
</header>
<section class="p-2">
	{#each $transactions as transaction, i}
		{#if i < 1 || transaction.date.day !== $transactions[i - 1].date.day || transaction.date.month !== $transactions[i - 1].date.month || transaction.date.year !== $transactions[i - 1].date.year}
			<div class="my-4 text-tg-hint-color text-sm text-center">
				{getDateString(transaction.date)}
			</div>
		{/if}
		<div class="rounded {selectedTransactionIndex === i ? '' : 'hover:'}bg-tg-secondary-bg-color">
			<div
				class="flex items-center p-2 space-x-4 text-xl"
				on:click={() => (selectedTransactionIndex = selectedTransactionIndex === i ? -1 : i)}
				on:keydown={() => {}}
				role="button"
				tabindex="0"
			>
				<img src="https://cravatar.eu/helmhead/{transaction.nickname}" width="50" alt="" />
				<span class="flex-grow">{transaction.nickname}</span>
				<span class={transaction.sum >= 0 ? 'text-green-500' : ''}>{transaction.sum}</span>
			</div>
			{#if selectedTransactionIndex === i}
				<table class="table-auto w-full">
					<tbody>
						<tr>
							<td class="py-2 px-4 font-semibold">🆔 Код:</td>
							<td class="py-2 px-4">{transaction.id}</td>
						</tr>
						<tr>
							<td class="py-2 px-4 font-semibold">📅 Дата:</td>
							<td class="py-2 px-4">
								{transaction.date.day}
								{months[transaction.date.month - 1]}
								{transaction.date.year},
								{transaction.date.hour}:{transaction.date.minute}
							</td>
						</tr>
					</tbody>
				</table>
			{/if}
		</div>
	{/each}
</section>
<footer class="px-4 mb-2">
	<button
		on:click={() => {
			transactions.update((data) => [
				...data,
				{
					id: 5,
					nickname: 'MuzukGruzin',
					sum: -12,
					date: {
						day: 25,
						month: 10,
						year: 2023,
						hour: 1,
						minute: 22
					}
				}
			]);
		}}
		class="mt-4 mb-2 p-3 rounded bg-tg-secondary-bg-color text-center hover:bg-tg-button-color block w-full"
		>🔄 Завантажити ще</button
	>
</footer>

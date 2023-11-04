<script lang="ts">
	import { goto } from '$app/navigation';
	import { hideMainButton, showBackButton, showMainButton } from '$lib/utilities';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let activeTab: 'list' | 'search' | 'add' = 'add';

	const emptyPosition = {
		name: '',
		price: 1,
		quantity: 1,
		description: ''
	};
	let positions = writable<
		{
			name: string;
			price: number;
			quantity: number;
			description: string;
		}[]
	>([emptyPosition]);

	onMount(() => {
		showBackButton(() => goto('/bank'));
		hideMainButton();
	});
</script>

<div class="p-4">
	<div class="mb-4 grid grid-cols-3 gap-2">
		<button
			on:click={() => {
				hideMainButton();
				activeTab = 'list';
			}}
			class="rounded p-3 {activeTab === 'list' ? 'bg-tg-button-color' : 'bg-tg-secondary-bg-color'}"
			>📑 Список</button
		>
		<button
			on:click={() => {
				hideMainButton();
				activeTab = 'search';
			}}
			class="rounded p-3 {activeTab === 'search'
				? 'bg-tg-button-color'
				: 'bg-tg-secondary-bg-color'}">🔍 Пошук</button
		>
		<button
			on:click={() => {
				activeTab = 'add';
				showMainButton('Виписати чек', () => {});
			}}
			class="rounded p-3 {activeTab === 'add' ? 'bg-tg-button-color' : 'bg-tg-secondary-bg-color'}"
			>📋 Додати</button
		>
	</div>
	{#if activeTab === 'list'}
		Список створених або оплачених чеків
	{:else if activeTab === 'search'}
		Пошук чека
	{:else}
		{#each $positions as { name, price, quantity, description }, i}
			<div class="mb-2 p-2 rounded bg-tg-secondary-bg-color">
				<fieldset class="grid grid-cols-3 gap-2 items-center mb-2">
					<label for="{i}_name">🏷️ Назва</label>
					<input
						id="{i}_name"
						type="text"
						value={name}
						placeholder="Назва"
						class="p-2 rounded bg-tg-bg-color col-span-2"
					/>
				</fieldset>
				<fieldset class="grid grid-cols-3 gap-2 items-center mb-2">
					<label for="{i}_price">💰 Ціна</label>
					<input
						id="{i}_price"
						type="number"
						value={price}
						placeholder="Ціна"
						class="p-2 rounded bg-tg-bg-color col-span-2"
					/>
				</fieldset>
				<fieldset class="grid grid-cols-3 gap-2 items-center mb-2">
					<label for="{i}_quantity">🔢 Кількість</label>
					<input
						id="{i}_quantity"
						type="number"
						value={quantity}
						placeholder="Кількість"
						class="p-2 rounded bg-tg-bg-color col-span-2"
					/>
				</fieldset>
				<fieldset class="grid grid-cols-3 mb-2">
					<label for="{i}_description">📄 Опис</label>
					<textarea
						id="{i}_description"
						name="description"
						value={description}
						class="p-2 bg-tg-bg-color rounded col-span-2"
						placeholder="Опис"
					/>
				</fieldset>
				<button
					on:click={() => {
						positions.update((data) => data.filter((_, ind) => ind !== i));
					}}
					class="rounded p-2 bg-red-500 w-full">Видалити позицію</button
				>
			</div>
		{/each}
		<button
			on:click={() => {
				positions.update((data) => [...data, emptyPosition]);
			}}
			class="mt-2 rounded p-2 bg-tg-button-color w-full">Додати позицію</button
		>
	{/if}
</div>

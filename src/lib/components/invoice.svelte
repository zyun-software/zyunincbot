<script lang="ts">
	import type { InvoiceType } from '$lib/server';

	export let invoice: InvoiceType;
	export let id: string = '';
</script>

<div class="mb-2 p-3 bg-tg-secondary-bg-color rounded">
	<button
		class="w-full text-left"
		on:click={() => {
			id = invoice.id === id ? '' : invoice.id;
		}}
	>
		<table class="table-auto w-full">
			<tbody>
				<tr>
					<td>🆔&nbsp;Код</td>
					<td>{invoice.id}</td>
				</tr>
				<tr>
					<td>📋&nbsp;Виписав</td>
					<td>{invoice.name}</td>
				</tr>
				<tr>
					<td>💰&nbsp;Сума</td>
					<td>
						{invoice.items.reduce((accumulator, currentItem) => {
							const product = currentItem.price * currentItem.quantity;
							return accumulator + product;
						}, 0)} ₴
					</td>
				</tr>
				<tr>
					<td>{invoice.transaction_id === null ? '⏳' : '✅'}&nbsp;Статус</td>
					<td>{invoice.transaction_id === null ? 'Очікується оплата' : 'Оплачено'}</td>
				</tr>
				{#if invoice.transaction_id !== null}
					<tr>
						<td>💸&nbsp;Оплатив</td>
						<td>{invoice.payer_name}</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</button>
	{#if id === invoice.id}
		{#each invoice.items as { name, price, quantity, description }}
			<div class="p-3 bg-tg-bg-color rounded mt-2">
				<table class="table-auto w-full">
					<tbody>
						<tr>
							<td class="align-top">🏷️&nbsp;Назва</td>
							<td>{name}</td>
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
							<td class="align-top">📄&nbsp;Опис</td>
							<td>{description}</td>
						</tr>
					</tbody>
				</table>
			</div>
		{/each}
	{/if}
</div>

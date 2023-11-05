import {
	createInvoiceFromJson,
	deleteInvoice,
	findInvoice,
	getInvoices,
	getUser,
	transferMoney,
	updateInvoice
} from '$lib/server';

export async function load({ cookies }) {
	if (!!cookies.get('loadMoreAction')) {
		cookies.delete('loadMoreAction');
		return {};
	}

	if (!!cookies.get('findInvoiceAction')) {
		cookies.delete('findInvoiceAction');
		return {};
	}

	const user = await getUser(cookies);

	const invoices = await getInvoices(user.id, 1);

	return {
		invoices
	};
}

export const actions = {
	do: async ({ request, cookies }) => {
		const user = await getUser(cookies);

		const data = await request.formData();

		const action = (data.get('action') ?? '').toString();
		const id = (data.get('id') ?? '').toString();

		const invoice = await findInvoice(id);

		if (!invoice) {
			return {
				message: '❌ Чек не знайдено'
			};
		}

		if (action === 'pay') {
			if (invoice.user_id === user.id) {
				return {
					message: '❌ Не можна оплатити свій чек'
				};
			}

			if (invoice.transaction_id !== null) {
				return {
					message: '❌ Цей чек вже оплачений'
				};
			}

			const amount = invoice.items.reduce((accumulator, currentItem) => {
				const product = currentItem.price * currentItem.quantity;
				return accumulator + product;
			}, 0);

			const transaction = await transferMoney(
				user.id,
				invoice.user_id,
				amount,
				`Оплата за чек №${invoice.id}`
			);

			switch (transaction.status) {
				case 'NO_COST':
					return {
						message: '❌ У вас недостатньо коштів для оплати цього чеку'
					};
				case 'RECEIVER_IS_BANNED':
					return {
						message: '❌ Отримувача заблоковано'
					};
				case 'SUCCESS':
					await updateInvoice(invoice.id, transaction.transaction_id ?? '');
					return {
						message: '✅ Чек оплачено'
					};
			}
		} else if (action === 'delete') {
			if (invoice.user_id !== user.id) {
				return {
					message: '❌ Не можна видалити чужий чек'
				};
			}

			if (invoice.transaction_id !== null) {
				return {
					message: '❌ Не можна видалити оплачений чек'
				};
			}

			await deleteInvoice(invoice.id);

			return {
				message: '✅ Чек видалено'
			};
		}

		return {
			message: '❌ Невідома помилка'
		};
	},
	findInvoice: async ({ request, cookies }) => {
		const user = await getUser(cookies);
		cookies.set('findInvoiceAction', 'true');

		const data = await request.formData();

		const id = (data.get('id') ?? '').toString();

		const invoice = await findInvoice(id);

		return {
			invoice,
			canPay: invoice && invoice.user_id !== user.id && invoice.transaction_id === null,
			canDelete: invoice && invoice.user_id === user.id && invoice.transaction_id === null
		};
	},
	loadMore: async ({ request, cookies }) => {
		const user = await getUser(cookies);
		cookies.set('loadMoreAction', 'true');

		const data = await request.formData();

		const pageValue = (data.get('page') ?? 1).toString();
		const page = parseInt(pageValue, 10) || 1;

		const invoices = await getInvoices(user.id, page);

		return invoices;
	},
	createInvoice: async ({ request, cookies }) => {
		const user = await getUser(cookies);

		const data = await request.formData();

		const invoiceJSON = (data.get('invoice') ?? '{}').toString();

		const result = await createInvoiceFromJson(invoiceJSON, user.id);

		const message = result.success ? `✅ Чек створено, код: ${result.id}` : `❌ ${result.message}`;

		return { message };
	}
};

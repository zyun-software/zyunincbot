import {
	calculateBalance,
	createInvoiceFromJson,
	getProduct,
	getProductsByIds,
	getUser,
	minusQuantityProduct,
	transferMoney,
	updateInvoice,
	type InvoiceItemType,
	type ProductType
} from '$lib/server';

export const actions = {
	pay: async ({ request, cookies }) => {
		const user = await getUser(cookies);
		const data = await request.formData();
		try {
			const goods = JSON.parse((data.get('goods') ?? '[]').toString());
			if (!Array.isArray(goods)) {
				throw Error('#######1');
			}

			for (const item of goods) {
				if (
					typeof item !== 'object' ||
					typeof item.id !== 'string' ||
					typeof item.quantity !== 'number' ||
					item.quantity < 1
				) {
					throw Error('#######2');
				}
			}

			const products = await getProductsByIds(goods.map((item) => item.id));

			for (const item of products) {
				if (item.user_id === user.id) {
					throw Error('#######3');
				}
			}

			if (products.length !== goods.length) {
				throw Error('#######4');
			}

			const amount = goods.reduce((accumulator, currentItem) => {
				const product = currentItem.price * currentItem.quantity;
				return accumulator + product;
			}, 0);

			const balance = await calculateBalance(user.id);

			if (balance < amount) {
				return {
					message: '❌ У вас недостатньо коштів для оплати'
				};
			}

			const jsones: {
				[k: string]: (InvoiceItemType & {
					amount: number;
					product_id: string;
				})[];
			} = {};
			for (const item of products) {
				const quantity = goods.find((i) => i.id === item.id)?.quantity ?? 0;
				if (quantity === 0) {
					throw Error('#######5');
				}

				if (!(item.user_id in jsones)) {
					jsones[item.user_id] = [];
				}

				jsones[item.user_id].push({
					name: `${item.name}${item.stack > 1 ? ` x${item.stack}` : ''}`,
					price: item.price,
					quantity,
					description: `№${item.id}. ${item.description}`,
					amount: item.price * quantity,
					product_id: item.id
				});
			}

			for (const user_id in jsones) {
				const amount = jsones[user_id].reduce((accumulator, currentItem) => {
					return accumulator + currentItem.amount;
				}, 0);
				const items = await Promise.all(
					jsones[user_id].map(async (item) => {
						await minusQuantityProduct(item.product_id, item.quantity);
						return {
							name: item.name,
							price: item.price,
							quantity: item.quantity,
							description: item.description
						};
					})
				);
				const invoice = await createInvoiceFromJson(JSON.stringify(items), user_id);
				if (invoice.success) {
					const transaction = await transferMoney(
						user.id,
						user_id,
						amount,
						`Оплата за чек №${invoice.id}`
					);

					if (transaction.status === 'SUCCESS') {
						await updateInvoice(invoice.id ?? '-1', transaction.transaction_id ?? '');
					}
				}
			}

			return {
				message: '✅ Товари придбано'
			};
		} catch (e) {
			console.log(e);
		}

		return {
			message: '❌ Невідома помилка'
		};
	},
	add: async ({ request, cookies }) => {
		const result: {
			success: boolean;
			message: string;
			product?: ProductType;
		} = {
			success: false,
			message: '❌ Невідома помилка'
		};

		const user = await getUser(cookies);

		const data = await request.formData();
		const code = (data.get('code') ?? '').toString();
		const quantity = parseInt((data.get('quantity') ?? '1').toString());

		const product = await getProduct(code);
		if (!product) {
			result.message = '❌ Товар не знайдено';
			return result;
		}

		if (product.user_id === user.id) {
			result.message = '❌ Ви не можете додати в кошик власний товар';
			return result;
		}

		if (product.quantity < quantity) {
			result.message = '❌ На складі недостатньо товару';
			return result;
		}

		product.quantity = quantity;

		result.success = true;
		result.message = '';
		result.product = product;

		return result;
	}
};

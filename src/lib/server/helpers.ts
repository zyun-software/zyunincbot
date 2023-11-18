import { TG_ID, TG_TOKEN } from '$env/static/private';
import { redirect, type Cookies } from '@sveltejs/kit';
import { createHmac } from 'crypto';
import {
	calculateBalance,
	createInvoice,
	findUserById,
	getProductsByIds,
	minusQuantityProduct,
	transferMoney,
	updateInvoice,
	type InvoiceItemType,
	type InvoiceType,
	type UserType
} from './api';

export const getUser = async (cookies: Cookies) => {
	const initData = cookies.get('init-data') ?? '';

	const encoded = decodeURIComponent(initData);

	const secret = createHmac('sha256', 'WebAppData').update(`${TG_ID}:${TG_TOKEN}`);

	const arr = encoded.split('&');
	const hashIndex = arr.findIndex((str) => str.startsWith('hash='));
	const hash = arr.splice(hashIndex)[0].split('=')[1];
	arr.sort((a, b) => a.localeCompare(b));
	const dataCheckString = arr.join('\n');

	const _hash = createHmac('sha256', secret.digest()).update(dataCheckString).digest('hex');

	const valid = _hash === hash;
	const userField = arr.find((str) => str.startsWith('user='));

	const throwUnauthorized = () => redirect(307, `/login`);

	if (!valid || !userField) {
		throw throwUnauthorized();
	}

	const userId = JSON.parse(decodeURIComponent(userField.split('=')[1])).id;

	const user = await findUserById(userId);
	if (!user) {
		throw throwUnauthorized();
	}

	if (user.banned) {
		throw redirect(307, '/banned');
	}

	return user;
};

export const createInvoiceFromJson = async (json: string, user_id: string) => {
	const result: {
		success: boolean;
		message: string;
		id?: string;
	} = {
		success: false,
		message: 'Невідома помилка'
	};

	try {
		const items: InvoiceType = JSON.parse(json);
		const invalidFormat = 'Невірний формат';
		if (!Array.isArray(items)) {
			result.message = invalidFormat;
			return result;
		}

		if (items.length === 0) {
			result.message = 'Потрібно передати принаймі одну позицію';
			return result;
		}

		for (const item of items) {
			if (
				typeof item !== 'object' ||
				typeof item.name !== 'string' ||
				typeof item.price !== 'number' ||
				typeof item.quantity !== 'number' ||
				typeof item.description !== 'string' ||
				item.price < 1 ||
				item.quantity < 1
			) {
				result.message = invalidFormat;
				return result;
			}
		}

		const id = await createInvoice(user_id, items);

		if (id) {
			result.success = true;
			result.message = 'Успіх';
			result.id = id;
		}

		return result;
	} catch {
		return result;
	}
};

export const findApiUserOrErrorJson = async (userToken: string) => {
	const [id, token] = userToken.split(':');

	const error = {
		success: false,
		message: ''
	};

	const user = await findUserById(id);
	if (!user) {
		error.message = 'Користувача не знайдено';
		return error;
	}

	if (user.api !== token) {
		error.message = 'Невірний токен доступу';
		return error;
	}

	if (user.banned) {
		error.message = 'Користувача заблоковано';
		return error;
	}

	return user;
};

export const buyGoods = async (goods: any, user: UserType) => {
	try {
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
				success: false,
				message: 'У вас недостатньо коштів для оплати'
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
					`Оплата чеку №${invoice.id}`
				);

				if (transaction.status === 'SUCCESS') {
					await updateInvoice(invoice.id ?? '-1', transaction.transaction_id ?? '');

					return {
						success: true,
						message: 'Товари придбано'
					};
				}

				if (transaction.status === 'NO_COST') {
					return {
						success: false,
						message: 'У вас недостатньо коштів'
					};
				}
			}
		}
	} catch {}

	return {
		success: false,
		message: 'Невідома помилка'
	};
};

import { TG_ID, TG_TOKEN } from '$env/static/private';
import { redirect, type Cookies } from '@sveltejs/kit';
import { createHmac } from 'crypto';
import { createInvoice, findUserById, type InvoiceType } from './api';

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

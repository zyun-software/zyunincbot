import { getProduct, getUser, type ProductType } from '$lib/server';

export const actions = {
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

		const product = await getProduct(code);
		if (!product) {
			result.message = '❌ Товар не знайдено';
			return result;
		}

		if (product.user_id === user.id) {
			result.message = '❌ Ви не можете додати в кошик власний товар';
			return result;
		}

		result.success = true;
		result.message = '';
		result.product = product;

		return result;
	}
};

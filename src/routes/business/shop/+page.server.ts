import { buyGoods, getProduct, getUser, type ProductType } from '$lib/server';

export const actions = {
	pay: async ({ request, cookies }) => {
		const user = await getUser(cookies);
		const data = await request.formData();
		try {
			const goods = JSON.parse((data.get('goods') ?? '[]').toString());
			const buyResult = await buyGoods(goods, user);

			return {
				message: `${buyResult.success ? '✅' : '❌'} ${buyResult.message}`
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

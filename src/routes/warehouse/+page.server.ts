import {
	deleteProduct,
	getProduct,
	getProducts,
	getUser,
	insertProduct,
	updateProduct,
	type ProductType
} from '$lib/server';

export async function load({ request, cookies }) {
	if (!!cookies.get('loadListAction')) {
		cookies.delete('loadListAction');
		return {};
	}
	if (!!cookies.get('loadMoreAction')) {
		cookies.delete('loadMoreAction');
		return {};
	}

	const user = await getUser(cookies);
	const products = await getProducts(user.id, '', 1);

	return {
		products
	};
}

const validateData = (product: ProductType) => {
	if (product.stack < 1) {
		product.stack = 1;
	}

	if (product.stack > 64) {
		product.stack = 64;
	}

	return product;
};

export const actions = {
	loadList: async ({ request, cookies }) => {
		cookies.set('loadListAction', 'true');

		const data = await request.formData();
		const user = await getUser(cookies);

		const name = (data.get('name') ?? '').toString();
		const products = await getProducts(user.id, name, 1);

		return {
			name,
			products
		};
	},
	loadMore: async ({ request, cookies }) => {
		cookies.set('loadMoreAction', 'true');

		const data = await request.formData();
		const user = await getUser(cookies);

		const page = parseInt((data.get('page') ?? '').toString());
		const name = (data.get('name') ?? '').toString();
		const products = await getProducts(user.id, name, page);

		return products;
	},
	add: async ({ request, cookies }) => {
		const user = await getUser(cookies);

		const data = await request.formData();

		let product = validateData({
			id: '',
			user_id: user.id,
			name: (data.get('name') ?? '').toString(),
			description: (data.get('description') ?? '').toString(),
			stack: parseInt((data.get('stack') ?? '0').toString()),
			price: parseInt((data.get('price') ?? '0').toString()),
			quantity: parseInt((data.get('quantity') ?? '0').toString())
		});

		await insertProduct(product);

		return {
			message: '✅ Товар успішно додано'
		};
	},
	edit: async ({ request, cookies }) => {
		const data = await request.formData();
		const user = await getUser(cookies);

		let id = (data.get('id') ?? '').toString();

		const findProduct = await getProduct(id);

		if (!findProduct || findProduct.user_id !== user.id) {
			return {
				message: '❌ Не можна редагувати чужий товар'
			};
		}

		let action = (data.get('action') ?? '').toString();

		if (action === 'edit') {
			let product = validateData({
				id: id,
				user_id: user.id,
				name: (data.get('name') ?? '').toString(),
				description: (data.get('description') ?? '').toString(),
				stack: parseInt((data.get('stack') ?? '0').toString()),
				price: parseInt((data.get('price') ?? '0').toString()),
				quantity: parseInt((data.get('quantity') ?? '0').toString())
			});

			await updateProduct(product);
			return {
				message: `✅ Товар з кодом ${id} успішно відредаговано`
			};
		} else if (action === 'delete') {
			await deleteProduct(id);
			return {
				message: `✅ Товар з кодом ${id} успішно видалено`
			};
		} else {
			return {
				message: '❌ Дія для товара не знайдена'
			};
		}
	}
};

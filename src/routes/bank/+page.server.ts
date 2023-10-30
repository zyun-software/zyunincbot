import {
	calculateBalance,
	findUserById,
	getUser,
	getUsersIgnoreId,
	loadTransactions,
	transferMoney
} from '$lib/server';

export async function load({ request, cookies }) {
	if (!!cookies.get('loadMoreAction')) {
		cookies.delete('loadMoreAction');
		return {};
	}

	const user = await getUser(cookies);

	const balance = await calculateBalance(user.id);
	const addressees = (await getUsersIgnoreId(user.id)).map((user) => {
		return {
			id: user.id,
			nickname: user.nickname
		};
	});

	const transactions = await loadTransactions(user.id, 1, '', '', '-1');

	return {
		balance,
		addressees,
		transactions
	};
}

export const actions = {
	loadMore: async ({ request, cookies }) => {
		const user = await getUser(cookies);
		cookies.set('loadMoreAction', 'true');

		const data = await request.formData();

		const pageValue = (data.get('page') ?? 1).toString();
		const page = parseInt(pageValue, 10) || 1;

		const code = (data.get('code') ?? '').toString();
		const date = (data.get('date') ?? '').toString();
		const addressee_id = (data.get('addressee_id') ?? -1).toString();

		const transactions = await loadTransactions(user.id, page, code, date, addressee_id);

		return { ...transactions, code };
	},
	transferMoney: async ({ request, cookies }) => {
		const user = await getUser(cookies);
		const data = await request.formData();

		let receiver_id: string | null = (data.get('receiver_id') ?? -1).toString();
		let receiver_name;
		if (receiver_id === '0') {
			receiver_id = null;
			receiver_name = 'Zyun Банк';
		} else {
			const receiver = await findUserById(receiver_id);
			if (!receiver) {
				return {
					transferMoneyResult: '🧐 Отримувача не знайдено'
				};
			}

			receiver_name = receiver.nickname;
		}

		const testAmount = (data.get('amount') ?? '0').toString();

		if (!/\d+/.test(testAmount)) {
			return {
				transferMoneyResult: '❌ Сума повинна бути числом'
			};
		}

		const amount = parseInt(testAmount);

		const comment = (data.get('comment') ?? '').toString();

		const transaction = await transferMoney(user.id, receiver_id, amount, comment);

		switch (transaction.status) {
			case 'RECEIVER_NOT_FOUND':
				return {
					transferMoneyResult: '🤔 Отримувача не знайдено'
				};
			case 'NO_COST':
				return {
					transferMoneyResult: '🫰 Недостатньо коштів для здійснення переказу'
				};
			case 'RECEIVER_IS_BANNED':
				return {
					transferMoneyResult: '😶 Отримувача заблокован'
				};
			case 'SUCCESS':
				return {
					transferMoneyResult: `💸 ${amount} ₴ успішно відправлено ${receiver_name}`
				};
			default:
				return {
					transferMoneyResult: '🤕 Не вдалося здійснити переказ'
				};
		}
	}
};

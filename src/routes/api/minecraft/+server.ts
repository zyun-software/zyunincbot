import { MC_TOKEN } from '$env/static/private';
import { calculateBalance, findUserByNickname, getUsersIgnoreId, transferMoney } from '$lib/server';
import { text } from '@sveltejs/kit';

export async function POST({ request }) {
	const token = request.headers.get('token') ?? '';

	if (token !== MC_TOKEN) {
		return text('неавторизований запит');
	}

	const command = {
		account: 'рахунок',
		goods: 'товар',
		basket: 'кошик',
		status: 'статус',
		pay: 'оплатити',
		balance: 'баланс',
		transfer: 'переказ'
	};

	const bank = 'Zyun_Bank';
	const unauth = 'Ви не авторизовані в системі';

	const data = await request.text();
	const parts = data.split('&&');

	if (data.match(/^tab/)) {
		const user = await findUserByNickname(parts[1]);
		if (!user) {
			return text('Ви не зареєстровані в системі');
		}

		if (user.banned) {
			return text('Ви заблоковані в системі');
		}

		const args = parts[2].split(' ');
		if (args.length === 1) {
			let list = [];

			for (const item of [command.account, command.goods, command.basket]) {
				if (item.includes(args[0])) {
					list.push(item);
				}
			}

			return text(list.join('&'));
		}

		if (args.length === 2) {
			if (args[0] === command.account) {
				let list = [];

				for (const item of [command.status, command.pay, command.balance, command.transfer]) {
					if (item.includes(args[1])) {
						list.push(item);
					}
				}

				if (args[1] === command.balance) {
					list.push('Ваш баланс в Zyun Банк');
				}

				return text(list.join('&'));
			}
		}

		if (args.length === 3) {
			if (args[0] === command.account && args[1] === command.transfer) {
				let list = [];
				const users = await getUsersIgnoreId(user.id);

				if (bank.includes(args[2])) {
					list.push(bank);
				}

				for (const u of users) {
					const name = u.business_name ?? u.nickname;
					if (name.includes(args[2])) {
						list.push(name);
					}
				}

				return text(list.join('&'));

				return text(unauth);
			}
		}

		if (args.length === 4) {
			if (args[0] === command.account && args[1] === command.transfer) {
				return text('Сума переказу');
			}
		}

		if (args.length > 4 && args[0] === command.account && args[1] === command.transfer) {
			return text('Коментар');
		}

		return text('');
	}

	if (data.match(/^command/)) {
		const user = await findUserByNickname(parts[1]);
		if (!user) {
			return text('message&§cВи не зареєстровані в системі');
		}

		if (user.banned) {
			return text('message&§cВи заблоковані в системі');
		}

		if (parts[3] === `${command.account} ${command.balance}`) {
			const balance = await calculateBalance(user.id);
			return text(
				`message&§aВаш баланс: §e${balance.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1.')} §a₴`
			);
		}

		const transferMoneyMatches = parts[3].match(
			new RegExp(`^${command.account} ${command.transfer} ([^ ]{1,16}) (\\d+)( .*)?`)
		);

		if (transferMoneyMatches) {
			let receiver = null;
			if (transferMoneyMatches[1] !== bank) {
				const receiverUser = await findUserByNickname(transferMoneyMatches[1]);
				if (receiverUser) {
					receiver = receiverUser.id;
				} else {
					receiver = '-1';
				}
			}

			const amount = parseInt(transferMoneyMatches[2]);

			const transaction = await transferMoney(
				user.id,
				receiver,
				amount,
				transferMoneyMatches[3] ?? ''
			);

			switch (transaction.status) {
				case 'SUCCESS':
					return text(
						`message&§aПереказ успішний, код транзакції: §e${transaction.transaction_id}`
					);
				case 'INVALID_AMOUNT':
					return text('message&§cНевірна сума переказу');
				case 'NO_COST':
					return text('message&§cНедостатньо коштів для переказу');
				case 'RECEIVER_NOT_FOUND':
					return text('message&§cОтримувача не знайдено');
				case 'RECEIVER_IS_BANNED':
					return text('message&§cОтримувача заблоковано');
				default:
					return text('message&§cНевідома помилка');
			}
		}
	}

	return text('message&§cКоманду не знайдено');
	//return text('clearnbt&&message&Типу шось сталося');
	//return text('setnbt&§6§lТовар`Ziozyun:43&&message&Типу шось сталося');
}

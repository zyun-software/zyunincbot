import { MC_TOKEN, URL_PANEL } from '$env/static/private';
import {
	buyGoods,
	calculateBalance,
	findProductById,
	findUserById,
	findUserByNickname,
	getProduct,
	getProductCodes,
	getProductsByIds,
	getRandomQuote,
	getUsersIgnoreId,
	insertProduct,
	insertUser,
	minusQuantityProduct,
	moneySupply,
	pluseQuantityProduct,
	telegram,
	transferMoney
} from '$lib/server';
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
		balance: 'баланс',
		transfer: 'переказ',
		add: 'додати',
		remove: 'прибрати',
		cost: 'вартість',
		cash: 'оплата_готівкою',
		buy: 'оплата_онлайн',
		register: 'зареєструватися',
		money_supply: 'грошова_маса',
		create: 'створити'
	};

	const bank = 'Zyun_Bank';

	const data = await request.text();
	const parts = data.split('&&');

	if (data.match(/^tab/)) {
		const args = parts[2].split(' ');
		const user = await findUserByNickname(parts[1]);
		if (!user) {
			if (args.length === 1 && command.register.includes(args[0])) {
				return text(command.register);
			}
			if (args.length === 2 && args[0] === command.register) {
				return text('Код з Telegram');
			}
			return text('Ви не зареєстровані в системі');
		}

		if (user.banned) {
			return text('Ви заблоковані в системі');
		}

		if (args.length === 1) {
			let list = [];

			for (const item of [command.account, command.goods, command.basket]) {
				if (item.includes(args[0])) {
					list.push(item);
				}
			}

			if (user.admin) {
				if (command.money_supply.includes(args[0])) {
					list.push(command.money_supply);
				}
			}

			return text(list.join('&'));
		}

		if (args.length === 2) {
			if (args[0] === command.account) {
				let list = [];

				for (const item of [command.balance, command.transfer]) {
					if (item.includes(args[1])) {
						list.push(item);
					}
				}

				if (args[1] === command.balance) {
					list.push('Ваш баланс в Zyun Банк');
				}

				return text(list.join('&'));
			}

			if (args[0] === command.goods) {
				let list = [];

				for (const item of [command.add, command.remove, command.create]) {
					if (item.includes(args[1])) {
						list.push(item);
					}
				}

				if (args[1] === command.remove) {
					list.push('Це прибере всі товари в інвентарі');
				}

				return text(list.join('&'));
			}

			if (args[0] === command.basket) {
				let list = [];

				for (const item of [command.cost, command.buy, command.cash]) {
					if (item.includes(args[1])) {
						list.push(item);
					}
				}

				if (args[1] === command.cost) {
					list.push('Порахувати вартість товарів у інвентарі');
				}

				if (args[1] === command.buy) {
					list.push('Придбати товари у інвентарі');
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
			}

			if (args[0] === command.goods && args[1] === command.add) {
				let list = [];
				const codes = await getProductCodes(user.id);

				for (const code of codes) {
					if (code.includes(args[2])) {
						list.push(code);
					}
				}

				const product = await getProduct(args[2]);
				if (product && product.user_id === user.id) {
					list.push(product.name);
				}

				return text(list.join('&'));
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

		if (args.length === 3 && args[0] === command.goods && args[1] === command.create) {
			return text('Ціна');
		}

		if (args.length > 3 && args[0] === command.goods && args[1] === command.create) {
			return text('Назва');
		}

		return text('Команду не знайдено');
	}

	if (data.match(/^command/)) {
		const user = await findUserByNickname(parts[1]);
		if (!user) {
			const registerMatches = parts[3].match(new RegExp(`^${command.register} (\\d+)$`));
			if (registerMatches) {
				const findUser = await findUserById(registerMatches[1]);
				if (findUser) {
					return text('message&§cЦей код вже зареєстровано в системі');
				}

				await insertUser({ id: registerMatches[1], nickname: parts[1] });

				await telegram('setChatMenuButton', {
					chat_id: registerMatches[1],
					menu_button: {
						type: 'web_app',
						text: 'Zyun Банк',
						web_app: {
							url: `${URL_PANEL}/bank`
						}
					}
				});

				const quote = await getRandomQuote();

				await telegram('sendMessage', {
					chat_id: registerMatches[1],
					text: `🚪 Натисніть кнопку щоб перейти до меню банку\n\n` + `💬 "<i>${quote}"</i>`,
					parse_mode: 'HTML',
					reply_markup: {
						inline_keyboard: [
							[
								{
									web_app: { url: `${URL_PANEL}/bank` },
									text: '🏦 Zyun Банк'
								}
							]
						]
					}
				});

				return text('message&§aВи успішно зареєструвалися в системі в системі');
			}

			return text('message&§cВи не зареєстровані в системі');
		}

		if (user.banned) {
			return text('message&§cВи заблоковані в системі');
		}

		const stackInHand = parseInt(parts[2]);

		if (user.admin && parts[3] === command.money_supply) {
			const amount = await moneySupply();
			return text(
				`message&§aГрошова маса складає: §e${amount
					.toString()
					.replace(/(\d)(?=(\d{3})+$)/g, '$1.')} §a₴`
			);
		}

		if (parts[3] === `${command.account} ${command.balance}`) {
			const balance = await calculateBalance(user.id);
			return text(
				`message&§aВаш баланс: §e${balance.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1.')} §a₴`
			);
		}

		const transferMoneyMatches = parts[3].match(
			new RegExp(`^${command.account} ${command.transfer} ([^ ]{1,16}) (\\d+)( .*)?$`)
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

		const addProductMatches = parts[3].match(
			new RegExp(`^${command.goods} ${command.add} (\\d+)$`)
		);
		if (addProductMatches) {
			const product = await findProductById(addProductMatches[1], user.id);
			if (!product) {
				return text('message&§cТовар не знайдено');
			}

			if (stackInHand !== product.stack) {
				return text(`message&§cСтак цього товару повинен дорівнювати §e${product.stack}`);
			}

			await pluseQuantityProduct(product.id, 1);

			return text(
				`setnbt&§6§lТовар\`${user.business_name ?? user.nickname}:${
					product.id
				}&&message&§aТовар додано`
			);
		}

		const removeProductsMatches = parts[3].match(
			new RegExp(`^${command.goods} ${command.remove}$`)
		);
		if (removeProductsMatches) {
			const lines = parts[4].split('``');
			if (lines.length === 1 && lines[0] === '') {
				return text('message&§cВідсутні товари для видалення');
			}
			for (const line of lines) {
				if (!line.match(new RegExp(`${user.business_name ?? user.nickname}`))) {
					return text('message&§cУ вас в інвентарі є не ваші товари');
				}
			}

			return text('clearnbt&&message&§aТовари прибрано');
		}

		const getProducts = async () => {
			const lines = parts[4].split('``');
			if (lines.length === 1 && lines[0] === '') {
				return 'message&§cВідсутні товари для підрахунку вартості';
			}

			const goods: { [k: string]: number } = {};

			for (const line of lines) {
				const [stack, lore] = line.split('&');
				const codeMatches = lore.match(/(\d+)$/);
				if (!codeMatches) {
					return 'message&§cПомилка визначення коду товара';
				}

				if (!(codeMatches[1] in goods)) {
					goods[codeMatches[1]] = 0;
				}

				goods[codeMatches[1]] += parseInt(stack);
			}

			const ids = Object.keys(goods);
			const products = await getProductsByIds(ids);

			if (products.length !== ids.length) {
				return 'message&§cНе знайдено товар на складі';
			}

			for (const product of products) {
				if ((goods[product.id] ?? 1) % product.stack !== 0) {
					return `message&§cСтак товару відрізняється від стаку на складі §e${product.stack}§c, код §e${product.id}`;
				}
			}

			return products.map((product) => {
				return {
					...product,
					amount: (goods[product.id] ?? 1) / product.stack
				};
			});
		};

		const costBasketMatches = parts[3].match(new RegExp(`^${command.basket} ${command.cost}$`));
		if (costBasketMatches) {
			const products = await getProducts();
			if (typeof products === 'string') {
				return text(products);
			}

			const amount = products.reduce((accumulator, currentItem) => {
				const product = currentItem.price * currentItem.amount * currentItem.stack;
				return accumulator + product;
			}, 0);

			return text(`message&§aСума товарів складає §e${amount} §a₴`);
		}

		const payBasketMatches = parts[3].match(new RegExp(`^${command.basket} ${command.buy}$`));
		if (payBasketMatches) {
			const products = await getProducts();
			if (typeof products === 'string') {
				return text(products);
			}

			for (const product of products) {
				if (product.user_id === user.id) {
					return text('message&§cНе можна купувати власні товари');
				}
			}

			const buyResult = await buyGoods(
				products.map((product) => {
					return {
						id: product.id,
						quantity: product.amount
					};
				}),
				user
			);

			return text(
				`${buyResult.success ? 'clearnbt&&message&§a' : 'message&§c'}${buyResult.message}`
			);
		}

		const cashBasketMatches = parts[3].match(new RegExp(`^${command.basket} ${command.cash}$`));
		if (cashBasketMatches) {
			const products = await getProducts();
			if (typeof products === 'string') {
				return text(products);
			}

			for (const p of products) {
				if (p.user_id === user.id) {
					return text('message&§cВи не можете придбати власний товар');
				}
			}

			const dd: {
				[id: string]: string[];
			} = {};

			for (const p of products) {
				await minusQuantityProduct(p.id, p.amount);
				if (!(p.user_id in dd)) {
					dd[p.user_id] = [];
				}
				dd[p.user_id].push(`${p.name} x${p.stack}, ${p.amount} шт.`);
			}

			for (const chat_id in dd) {
				const con = dd[chat_id].join(', ');
				await telegram('sendMessage', {
					chat_id,
					text: `🛍 За наступні товари щойно розрахувався <code>${user.nickname}</code> готівкою: ${con}`,
					parse_mode: 'HTML'
				});
			}

			return text('clearnbt&&message&§aТовари придбано');
		}

		const createMatches = parts[3].match(
			new RegExp(`^${command.goods} ${command.create} (\\d+) (.+)$`)
		);
		if (createMatches) {
			const price = parseInt(createMatches[1]);
			const name = createMatches[2];
			const id = await insertProduct({
				id: '',
				user_id: user.id,
				name,
				description: '',
				stack: stackInHand,
				price: price,
				quantity: 1
			});

			if (id === null) {
				return text('message&§cПомилка створення товару');
			} else {
				return text(
					`setnbt&§6§lТовар\`${user.business_name ?? user.nickname}:${id}&&message&§aТовар створено`
				);
			}
		}
	}

	return text('message&§cКоманду не знайдено');
	//return text('clearnbt&&message&Типу шось сталося');
	//return text('setnbt&§6§lТовар`Ziozyun:43&&message&Типу шось сталося');
}

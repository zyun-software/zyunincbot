import { TG_TOKEN, URL_PANEL } from '$env/static/private';
import {
	calculateBalance,
	findTransactionById,
	findUserById,
	findUserByNickname,
	getRandomQuote,
	insertUser,
	moneySupply,
	telegram,
	transferMoney,
	updateUser
} from '$lib/server';
import { text } from '@sveltejs/kit';

export async function POST({ request }) {
	const token = request.headers.get('x-telegram-bot-api-secret-token') ?? '';

	if (TG_TOKEN !== token) {
		return text('Невірний токен доступу');
	}

	const data = await request.json();

	const chat_id = data?.message?.from?.id ?? null;

	if (chat_id === null) {
		return text('Невдалося визначити user id');
	}

	const user = await findUserById(chat_id);
	if (user === null) {
		await telegram('sendMessage', {
			chat_id,
			text: `🔒 Ви не авторизовані в системі, ваш код: <code>${chat_id}</code>`,
			parse_mode: 'HTML',
			reply_markup: {
				remove_keyboard: true
			}
		});

		return text('Не авторизовані');
	}

	if (user.banned) {
		await telegram('sendMessage', {
			chat_id,
			text: '⛔️ Ви заблоковані в системі',
			reply_markup: {
				remove_keyboard: true
			}
		});

		return text('Заблоковані');
	}

	const showPanel = async (chat_id: string) =>
		await telegram('setChatMenuButton', {
			chat_id,
			menu_button: {
				type: 'web_app',
				text: 'Zyun Банк',
				web_app: {
					url: `${URL_PANEL}/bank`
				}
			}
		});

	if (user.admin && data?.message?.text) {
		const registerMatches = data.message.text.match(/^Зареєструвати ([a-zA-Z0-9_]{1,16}) (\d+)$/);
		if (registerMatches) {
			const findByNickname = await findUserByNickname(registerMatches[1]);
			const findById = await findUserById(registerMatches[2]);
			if (!findById && !findByNickname) {
				await insertUser({
					id: registerMatches[2],
					nickname: registerMatches[1]
				});

				await showPanel(registerMatches[2]);

				await telegram('sendMessage', {
					chat_id: registerMatches[2],
					text: `🔐 Вас щойно було зареєстровано в системі під псевдонімом: <code>${registerMatches[1]}</code>`,
					parse_mode: 'HTML'
				});

				await telegram('sendMessage', {
					chat_id,
					text: `✅ <code>${registerMatches[1]}</code> зареєстровано`,
					parse_mode: 'HTML'
				});

				return text('Реєстрація гравця');
			}
		}

		const renameMatches = data.message.text.match(
			/^Перейменувати ([a-zA-Z0-9_]{1,16}) ([a-zA-Z0-9_]{1,16})$/
		);
		if (renameMatches) {
			const findCur = await findUserByNickname(renameMatches[1]);
			const findRe = await findUserByNickname(renameMatches[2]);
			if (findCur && !findRe) {
				const oldNickname = findCur.nickname;
				findCur.nickname = renameMatches[2];
				await updateUser(findCur);

				await telegram('sendMessage', {
					chat_id: findCur.id,
					text: `✍🏻 Ваш псевдонім було змінено на <code>${renameMatches[2]}</code>`,
					parse_mode: 'HTML'
				});

				await telegram('sendMessage', {
					chat_id,
					text: `✅ Псевдонім <code>${oldNickname}</code> було змінено на <code>${renameMatches[2]}</code>`,
					parse_mode: 'HTML'
				});

				return text('Перейменування гравця');
			}
		}

		const blockMatches = data.message.text.match(/^(За|Роз)блокувати ([a-zA-Z0-9_]{1,16})$/);
		if (blockMatches) {
			const find = await findUserByNickname(blockMatches[2]);
			if (find && !find.admin) {
				find.banned = /^З/.test(data.message.text);
				await updateUser(find);

				if (find.banned) {
					await telegram('setChatMenuButton', {
						chat_id: find.id,
						menu_button: {
							type: 'default'
						}
					});
				} else {
					await showPanel(find.id);
				}

				await telegram('sendMessage', {
					chat_id: find.id,
					text: `${find.banned ? '⛔' : '🔓'} Вас було ${find.banned ? 'за' : 'роз'}блоковано`
				});

				await telegram('sendMessage', {
					chat_id,
					text: `${find.banned ? '⛔' : '🔓'} <code>${find.nickname}</code> ${
						find.banned ? 'за' : 'роз'
					}блоковано`,
					parse_mode: 'HTML'
				});

				return text('Блокування гравця');
			}
		}

		const calcMatches = data.message.text.match(/^Бюджет( \d+:\d+\.\d+:\d+)+$/);
		if (calcMatches) {
			const amount = await moneySupply();
			const calc = data.message.text
				.replace('Бюджет ', '')
				.split(' ')
				.map((item: string) => {
					const [stack, items, cource] = item.split(':');
					const [stacks, one] = items.split('.');

					const sum = (parseInt(stack) * parseInt(stacks) + parseInt(one)) * parseInt(cource);

					return {
						key: item,
						sum
					};
				});

			const total = calc.reduce((accumulator: number, currentItem: { sum: number }) => {
				return accumulator + currentItem.sum;
			}, 0);

			const need = total - amount;

			console.log(calc, total, amount, need);
			await telegram('sendMessage', {
				chat_id,
				text:
					`💰 Грошова маса: <code>${amount}</code> ₴\n` +
					`${
						need === 0
							? '⚖️ Фінанси збалансовані'
							: need < 0
							? `📉 Дефіцит: <code>${Math.abs(need)}</code>`
							: `📈 Профіцит: <code>${need}</code>`
					}\n\n` +
					calc.map((item: {key: string, sum: number}) => {
						return `🧮 <code>${item.key}</code> = <code>${item.sum}</code> ₴`;
					}).join('\n'),
				parse_mode: 'HTML'
			});
			return text('Бюджет');
		}

		const transferMoneyMatches = data.message.text.match(
			/^Нарахувати ([a-zA-Z0-9_]{1,16}) (\d+)( .+)?/
		);

		if (transferMoneyMatches) {
			const amount = parseInt(transferMoneyMatches[2]);
			const receiver = await findUserByNickname(transferMoneyMatches[1]);
			if (amount > 0 && receiver) {
				const comment = data.message.text.replace(
					`Нарахувати ${transferMoneyMatches[1]} ${transferMoneyMatches[2]}`,
					''
				);
				const transaction = await transferMoney(null, receiver.id, amount, comment);
				if (transaction && transaction.status === 'SUCCESS') {
					await telegram('sendMessage', {
						chat_id,
						text: `✅ <code>${receiver.nickname}</code> було нараховано <code>${amount}</code> ₴`,
						parse_mode: 'HTML'
					});
					return text('Нарахування грошей гравцю');
				}
			}
		}

		const removeBusinnessMatches = data.message.text.match(
			/^Прибрати інформацію бізнесу ([a-zA-Z0-9_]{1,16})/
		);
		if (removeBusinnessMatches) {
			const find = await findUserByNickname(removeBusinnessMatches[1]);
			if (find) {
				find.emoji = null;
				find.business_name = null;
				await updateUser(find);
				await telegram('sendMessage', {
					chat_id,
					text: `✅ У <code>${find.nickname}</code> було прибрано бізнес інформацію`,
					parse_mode: 'HTML'
				});
				return text('Прибрати бізнес інформацію');
			}
		}

		const balanceMatches = data.message.text.match(/^Баланс ([a-zA-Z0-9_]{1,16})/);
		if (balanceMatches) {
			const find = await findUserByNickname(balanceMatches[1]);
			if (find) {
				const balance = await calculateBalance(find.id);
				await telegram('sendMessage', {
					chat_id,
					text: `✅ Баланс <code>${find.nickname}</code> складає <code>${balance}</code> ₴`,
					parse_mode: 'HTML'
				});
				return text('Переглягути баланс клієнта');
			}
		}

		const addBusinnessMatches = data.message.text.match(
			/^Додати інформацію бізнесу ([a-zA-Z0-9_]{1,16}) (.+) (.+)/
		);
		if (addBusinnessMatches) {
			const find = await findUserByNickname(addBusinnessMatches[1]);
			if (find) {
				find.emoji = addBusinnessMatches[2];
				find.business_name = addBusinnessMatches[3];
				await updateUser(find);
				await telegram('sendMessage', {
					chat_id,
					text: `✅ У <code>${find.nickname}</code> було додано бізнес інформацію`,
					parse_mode: 'HTML'
				});
				return text('Додати бізнес інформацію');
			}
		}

		const transactionMatches = data.message.text.match(/^Транзакція (\d+)/);
		if (transactionMatches) {
			const transaction = await findTransactionById(transactionMatches[1]);
			if (transaction) {
				await telegram('sendMessage', {
					chat_id,
					text:
						`📤 Відправник: <code>${transaction.sender_nickname}</code>\n` +
						`📥 Отримувач: <code>${transaction.receiver_nickname}</code>\n` +
						`📅 Дата: <code>${transaction.date_string}</code>\n` +
						`💰 Сума: <code>${transaction.amount}</code> ₴\n` +
						`💬 Коментар: ${transaction.comment}`,
					parse_mode: 'HTML'
				});
				return text('Інформація пр транзакцію');
			}
		}

		if (data.message.text === 'Допомога') {
			await telegram('sendMessage', {
				chat_id,
				text:
					'<code>Зареєструвати</code> [<i>псевдонім</i>] [<i>код</i>]\n' +
					'<code>Перейменувати</code> [<i>старий псевдонім</i>] [<i>новий псевдонім</i>]\n' +
					'<code>Заблокувати</code> [<i>псевдонім</i>]\n' +
					'<code>Розблокувати</code> [<i>псевдонім</i>]\n' +
					'<code>Нарахувати</code> [<i>псевдонім</i>] [<i>сума</i>]\n' +
					'<code>Прибрати інформацію бізнесу</code> [<i>псевдонім</i>]\n' +
					'<code>Додати інформацію бізнесу</code> [<i>псевдонім</i>] [<i>emoji</i>] [<i>назва бізнесу</i>]\n' +
					'<code>Баланс</code> [<i>псевдонім</i>]\n' +
					'<code>Бютжет</code> [<i>стак</i>:<i>стаків</i>.<i>блоків</i>:<i>курс</i>]+\n' +
					'<code>Транзакція</code> [<i>псевдонім</i>]',
				parse_mode: 'HTML'
			});
			return text('Допомога');
		}
	}

	await showPanel(user.id);

	const quote = await getRandomQuote();

	await telegram('sendMessage', {
		chat_id,
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

	return text('виконано');
}

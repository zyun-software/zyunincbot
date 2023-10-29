import { TG_TOKEN, URL_PANEL } from '$env/static/private';
import {
	findUserById,
	findUserByNickname,
	insertUser,
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

	if (user.blocked) {
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

	if (user.admin && data.message) {
		const minecraftNicknameRegex = /^[a-zA-Z0-9_]{1,16}$/;

		const registerMatches = data.message.text.match(/^Зареєструвати (\w+) (\d+)$/);
		if (registerMatches && minecraftNicknameRegex.test(registerMatches[1])) {
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

		const renameMatches = data.message.text.match(/^Перейменувати (\w+) (\w+)$/);
		if (
			renameMatches &&
			minecraftNicknameRegex.test(renameMatches[1]) &&
			minecraftNicknameRegex.test(renameMatches[2])
		) {
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

		const blockMatches = data.message.text.match(/^(За|Роз)блокувати (\w+)$/);
		if (blockMatches && minecraftNicknameRegex.test(blockMatches[2])) {
			const find = await findUserByNickname(blockMatches[2]);
			if (find && !find.admin) {
				find.blocked = /^З/.test(data.message.text);
				await updateUser(find);

				if (find.blocked) {
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
					text: `${find.blocked ? '⛔' : '🔓'} Вас було ${find.blocked ? 'за' : 'роз'}блоковано`
				});

				await telegram('sendMessage', {
					chat_id,
					text: `${find.blocked ? '⛔' : '🔓'} <code>${find.nickname}</code> ${
						find.blocked ? 'за' : 'роз'
					}блоковано`,
					parse_mode: 'HTML'
				});

				return text('Блокування гравця');
			}
		}

		const transferMoneyMatches = data.message.text.match(/^Нарахувати (\w+) (\d+)$/);
		if (transferMoneyMatches && minecraftNicknameRegex.test(transferMoneyMatches[1])) {
			const amount = parseInt(transferMoneyMatches[2]);
			const receiver = await findUserByNickname(transferMoneyMatches[1]);
			if (amount > 0 && receiver) {
				const transaction = await transferMoney(null, receiver.id, amount);
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
	}

	await showPanel(user.id);

	await telegram('sendMessage', {
		chat_id,
		text: `👋 Привіт <code>${user.nickname}</code>, натисніть на кнопку 🎛️ <code>Zyun Банк</code> щоб отримати доступ до всього функціоналу`,
		parse_mode: 'HTML',
		reply_markup: {
			remove_keyboard: true
		}
	});

	return text('виконано');
}

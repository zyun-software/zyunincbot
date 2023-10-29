import { TG_TOKEN, URL_DONATE, URL_PANEL } from '$env/static/private';
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
			text: `🔒 Ви не авторизовані в системі, ваш код: \`${chat_id}\``,
			parse_mode: 'Markdown',
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
				await telegram('sendMessage', {
					chat_id,
					text: `✅ ${registerMatches[1]} зареєстровано`
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
					chat_id,
					text: `✅ ${oldNickname} було перейменовано в ${renameMatches[2]}`
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
				await telegram('sendMessage', {
					chat_id,
					text: `✅ ${find.nickname} ${find.blocked ? 'за' : 'роз'}блоковано`
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
						text: `✅ ${receiver.nickname} було нараховано ${amount} ₴`
					});
					return text('Нарахування грошей гравцю');
				}
			}
		}
	}

	await telegram('sendMessage', {
		chat_id,
		text: '🌇 Головне меню',
		reply_markup: {
			keyboard: [
				[
					{
						text: '🏦',
						web_app: { url: `${URL_PANEL}/bank` }
					},
					{
						text: '🛍️',
						web_app: { url: `${URL_PANEL}/shop` }
					},
					{
						text: '📦',
						web_app: { url: `${URL_PANEL}/warehouse` }
					}
				],
				[
					{
						text: '⚙️',
						web_app: { url: `${URL_PANEL}/settings` }
					},
					{
						text: 'ℹ️',
						web_app: { url: `${URL_PANEL}/info` }
					},
					{
						text: '💸',
						web_app: { url: URL_DONATE }
					}
				]
			],
			resize_keyboard: true
		}
	});

	return text('виконано');
}

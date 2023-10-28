import { TG_TOKEN, URL_DONATE, URL_PANEL } from '$env/static/private';
import { findUserById, telegram } from '$lib/server';
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
			text: '🔒 Ви не авторизовані в системі',
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

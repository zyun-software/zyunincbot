import { PG_DB, PG_PASSWORD, PG_USER, TG_ID, TG_TOKEN } from '$env/static/private';
import axios from 'axios';
import postgres from 'postgres';

export const telegram = async (method: string, data: any) => {
	try {
		const result = await axios.post(
			`https://api.telegram.org/bot${TG_ID}:${TG_TOKEN}/${method}`,
			data
		);

		return result;
	} catch (error: any) {
		console.log('## Помилка запиту до Telegram');

		if (error.response) {
			console.log('Статус відмови:', error.response.status);
			console.log('Дані відповіді:', error.response.data);
		} else if (error.request) {
			console.log('Помилка запиту:', error.request);
		} else {
			console.log('Помилка налаштування:', error.message);
		}

		error.config.data = JSON.parse(error.config.data);
		console.log('Додаткові деталі про помилку:', error.config);

		return null;
	}
};

export const sql = postgres({
	host: 'postgres',
	port: 5432,
	database: PG_DB,
	username: PG_USER,
	password: PG_PASSWORD
});

export type UserType = {
	id: string;
	nickname: string;
	api: string | null;
	admin: boolean;
	blocked: boolean;
};

export const findUserById = async (id: string) => {
	try {
		const users = await sql<UserType[]>`select * from users where id = ${id}`;
		if (users.length !== 1) {
			return null;
		}

		return users[0];
	} catch {
		return null;
	}
};

export const findUserByNickname = async (nickname: string) => {
	try {
		const users = await sql<
			UserType[]
		>`select * from users where lower(nickname) = lower(${nickname})`;
		if (users.length !== 1) {
			return null;
		}

		return users[0];
	} catch {
		return null;
	}
};

export const getAdmins = async () => {
	try {
		const users = await sql<UserType[]>`select * from users where admin`;

		return users;
	} catch {
		return [];
	}
};

export const updateUser = async (user: {
	id: string;
	nickname: string;
	api: string | null;
	blocked: boolean;
}) => {
	try {
		await sql`update users set ${sql(user)} where id = ${user.id}`;
	} catch {}
};

export const insertUser = async (user: { id: string; nickname: string }) => {
	try {
		await sql`insert into users ${sql(user)}`;
	} catch {}
};

export type TransactionType = {
	status:
		| 'INVALID_AMOUNT'
		| 'INVALID_OPERATION'
		| 'SENDER_NOT_FOUND'
		| 'SENDER_IS_BLOCKED'
		| 'NO_COST'
		| 'RECEIVER_NOT_FOUND'
		| 'RECEIVER_IS_BLOCKED'
		| 'SUCCESS';
	transaction_id: string | null;
};

export const transferMoney = async (
	sender_id: string | null,
	receiver_id: string | null,
	amount: number
) => {
	try {
		let transaction = await sql<
			TransactionType[]
		>`SELECT * FROM perform_transaction(${sender_id}, ${receiver_id}, ${amount})`;
		if (transaction.length !== 1) {
			return null;
		}

		if (transaction[0].status === 'SUCCESS') {
			let sender_name = 'Zyun Банк';
			if (sender_id != null) {
				const sender = await findUserById(sender_id);
				if (sender) {
					sender_name = sender.nickname;
				}
			}

			let chat_ids = [];
			if (receiver_id !== null) {
				chat_ids.push(receiver_id);
			} else {
				const admins = await getAdmins();
				chat_ids = admins.map((admin) => admin.id);
			}

			for (const chat_id of chat_ids) {
				await telegram('sendMessage', {
					chat_id,
					text:
						'💸 <b>Отримано переказ коштів</b>\n\n' +
						`🆔 <i>Код транзакції</i>: <code>${transaction[0].transaction_id}</code>\n` +
						`📥 <i>Відправник</i>: <code>${sender_name}</code>\n` +
						`💰 <i>Сума переказу</i>: <code>${amount}</code> ₴` +
						(receiver_id === null ? '\n\n🏦 На рахунок Zyun Банк' : ''),
					parse_mode: 'HTML'
				});
			}
		}

		return transaction[0];
	} catch {
		return null;
	}
};

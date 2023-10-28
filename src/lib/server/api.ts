import { PG_DB, PG_PASSWORD, PG_USER, TG_ID, TG_TOKEN } from '$env/static/private';
import axios from 'axios';
import postgres from 'postgres';

export const telegram = async (method: string, data: any) => {
	try {
		const result = await axios.post(`https://api.telegram.org/bot${TG_ID}:${TG_TOKEN}/${method}`, {
			parse_mode: 'Markdown',
			...data
		});

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

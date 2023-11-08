import { PG_DB, PG_PASSWORD, PG_USER, TG_ID, TG_TOKEN } from '$env/static/private';
import type { PaginationType, TransactionItemType } from '$lib/utilities';
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
	emoji: string | null;
	business_name: string | null;
	nickname: string;
	api: string | null;
	admin: boolean;
	banned: boolean;
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

export const getRandomQuote = async () => {
	try {
		const quotes = await sql<
			{ id: string; text: string }[]
		>`select * from quotes order by random() limit 1`;
		if (quotes.length !== 1) {
			return null;
		}

		return quotes[0].text;
	} catch {
		return null;
	}
};

export const findUserByNickname = async (nickname: string) => {
	try {
		const users = await sql<
			UserType[]
		>`select * from users where lower(${nickname}) in (lower(nickname), lower(business_name))`;
		if (users.length !== 1) {
			return null;
		}

		return users[0];
	} catch {
		return null;
	}
};

export const calculateBalance = async (id: string) => {
	try {
		const results = await sql<{ balance: number }[]>`select calculate_balance(${id}) as balance`;

		if (results.length !== 1) {
			return 0;
		}

		return results[0].balance;
	} catch {
		return 0;
	}
};

export const moneySupply = async () => {
	try {
		const results = await sql<{ money_supply: number }[]>`
			select
				sum(
					case
						when receiver_id is null then -amount
						else amount
					end
				) as money_supply
			from transactions
			where sender_id is null or receiver_id is null
		`;

		if (results.length !== 1) {
			return 0;
		}

		return results[0].money_supply;
	} catch {
		return 0;
	}
};

export const getUsersIgnoreId = async (id: string) => {
	try {
		const users = await sql<
			UserType[]
		>`select * from users where id <> ${id} and not banned order by business_name, nickname`;

		return users;
	} catch {
		return [];
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
	emoji: string | null;
	business_name: string | null;
	nickname: string;
	api: string | null;
	banned: boolean;
}) => {
	try {
		await sql`update users set ${sql(user)} where id = ${user.id}`;
	} catch (e: any) {
		console.log(e);
	}
};

export const insertUser = async (user: { id: string; nickname: string }) => {
	try {
		await sql`insert into users ${sql(user)}`;
	} catch {}
};

export type ProductType = {
	id: string;
	user_id: string;
	name: string;
	description: string;
	stack: number;
	price: number;
	quantity: number;
};

export const insertProduct = async (product: ProductType) => {
	try {
		product.name = clearString(product.name);
		product.description = clearString(product.description);
		await sql`insert into products ${sql(
			product,
			'user_id',
			'name',
			'description',
			'stack',
			'price',
			'quantity'
		)}`;
	} catch {}
};

export const updateProduct = async (product: ProductType) => {
	try {
		product.name = clearString(product.name);
		product.description = clearString(product.description);
		await sql`update products set ${sql(
			product,
			'name',
			'description',
			'stack',
			'price',
			'quantity'
		)} where id = ${product.id}`;
	} catch {}
};

export const minusQuantityProduct = async (id: string, quantity: number) => {
	try {
		await sql`
			update products
			set quantity = GREATEST(quantity - ${quantity}, 0)
			where id = ${id}`;
	} catch (e) {
		console.log(e);
	}
};

export const pluseQuantityProduct = async (id: string, quantity: number) => {
	try {
		await sql`
			update products
			set quantity = quantity + ${quantity}
			where id = ${id}`;
	} catch (e) {
		console.log(e);
	}
};

export const getProductCodes = async (user_id: string) => {
	try {
		const items = await sql<ProductType[]>`
			select *
			from products
			where user_id = ${user_id}
		`;
		return items.map((item) => item.id);
	} catch (e) {
		console.log(e);

		return [];
	}
};

export const deleteProduct = async (id: string) => {
	try {
		await sql`delete from products where id = ${id}`;
	} catch {}
};

export const getProducts = async (user_id: string, name: string, page: number) => {
	page--;
	const result: PaginationType<ProductType> = {
		items: [],
		more: false
	};

	try {
		const items = await sql<ProductType[]>`
			select *
			from products
			where user_id = ${user_id} and name ilike ${`%${name}%`} 
			order by id desc
			offset ${page * perPage}
			limit ${perPage + 1}
		`;

		if (items.length > perPage) {
			items.pop();
			result.more = true;
		}

		result.items = items;
	} catch {}

	return result;
};

export const getProductsByIds = async (ids: string[]) => {
	try {
		const items = await sql<ProductType[]>`
			select *
			from products
			where id = any(${ids})
		`;
		return items;
	} catch (e) {
		console.log(e);

		return [];
	}
};

export const findProductById = async (id: string, user_id: string) => {
	try {
		const items = await sql<ProductType[]>`
			select *
			from products
			where id = ${id} and user_id = ${user_id}
		`;

		if (items.length !== 1) {
			return null;
		}

		return items[0];
	} catch (e) {
		console.log(e);

		return null;
	}
};

export const getProduct = async (id: string) => {
	try {
		const products = await sql<ProductType[]>`select * from products where id = ${id}`;
		if (products.length !== 1) {
			return null;
		}

		return products[0];
	} catch {
		return null;
	}
};

export async function findTransactionById(id: string) {
	try {
		const results = await sql<TransactionItemType[]>`
			select
					t.id,
					case
						when us.nickname is not null then us.nickname
						else 'Zyun Банк'
					end sender_nickname,
					case
						when ur.nickname is not null then ur.nickname
						else 'Zyun Банк'
					end receiver_nickname,
					t.amount,
					case
						when t.comment is null then 'не вказано'
						else t.comment
					end comment,
					to_char(t.timestamp, 'DD.MM.YYYY HH24:MI') AS date_string
				from transactions t
				left join users us on us.id = t.sender_id
				left join users ur on ur.id = t.receiver_id
				where t.id = ${id}`;

		if (results.length !== 1) {
			return 0;
		}

		return results[0];
	} catch {
		return 0;
	}
}

export type TransactionType = {
	status:
		| 'INVALID_AMOUNT'
		| 'INVALID_OPERATION'
		| 'SENDER_NOT_FOUND'
		| 'SENDER_IS_BANNED'
		| 'NO_COST'
		| 'RECEIVER_NOT_FOUND'
		| 'RECEIVER_IS_BANNED'
		| 'ERROR'
		| 'SUCCESS';
	transaction_id: string | null;
};

export const clearString = (value: string) => value.replace(/\s+/g, ' ').trim().slice(0, 200);

export type InvoiceItemType = {
	name: string;
	price: number;
	quantity: number;
	description: string;
};

export type InvoiceType = {
	id: string;
	transaction_id: string;
	payer_name: string;
	user_id: string;
	name: string;
	items: InvoiceItemType[];
};

export const getInvoices = async (user_id: string, page: number) => {
	page--;
	const result: PaginationType<InvoiceType> = {
		items: [],
		more: false
	};
	try {
		const items = await sql<(InvoiceType & { items: string })[]>`
			select
				i.id,
				i.transaction_id,
				case
					when us.business_name is null then us.nickname
					else us.business_name
				end payer_name,
				i.user_id,
				case
					when uc.business_name is null then uc.nickname
					else uc.business_name
				end name,
				i.items
			from invoices i
			left join transactions t on t.id = i.transaction_id
			left join users us on us.id = t.sender_id
			left join users uc on uc.id = i.user_id
			where ${user_id} = t.sender_id or ${user_id} = i.user_id
			order by i.id desc
			offset ${page * perPage}
			limit ${perPage + 1}
		`;

		if (items.length > perPage) {
			items.pop();
			result.more = true;
		}

		result.items = items.map((item) => {
			const items: InvoiceItemType[] = JSON.parse(item.items);

			return {
				...item,
				items
			};
		});
	} catch {}

	return result;
};

export const findInvoice = async (id: string) => {
	try {
		const invoice = await sql<(InvoiceType & { items: string })[]>`
			select
				i.id,
				i.transaction_id,
				case
					when us.business_name is null then us.nickname
					else us.business_name
				end payer_name,
				i.user_id,
				case
					when uc.business_name is null then uc.nickname
					else uc.business_name
				end name,
				i.items
			from invoices i
			left join transactions t on t.id = i.transaction_id
			left join users us on us.id = t.sender_id
			left join users uc on uc.id = i.user_id
			where i.id = ${id}
			order by i.id desc
		`;

		if (invoice.length !== 1) {
			return null;
		}

		const items: InvoiceItemType[] = JSON.parse(invoice[0].items);

		const result: InvoiceType = {
			...invoice[0],
			items
		};

		return result;
	} catch {
		return null;
	}
};

export const createInvoice = async (user_id: string, items: object) => {
	try {
		const row = await sql<{ id: string }[]>`
			insert into invoices
				(user_id, items)
			values
				(${user_id}, ${JSON.stringify(items)})
			returning id`;

		return row[0].id ?? null;
	} catch {
		return null;
	}
};

export const deleteInvoice = async (id: string) => {
	try {
		await sql`delete from invoices where id = ${id}`;
	} catch {}
};

export const updateInvoice = async (id: string, transaction_id: string) => {
	try {
		await sql`update invoices set transaction_id = ${transaction_id} where id = ${id}`;
	} catch (e: any) {
		console.log(e);
	}
};

export const transferMoney = async (
	sender_id: string | null,
	receiver_id: string | null,
	amount: number,
	comment: string
): Promise<TransactionType> => {
	let error: TransactionType = {
		status: 'ERROR',
		transaction_id: null
	};
	try {
		const cleanedString = clearString(comment);
		const safeComment = cleanedString.length === 0 ? null : cleanedString;

		let transaction = await sql<
			TransactionType[]
		>`SELECT * FROM perform_transaction(${sender_id}, ${receiver_id}, ${amount}, ${safeComment})`;
		if (transaction.length !== 1) {
			return error;
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
		return error;
	}
};

const perPage = 10;

export const loadTransactions = async (
	id: string,
	page: number,
	code: string,
	date: string,
	addressee_id: string
) => {
	page--;
	const result: PaginationType<TransactionItemType> = {
		items: [],
		more: false
	};
	try {
		const items = await sql<TransactionItemType[]>`
			select
				t.id,
				case
					when t.sender_id = ${id} then ur.emoji 
					else us.emoji
				end emoji,
				case
					when t.sender_id = ${id} then ur.business_name
					else us.business_name
				end business_name,
				case
					when t.sender_id = ${id} then -amount 
					else amount 
				end amount,
				coalesce(case
					when t.sender_id = ${id} then ur.nickname
					else us.nickname
				end, 'Zyun Банк') nickname,
				case
					when t.comment is null then 'не вказано'
					else t.comment
				end comment,
				jsonb_build_object(
					'day', EXTRACT(DAY from t.timestamp),
					'month', EXTRACT(MONTH from t.timestamp),
					'year', EXTRACT(YEAR from t.timestamp),
					'hour', EXTRACT(HOUR from t.timestamp),
					'minute', EXTRACT(MINUTE from t.timestamp)
				) AS date
			from transactions t
			left join users us on us.id = t.sender_id
			left join users ur on ur.id = t.receiver_id
			where
				${id} in(t.sender_id, t.receiver_id)
				and (
					(
						${code} = ''
						and (
							${addressee_id} = '-1'
							or (
								${addressee_id} = '0'
								and (t.sender_id is null or t.receiver_id is null)
							)
							or ${addressee_id} in(t.sender_id, t.receiver_id)
						) and (
							${date} = ''
							or (${date} <> '' and t.timestamp <= TO_TIMESTAMP(${date}, 'YYYY-MM-DD"T"HH24:MI'))
						)
					)
					or ${code} = cast(t.id as text)
				)
			order by id desc
			offset ${page * perPage}
			limit ${perPage + 1}
		`;

		if (items.length > perPage) {
			items.pop();
			result.more = true;
		}

		result.items = items;
	} catch {}

	return result;
};

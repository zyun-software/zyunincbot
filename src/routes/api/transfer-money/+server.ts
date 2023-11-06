import { findApiUserOrErrorJson, findUserByNickname, transferMoney } from '$lib/server';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const token = request.headers.get('token') ?? '';

	const user = await findApiUserOrErrorJson(token);
	if ('message' in user) {
		return json(user);
	}

	const data = await request.json();

	const receiver = await findUserByNickname(data.receiver);
	console.log(receiver);

	const receiver_id = receiver?.id ?? '-1';

	const transaction = await transferMoney(
		user.id,
		receiver_id,
		data.amount ?? -1,
		data.comment ?? ''
	);

	const result = {
		success: transaction.status === 'SUCCESS',
		transaction
	};

	return json(result);
}

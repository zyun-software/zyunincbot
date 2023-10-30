import { calculateBalance, getUser } from '$lib/server';

export async function load({ cookies, request }) {
	const user = await getUser(cookies);

	const balance = await calculateBalance(user.id);

	return {
		balance
	};
}

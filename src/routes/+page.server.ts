import { getUser } from '$lib/server';

export async function load({ cookies }) {
	const user = await getUser(cookies);

	return {
		nickname: user.nickname
	};
}

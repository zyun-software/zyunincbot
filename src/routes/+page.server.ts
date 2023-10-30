import { getRandomQuote, getUser } from '$lib/server';

export async function load({ cookies }) {
	const user = await getUser(cookies);
	const quote = await getRandomQuote();

	return {
		nickname: user.nickname,
		emoji: user.emoji,
		business_name: user.business_name,
		quote
	};
}

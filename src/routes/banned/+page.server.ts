import { getUser } from '$lib/server';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
	let banned = true;
	try {
		await getUser(cookies);

		banned = false;
	} catch {}

	if (!banned) {
		throw redirect(307, '/bank');
	}

	return {};
}

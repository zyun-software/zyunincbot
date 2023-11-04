import { getUser, updateUser } from '$lib/server';
import { v4 as uuidv4 } from 'uuid';

export async function load({ cookies }) {
	if (!!cookies.get('genetateTokenAction')) {
		cookies.delete('genetateTokenAction');
		return {};
	}

	const user = await getUser(cookies);

	return {
		token: user.api ? `${user.id}:${user.api}` : ''
	};
}

export const actions = {
	genetateToken: async ({ cookies }) => {
		cookies.set('genetateTokenAction', 'true');
		const user = await getUser(cookies);

		user.api = uuidv4();

		await updateUser(user);

		return {
			token: `${user.id}:${user.api}`
		};
	}
};

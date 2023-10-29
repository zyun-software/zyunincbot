export async function load({ cookies }) {
	return {};
}

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();

		console.log('send-money');

		return {
			success: true
		};
	}
};

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();

		const initData = (data.get('init-data') ?? '').toString();
		cookies.set('init-data', initData);

		console.log(initData);

		return {
			success: true
		};
	}
};

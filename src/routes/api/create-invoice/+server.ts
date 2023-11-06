import { createInvoiceFromJson, findApiUserOrErrorJson } from '$lib/server';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const token = request.headers.get('token') ?? '';

	const user = await findApiUserOrErrorJson(token);
	if ('message' in user) {
		return json(user);
	}

	const data = await request.text();

	const invoice = await createInvoiceFromJson(data, user.id);

	return json(invoice);
}

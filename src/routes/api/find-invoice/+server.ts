import { findApiUserOrErrorJson, findInvoice, type InvoiceType } from '$lib/server';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const token = request.headers.get('token') ?? '';

	const user = await findApiUserOrErrorJson(token);
	if ('message' in user) {
		return json(user);
	}

	const result: {
		success: boolean;
		invoice: InvoiceType | null;
	} = {
		success: false,
		invoice: null
	};

	const data = await request.json();

	const invoice = await findInvoice(data.id ?? '-1');
	if (invoice) {
		result.success = true;
		result.invoice = invoice;
	}

	return json(result);
}

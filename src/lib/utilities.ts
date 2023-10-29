export function alertUtility(message: any, callback?: () => void): void {
	const webApp = window?.Telegram?.WebApp;
	if (webApp) {
		webApp.showAlert(message, callback);
	} else {
		alert(message);
		if (callback) {
			callback();
		}
	}
}

export async function confirmUtility(
	message: any,
	callback: (yes?: boolean) => Promise<void> | void
): Promise<void> {
	const webApp = window?.Telegram?.WebApp;
	if (webApp) {
		webApp.showConfirm(message, callback);
	} else {
		const yes = confirm(message);
		await callback(yes);
	}
}

export function hideMainButton(): void {
	const webApp = window?.Telegram?.WebApp;
	if (webApp) {
		webApp.MainButton.hide();
	}
}

export function hideBackButton(): void {
	const webApp = window?.Telegram?.WebApp;
	if (webApp) {
		webApp.BackButton.hide();
	}
}

type HandlerType = () => Promise<void> | void;

let mainButtonHandler: HandlerType | null = null;
export function showMainButton(text: string, handler: HandlerType): void {
	const webApp = window?.Telegram?.WebApp;
	if (webApp) {
		const MainButton = webApp.MainButton;
		MainButton.text = text;
		if (mainButtonHandler) {
			MainButton.offClick(mainButtonHandler);
		}
		mainButtonHandler = handler;
		MainButton.onClick(handler);
		MainButton.show();
	}
}

let backButtonHandler: HandlerType | null = null;
export function showBackButton(handler: HandlerType): void {
	const webApp = window?.Telegram?.WebApp;
	if (webApp) {
		const BackButton = webApp.BackButton;
		if (backButtonHandler) {
			BackButton.offClick(backButtonHandler);
		}
		backButtonHandler = handler;
		BackButton.onClick(handler);
		BackButton.show();
	}
}

// export async function requestUtility<TResponse>(
// 	method: string,
// 	data: object = {}
// ): Promise<TResponse | null> {
// 	try {
// 		const serverResponse = await axios.post<{
// 			unauthorized: boolean;
// 			success: boolean;
// 			error: string;
// 			response: TResponse;
// 		}>(
// 			'/panel',
// 			{
// 				method,
// 				data
// 			},
// 			{
// 				headers: {
// 					'x-telegram-web-app-init-data': window.Telegram.WebApp.initData
// 				}
// 			}
// 		);

// 		const { unauthorized, success, error, response } = serverResponse.data;

// 		unauth.set(unauthorized);

// 		if (unauthorized) {
// 			pageComponent.set(Unauthorized);
// 			return null;
// 		}

// 		if (!success) {
// 			alertUtility(`💥 ${error}`);
// 			return null;
// 		}

// 		return response;
// 	} catch {
// 		alertUtility('💥 Помилка відправки запиту');
// 		return null;
// 	}
// }

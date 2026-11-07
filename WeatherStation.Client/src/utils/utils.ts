export function pageTitle(page: string) {
	return `${page} | Weather Station`;
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = atob(base64);
	return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

// dividing by 1 / step instead of multiplying by step avoids float noise like 993.4000000000001
export function roundDown(value: number, step: number) {
	return Math.floor(value / step) / (1 / step);
}

export function roundUp(value: number, step: number) {
	return Math.ceil(value / step) / (1 / step);
}

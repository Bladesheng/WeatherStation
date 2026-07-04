/// <reference no-default-lib="true"/>
/// <reference lib="webworker" />
/// <reference lib="esnext" />

// https://github.com/microsoft/TypeScript/issues/14877
// https://kit.svelte.dev/docs/service-workers#type-safety

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

self.addEventListener('install', async () => {
	console.log('[SW] Installing new service worker.');
	await self.skipWaiting();
	console.log('[SW] New Service worker installed.');
});

self.addEventListener('activate', () => {
	console.log('[SW] Service worker is active.');
});

self.addEventListener('push', async (event) => {
	if (self.Notification.permission !== 'granted') {
		throw Error('[SW] Notifications are disabled.');
	}

	const data: {
		title: string;
		icon: string;
		body: string;
	} = event.data?.json();

	await self.registration.showNotification(data.title, {
		body: data.body,
		icon: `icons/weathericons/${data.icon}.svg`,
		data: {url: 'https://weather.bladesheng.com/forecast'},
	});
});

self.addEventListener('notificationclick', async (event) => {
	event.notification.close();
	await self.clients.openWindow(event.notification.data.url);
});

export {};

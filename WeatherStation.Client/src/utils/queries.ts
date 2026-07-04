import {ofetch} from 'ofetch';
import {mutationOptions, queryOptions} from '@tanstack/react-query';
import type {IForecastResponse} from '@/types/forecastResponse.ts';
import type {IReading} from '@/types/reading.ts';
import type {INotificationDeliveryTime} from '@/types/notificationDeliveryTime.ts';
import {urlBase64ToUint8Array} from '@/utils/utils.ts';

const api = ofetch.create({
	baseURL: import.meta.env.DEV ? 'http://localhost:5087' : 'https://weather-api.bladesheng.com',
});

export function readings24QueryOptions() {
	return queryOptions({
		queryKey: ['readings24'],
		queryFn: async () => {
			const res = await api<IReading[]>('/api/readings/24h');
			return res;
		},
	});
}

export function readingsMonthQueryOptions(year: string, month: string) {
	return queryOptions({
		queryKey: ['readingsMonth', year, month],
		queryFn: async () => {
			const res = await api<IReading[]>(`/api/readings/month/${year}/${month}`);
			return res;
		},
	});
}

export function forecastQueryOptions() {
	return queryOptions({
		queryKey: ['forecast'],
		queryFn: async () => {
			const res = await api<IForecastResponse>('/forecast');
			return res;
		},
	});
}

export function vapidKeyPublicQueryOptions() {
	return queryOptions({
		queryKey: ['vapidKeyPublic'],
		queryFn: async () => {
			const res = await api<{vapidKeyPublic: string}>('/notifications/vapid-public-key');
			return res.vapidKeyPublic;
		},
		staleTime: Infinity,
	});
}

const subscriptionsKeys = ['push subscriptions'];

export function allSubscriptionsQueryOptions() {
	return queryOptions({
		queryKey: subscriptionsKeys,
		queryFn: async () => {
			const registration = await navigator.serviceWorker.ready;
			const pushSubscription = await registration.pushManager.getSubscription();

			if (!pushSubscription) {
				return [];
			}

			const res = await api<INotificationDeliveryTime[]>('/notifications/subscriptions', {
				query: {endpoint: pushSubscription.endpoint},
			});
			return res;
		},
	});
}

export function createPushSubscriptionMutationOptions() {
	return mutationOptions({
		mutationFn: async (sendAt: string, {client}) => {
			let permission = Notification.permission;
			// user has not decided yet - show them prompt
			if (permission === 'default') {
				permission = await Notification.requestPermission();
			}

			// user denied permission or just closed the prompt
			if (permission === 'denied' || permission === 'default') {
				return;
			}
			const serviceWorkerRegistration = await navigator.serviceWorker.ready;

			const publicKey = await client.fetchQuery(vapidKeyPublicQueryOptions());

			const pushSubscription = await serviceWorkerRegistration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(publicKey),
			});

			const pushSubscriptionJson = pushSubscription.toJSON();
			if (!pushSubscriptionJson.keys?.p256dh || !pushSubscriptionJson.keys?.auth) {
				throw Error('Push subscription keys are missing.');
			}

			await api('/notifications/subscriptions', {
				method: 'POST',
				body: {
					endpoint: pushSubscriptionJson.endpoint,
					p256dh: pushSubscriptionJson.keys.p256dh,
					auth: pushSubscriptionJson.keys.auth,
					sendAt,
				},
			});
		},

		onSuccess: async (data, variables, onMutateResult, context) => {
			await context.client.invalidateQueries({queryKey: subscriptionsKeys});
		},
	});
}

export function editPushSubscriptionMutationOptions() {
	return mutationOptions({
		mutationFn: async ({id, sendAt}: {id: number; sendAt: string}) => {
			const registration = await navigator.serviceWorker.ready;
			const pushSubscription = await registration.pushManager.getSubscription();

			if (!pushSubscription?.endpoint) {
				throw Error('Push subscription is missing.');
			}

			await api('/notifications/subscriptions', {
				method: 'PATCH',
				body: {
					id,
					endpoint: pushSubscription.endpoint,
					sendAt,
				},
			});
		},

		onSuccess: async (data, variables, onMutateResult, context) => {
			await context.client.invalidateQueries({queryKey: subscriptionsKeys});
		},
	});
}

export function deletePushSubscriptionMutationOptions() {
	return mutationOptions({
		mutationFn: async (id: number) => {
			const registration = await navigator.serviceWorker.ready;
			const pushSubscription = await registration.pushManager.getSubscription();

			if (!pushSubscription?.endpoint) {
				throw Error('Push subscription is missing.');
			}

			await api('/notifications/subscriptions', {
				method: 'DELETE',
				body: {
					id,
					endpoint: pushSubscription.endpoint,
				},
			});
		},

		onSuccess: async (data, variables, onMutateResult, context) => {
			await context.client.invalidateQueries({queryKey: subscriptionsKeys});
		},
	});
}

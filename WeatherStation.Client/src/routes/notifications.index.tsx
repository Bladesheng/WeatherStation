import {createFileRoute} from '@tanstack/react-router';
import {pageTitle} from '@/utils/utils.ts';
import {useMutation, useSuspenseQuery} from '@tanstack/react-query';
import {
	allSubscriptionsQueryOptions,
	createPushSubscriptionMutationOptions,
} from '@/utils/queries.ts';
import {useState} from 'react';
import {NotificationDeliveryTime} from '@/components/notifications/NotificationDeliveryTime.tsx';

export const Route = createFileRoute('/notifications/')({
	component: Notifications,

	loader: ({context}) => context.queryClient.ensureQueryData(allSubscriptionsQueryOptions()),

	head: () => ({
		meta: [{title: pageTitle('Notifications')}],
	}),
});

function Notifications() {
	const query = useSuspenseQuery(allSubscriptionsQueryOptions());

	const createMutation = useMutation(createPushSubscriptionMutationOptions());

	const [sendAt, setSendAt] = useState('06:00');

	return (
		<div>
			<input
				type="time"
				className="input"
				defaultValue={sendAt}
				onChange={(e) => setSendAt(e.currentTarget.value)}
				disabled={createMutation.isPending}
			/>

			<button
				onClick={() => createMutation.mutate(sendAt)}
				className="btn"
				disabled={createMutation.isPending}
			>
				Create new notification
			</button>

			<ul>
				{query.data.map((n) => (
					<NotificationDeliveryTime key={n.id} notification={n} />
				))}
			</ul>
		</div>
	);
}

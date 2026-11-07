import {createFileRoute} from '@tanstack/react-router';
import {pageTitle} from '@/utils/utils.ts';
import {useMutation, useSuspenseQuery} from '@tanstack/react-query';
import {
	allSubscriptionsQueryOptions,
	createPushSubscriptionMutationOptions,
} from '@/utils/queries.ts';
import {NotificationRow} from '@/components/notifications/NotificationRow.tsx';

const allDays = [0, 1, 2, 3, 4, 5, 6];

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

	return (
		<main className="m-4 flex flex-1 flex-col gap-2">
			<div className="overflow-hidden rounded border border-base-content/10 bg-base-200">
				<ul>
					{query.data.map((n) => (
						<NotificationRow key={n.id} notification={n} />
					))}
				</ul>

				{query.data.length === 0 && (
					<div className="border-b border-base-content/10 px-4 py-7 text-center text-sm opacity-70">
						No notifications yet.
					</div>
				)}

				<button
					type="button"
					className="btn h-12 w-full rounded-none btn-ghost font-medium"
					onClick={() => createMutation.mutate({sendAt: '07:00', days: allDays})}
					disabled={createMutation.isPending}
				>
					<span
						className={
							createMutation.isPending
								? 'loading loading-spinner'
								: 'icon-[material-symbols--add] text-xl'
						}
					/>
					Add notification
				</button>
			</div>
		</main>
	);
}

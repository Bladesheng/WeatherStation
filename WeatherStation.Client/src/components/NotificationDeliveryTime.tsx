import {useMutation} from '@tanstack/react-query';
import {
	deletePushSubscriptionMutationOptions,
	editPushSubscriptionMutationOptions,
} from '@/utils/queries.ts';
import type {INotificationDeliveryTime} from '@/types/notificationDeliveryTime.ts';

export function NotificationDeliveryTime({
	notification,
}: {
	notification: INotificationDeliveryTime;
}) {
	const editMutation = useMutation(editPushSubscriptionMutationOptions());
	const deleteMutation = useMutation(deletePushSubscriptionMutationOptions());

	const isPending = editMutation.isPending || deleteMutation.isPending;

	return (
		<li>
			<input
				type="time"
				className="input"
				defaultValue={notification.sendAt}
				onBlur={(e) => editMutation.mutate({id: notification.id, sendAt: e.currentTarget.value})}
				disabled={isPending}
			/>

			<button
				className="btn btn-error"
				onClick={() => deleteMutation.mutate(notification.id)}
				disabled={isPending}
			>
				<span className={isPending ? 'loading loading-spinner' : 'icon-[heroicons--trash]'}></span>
			</button>
		</li>
	);
}

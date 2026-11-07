import {useMutation} from '@tanstack/react-query';
import {
	deletePushSubscriptionMutationOptions,
	editPushSubscriptionMutationOptions,
} from '@/utils/queries.ts';
import type {INotificationDeliveryTime} from '@/types/notificationDeliveryTime.ts';
import {type IDateLocale, useDateLocale} from '@/contexts/DateLocaleContext.tsx';
import {capitalize} from '@/utils/utils.ts';

// Monday first
const weekDayNumbers = [1, 2, 3, 4, 5, 6, 0];

function weekDays(locale: IDateLocale) {
	return weekDayNumbers.map((day) => {
		// 2023-01-01 was a Sunday, so the 1st + day lands on the right weekday
		const date = new Date(2023, 0, 1 + day);
		return {
			day,
			label: date.toLocaleDateString(locale, {weekday: 'narrow'}).toUpperCase(),
			name: capitalize(date.toLocaleDateString(locale, {weekday: 'long'})),
		};
	});
}

export function NotificationRow({notification}: {notification: INotificationDeliveryTime}) {
	const {dateLocale} = useDateLocale();
	const editMutation = useMutation(editPushSubscriptionMutationOptions());
	const deleteMutation = useMutation(deletePushSubscriptionMutationOptions());

	const isPending = editMutation.isPending || deleteMutation.isPending;

	// api sends HH:mm:ss
	const sendAt = notification.sendAt.slice(0, 5);

	function saveSendAt(input: HTMLInputElement) {
		if (!input.value) {
			input.value = sendAt;
			return;
		}

		if (input.value === sendAt) {
			// don't send request when nothing changed
			return;
		}

		editMutation.mutate({id: notification.id, sendAt: input.value});
	}

	function toggleDay(day: number) {
		const days = notification.days.includes(day)
			? notification.days.filter((d) => d !== day)
			: [...notification.days, day];

		editMutation.mutate({id: notification.id, days});
	}

	return (
		// mobile: time and delete on the first line, days below - desktop: everything on one line
		<li className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-3 border-b border-base-content/10 px-3 py-3.5 sm:grid-cols-[auto_1fr_auto] sm:gap-x-5 sm:px-4">
			<div className="flex items-center gap-3">
				<span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
					<span className="icon-[material-symbols--notifications] text-xl" />
				</span>

				<input
					type="time"
					aria-label="Notification time"
					// not daisyUI's .input - its display: flex breaks the native time field layout
					// browser hides the clock icon on disabled inputs, keep it so the row doesn't jump while saving
					className="h-10 cursor-pointer rounded-field border border-transparent px-1.5 text-2xl font-semibold tabular-nums hover:border-base-content/10 hover:bg-base-100 disabled:cursor-default [&::-webkit-calendar-picker-indicator]:visible"
					defaultValue={sendAt}
					onBlur={(e) => saveSendAt(e.currentTarget)}
					onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
					disabled={isPending}
				/>
			</div>

			<div
				role="group"
				aria-label="Days"
				className="col-span-2 row-start-2 flex justify-center gap-1.5 sm:col-span-1 sm:col-start-2 sm:row-start-1"
			>
				{weekDays(dateLocale).map(({day, label, name}) => (
					<button
						key={day}
						type="button"
						title={name}
						aria-label={name}
						aria-pressed={notification.days.includes(day)}
						className={`btn max-w-8.5 flex-1 px-0 text-xs btn-sm ${notification.days.includes(day) ? 'btn-primary' : 'btn-ghost btn-bordered'}`}
						onClick={() => toggleDay(day)}
						disabled={isPending}
					>
						{label}
					</button>
				))}
			</div>

			<button
				type="button"
				title="Delete"
				aria-label="Delete notification"
				className="btn btn-circle btn-ghost btn-sm hover:btn-error"
				onClick={() => deleteMutation.mutate(notification.id)}
				disabled={isPending}
			>
				<span
					className={
						isPending ? 'loading loading-spinner' : 'icon-[material-symbols--delete] text-lg'
					}
				/>
			</button>
		</li>
	);
}

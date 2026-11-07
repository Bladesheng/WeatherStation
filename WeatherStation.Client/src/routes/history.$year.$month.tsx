import {Link, createFileRoute} from '@tanstack/react-router';
import {readingsMonthQueryOptions} from '@/utils/queries.ts';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Temporal} from 'temporal-polyfill';
import {capitalize, pageTitle} from '@/utils/utils.ts';
import {useDateLocale} from '@/contexts/DateLocaleContext.tsx';
import {isHistoryMonth} from '@/utils/history.ts';
import {MonthStats} from '@/components/history/MonthStats.tsx';
import {ReadingsChart} from '@/components/dashboard/ReadingsChart.tsx';

export const Route = createFileRoute('/history/$year/$month')({
	component: HistoryMonth,

	loader: ({context, params}) =>
		context.queryClient.ensureQueryData(readingsMonthQueryOptions(params.year, params.month)),

	head: () => ({
		meta: [{title: pageTitle('History')}],
	}),
});

function MonthLink({
	month,
	direction,
}: {
	month: Temporal.PlainYearMonth;
	direction: 'previous' | 'next';
}) {
	const icon =
		direction === 'previous'
			? 'icon-[material-symbols--chevron-left]'
			: 'icon-[material-symbols--chevron-right]';

	const isDisabled = !isHistoryMonth(month);

	return (
		<Link
			to="/history/$year/$month"
			params={{year: month.year.toString(), month: month.month.toString()}}
			disabled={isDisabled}
			className={`btn btn-square btn-sm btn-bordered ${isDisabled ? 'btn-disabled' : ''}`}
			aria-label={`${direction} month`}
		>
			<span className={`${icon} text-xl`} />
		</Link>
	);
}

function HistoryMonth() {
	const {dateLocale} = useDateLocale();
	const {year, month} = Route.useParams();
	const yearMonth = new Temporal.PlainYearMonth(Number(year), Number(month));

	const readingsQuery = useSuspenseQuery(readingsMonthQueryOptions(year, month));
	const readings = readingsQuery.data;

	const days = new Set(readings.map((r) => r.createdAt.toDateString())).size;

	return (
		<>
			<div className="flex flex-wrap items-center gap-3">
				<div className="flex gap-2">
					<MonthLink month={yearMonth.subtract({months: 1})} direction="previous" />
					<MonthLink month={yearMonth.add({months: 1})} direction="next" />
				</div>

				<h1 className="text-xl font-semibold">
					{capitalize(
						// the iso8601 calendar gives "2026 listopadu" in Czech, the default gregorian one "listopad 2026"
						yearMonth
							.toPlainDate({day: 1})
							.toLocaleString(dateLocale, {month: 'long', year: 'numeric'})
					)}
				</h1>

				<span className="text-sm opacity-70">
					{days} {days === 1 ? 'day' : 'days'} · {readings.length.toLocaleString('en')} readings
				</span>
			</div>

			{readings.length > 0 ? (
				<>
					<MonthStats readings={readings} />

					<ReadingsChart readings={readings} xAxisScale="days" />
				</>
			) : (
				<div className="flex flex-1 items-center justify-center">No readings for this month</div>
			)}
		</>
	);
}

import {createFileRoute} from '@tanstack/react-router';
import {readingsMonthQueryOptions} from '@/utils/queries.ts';
import {useSuspenseQuery} from '@tanstack/react-query';

export const Route = createFileRoute('/history/$year/$month')({
	component: HistoryMonth,

	loader: ({context, params}) =>
		context.queryClient.ensureQueryData(readingsMonthQueryOptions(params.year, params.month)),
});

function HistoryMonth() {
	const {year, month} = Route.useParams();

	const readingsQuery = useSuspenseQuery(readingsMonthQueryOptions(year, month));

	return (
		<div>
			{year}/{month}
			{readingsQuery.data.map((reading) => (
				<div key={reading.id}>
					<div>{reading.createdAt.toString()}</div>
					<div>{reading.temperatureBmp}</div>
				</div>
			))}
		</div>
	);
}

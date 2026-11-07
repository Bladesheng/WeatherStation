import {createFileRoute} from '@tanstack/react-router';
import {pageTitle} from '@/utils/utils.ts';
import {readings24QueryOptions} from '@/utils/queries.ts';
import {useSuspenseQuery} from '@tanstack/react-query';
import {CurrentStats} from '@/components/dashboard/CurrentStats.tsx';
import {ReadingsChart} from '@/components/dashboard/ReadingsChart.tsx';

export const Route = createFileRoute('/')({
	component: Index,

	loader: ({context}) => context.queryClient.ensureQueryData(readings24QueryOptions()),

	head: () => ({
		meta: [{title: pageTitle('Dashboard')}],
	}),
});

export function Index() {
	const readingsQuery = useSuspenseQuery(readings24QueryOptions());

	return (
		<>
			<main className="m-4 flex flex-1 flex-col gap-2">
				<CurrentStats readings={readingsQuery.data} />

				<ReadingsChart readings={readingsQuery.data} xAxisScale="hours" />
			</main>
		</>
	);
}

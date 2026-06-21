import {createFileRoute} from '@tanstack/react-router';
import {pageTitle} from '@/utils/utils.ts';
import {readings24QueryOptions} from '@/utils/queries.ts';
import {useSuspenseQuery} from '@tanstack/react-query';

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
			<main className="m-4">
				{readingsQuery.data.map((reading) => (
					<div key={reading.id}>
						<div>{reading.createdAt}</div>
						<div>{reading.temperatureBmp}</div>
					</div>
				))}
			</main>
		</>
	);
}

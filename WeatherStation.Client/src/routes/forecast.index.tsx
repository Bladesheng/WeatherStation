import {createFileRoute} from '@tanstack/react-router';
import {pageTitle} from '@/utils/utils.ts';
import {forecastQueryOptions} from '@/utils/queries.ts';
import {useSuspenseQuery} from '@tanstack/react-query';

export const Route = createFileRoute('/forecast/')({
	component: Forecast,

	loader: ({context}) => context.queryClient.ensureQueryData(forecastQueryOptions()),

	head: () => ({
		meta: [{title: pageTitle('Forecast')}],
	}),
});

function Forecast() {
	const forecastQuery = useSuspenseQuery(forecastQueryOptions());

	return (
		<div>
			{/**/}
			{forecastQuery.data.forecast[0].data.instant.details.air_temperature}
		</div>
	);
}

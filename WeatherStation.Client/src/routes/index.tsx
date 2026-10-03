import {createFileRoute} from '@tanstack/react-router';
import {pageTitle} from '@/utils/utils.ts';
import {readings24QueryOptions} from '@/utils/queries.ts';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Stats} from '@/components/dashboard/Stats.tsx';
import {ReadingsChart} from '@/components/dashboard/ReadingsChart.tsx';

export const Route = createFileRoute('/')({
	component: Index,

	loader: ({context}) => context.queryClient.ensureQueryData(readings24QueryOptions()),

	head: () => ({
		meta: [{title: pageTitle('Dashboard')}],
	}),
});

function formatDate(date: Date): string {
	function pad(n: number): string {
		return n.toString().padStart(2, '0');
	}

	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());
	const day = pad(date.getDate());
	const month = pad(date.getMonth() + 1);
	const year = date.getFullYear();

	return `${hours}:${minutes} (${day}.${month}.${year})`;
}

export function Index() {
	const readingsQuery = useSuspenseQuery(readings24QueryOptions());

	const averageTemperatures = readingsQuery.data.map((reading) => Math.round(reading.temperatureAvg * 10) / 10);
	const minTemp = Math.min(...averageTemperatures);
	const maxTemp = Math.max(...averageTemperatures);

	const currentTemperature = averageTemperatures.at(-1)!;

	const currentHumidity = readingsQuery.data.at(-1)!.humidityDht;

	const lastUpdate = formatDate(readingsQuery.data.at(-1)!.createdAt);

	return (
		<>
			<main className="m-4 flex flex-1 flex-col gap-2">
				<div className="flex flex-wrap items-center gap-2">
					<Stats
						title="Current temperature"
						body={`${currentTemperature} ˚C`}
						icon="icon-[material-symbols--thermostat]"
					/>
					<Stats
						title="Current humidity"
						body={`${currentHumidity} %`}
						icon="icon-[material-symbols--humidity-mid]"
					/>
					<Stats title="Last update" body={lastUpdate} icon="icon-[material-symbols--update]" />
					<Stats
						title="Min / max temperature (24 h)"
						body={`${minTemp} / ${maxTemp} ˚C`}
						icon="icon-[material-symbols--show-chart]"
					/>
				</div>

				<ReadingsChart readings={readingsQuery.data} />
			</main>
		</>
	);
}

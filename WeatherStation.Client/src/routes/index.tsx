import {createFileRoute} from '@tanstack/react-router';
import {pageTitle} from '@/utils/utils.ts';
import {readings24QueryOptions} from '@/utils/queries.ts';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Stats} from '@/components/dashboard/Stats.tsx';
import type {IReading} from '@/types/reading.ts';
import {TestChart} from '@/components/dashboard/TestChart.tsx';

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

	const averageTemperatures = readingsQuery.data.map(
		(reading) => (reading.temperatureBmp + reading.temperatureDht) / 2
	);
	const minTemp = Math.min(...averageTemperatures);
	const maxTemp = Math.max(...averageTemperatures);

	const currentTemperature = averageTemperatures.at(-1)!;

	const currentHumidity = readingsQuery.data.at(-1)!.humidityDht;

	const lastUpdate = formatDate(readingsQuery.data.at(-1)!.createdAt);

	return (
		<>
			<main className="m-4">
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

				{readingsQuery.data.map((reading) => (
					<div key={reading.id}>
						<div>{reading.createdAt.toString()}</div>
						<div>{reading.temperatureBmp}</div>
					</div>
				))}

				<TestChart readings={generateDummyReadings()} />
			</main>
		</>
	);
}

export function generateDummyReadings(): IReading[] {
	const now = new Date();
	const intervalMs = 5 * 60 * 1000;
	const pointCount = (24 * 60) / 5;

	const readings: IReading[] = [];

	for (let i = pointCount - 1; i >= 0; i--) {
		const createdAt = new Date(now.getTime() - i * intervalMs);
		const hourOfDay = createdAt.getHours() + createdAt.getMinutes() / 60;

		const dailyTempCurve = 18 + 8 * Math.sin(((hourOfDay - 6) / 24) * 2 * Math.PI);
		const tempNoiseBmp = (Math.random() - 0.5) * 1.5;
		const tempNoiseDht = (Math.random() - 0.5) * 1.5;

		const humidityBase = 55 - (dailyTempCurve - 18) * 1.5;
		const humidityNoise = (Math.random() - 0.5) * 5;

		const pressureBase = 1013;
		const pressureDrift = Math.sin((i / pointCount) * Math.PI * 2) * 3;
		const pressureNoise = (Math.random() - 0.5) * 0.5;

		readings.push({
			id: pointCount - i,
			temperatureBmp: Number((dailyTempCurve + tempNoiseBmp).toFixed(2)),
			temperatureDht: Number((dailyTempCurve + tempNoiseDht).toFixed(2)),
			pressureBmp: Number((pressureBase + pressureDrift + pressureNoise).toFixed(2)),
			humidityDht: Number(Math.max(0, Math.min(100, humidityBase + humidityNoise)).toFixed(2)),
			createdAt,
		});
	}

	return readings;
}

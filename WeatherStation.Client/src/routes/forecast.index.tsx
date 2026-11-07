import {createFileRoute} from '@tanstack/react-router';
import {useState} from 'react';
import {pageTitle} from '@/utils/utils.ts';
import {forecastQueryOptions} from '@/utils/queries.ts';
import {useSuspenseQuery} from '@tanstack/react-query';
import {groupForecastDays, parseForecastPoints} from '@/utils/forecast.ts';
import {ForecastDayCards} from '@/components/forecast/ForecastDayCards.tsx';
import {ForecastChart} from '@/components/forecast/ForecastChart.tsx';
import {ForecastDayTable} from '@/components/forecast/ForecastDayTable.tsx';

export const Route = createFileRoute('/forecast/')({
	component: Forecast,

	loader: ({context}) => context.queryClient.ensureQueryData(forecastQueryOptions()),

	head: () => ({
		meta: [{title: pageTitle('Forecast')}],
	}),
});

function Forecast() {
	const forecastQuery = useSuspenseQuery(forecastQueryOptions());

	const points = parseForecastPoints(forecastQuery.data);
	const days = groupForecastDays(points, forecastQuery.data.sunMoon);

	const [selectedDay, setSelectedDay] = useState(0);
	// a refetch after midnight drops the first day, keep the selection in range
	const selectedDayIndex = Math.min(selectedDay, days.length - 1);

	return (
		<main className="m-4 flex flex-1 flex-col gap-2">
			<ForecastDayCards days={days} selectedDay={selectedDayIndex} onSelectDay={setSelectedDay} />

			<ForecastChart points={points} selectedDay={days[selectedDayIndex]} />

			<ForecastDayTable day={days[selectedDayIndex]} />
		</main>
	);
}

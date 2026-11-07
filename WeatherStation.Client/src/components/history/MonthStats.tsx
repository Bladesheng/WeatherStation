import type {IReading} from '@/types/reading.ts';
import {StatCard} from '@/components/dashboard/StatCard.tsx';

function average(values: number[]): number {
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function extremes(values: number[]) {
	return {min: Math.min(...values), max: Math.max(...values)};
}

export function MonthStats({readings}: {readings: IReading[]}) {
	const temperatures = readings.map((r) => r.temperatureAvg);
	const humidities = readings.map((r) => r.humidityDht);
	// convert to hPa
	const pressures = readings.map((r) => r.pressureBmp / 100);

	const temperature = extremes(temperatures);
	const humidity = extremes(humidities);
	const pressure = extremes(pressures);

	return (
		<div className="flex flex-wrap items-center gap-2">
			<StatCard
				title="Temperature range"
				body={`${temperature.min.toFixed(1)}–${temperature.max.toFixed(1)} ˚C`}
				secondaryText={`Avg ${average(temperatures).toFixed(1)} ˚C`}
				icon="icon-[material-symbols--thermostat]"
			/>

			<StatCard
				title="Humidity range"
				body={`${Math.round(humidity.min)}–${Math.round(humidity.max)} %`}
				secondaryText={`Avg ${Math.round(average(humidities))} %`}
				icon="icon-[material-symbols--humidity-percentage]"
			/>

			<StatCard
				title="Pressure range"
				body={`${Math.round(pressure.min)}–${Math.round(pressure.max)} hPa`}
				secondaryText={`Avg ${average(pressures).toFixed(1)} hPa`}
				icon="icon-[material-symbols--compress]"
			/>
		</div>
	);
}

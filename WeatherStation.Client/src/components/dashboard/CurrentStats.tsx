import {useEffect, useState} from 'react';
import type {IReading} from '@/types/reading.ts';
import {StatCard} from '@/components/dashboard/StatCard.tsx';

function pad(n: number): string {
	return n.toString().padStart(2, '0');
}

function formatTime(date: Date): string {
	return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(date: Date): string {
	const day = date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});

	return `${formatTime(date)} · ${day}`;
}

function formatTimeAgo(date: Date, now: number): string {
	const formatter = new Intl.RelativeTimeFormat(undefined, {numeric: 'always'});

	const minutes = Math.round((date.getTime() - now) / (60 * 1000));
	if (Math.abs(minutes) < 60) {
		return formatter.format(minutes, 'minute');
	}

	const hours = Math.round(minutes / 60);
	if (Math.abs(hours) < 24) {
		return formatter.format(hours, 'hour');
	}

	return formatter.format(Math.round(hours / 24), 'day');
}

function formatDelta(delta: number, fractionDigits: number): string {
	const value = Math.abs(delta).toFixed(fractionDigits);
	if (delta > 0) {
		return `+${value}`;
	} else if (delta < 0) {
		return `−${value}`;
	} else {
		return `±${value}`;
	}
}

export function CurrentStats({readings}: {readings: IReading[]}) {
	const [now, setNow] = useState(Date.now());
	useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 10 * 1000);
		return () => clearInterval(interval);
	}, []);

	const currentTemperature = Math.round(readings.at(-1)!.temperatureAvg * 10) / 10;

	const currentHumidity = Math.round(readings.at(-1)!.humidityDht);

	const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
	const hourAgoReading =
		readings.findLast((reading) => reading.createdAt <= hourAgo) ?? readings[0];
	const temperatureDelta =
		Math.round((currentTemperature - hourAgoReading.temperatureAvg) * 10) / 10;
	const humidityDelta = currentHumidity - Math.round(hourAgoReading.humidityDht);

	const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
	const dayAgoReading = readings.findLast((reading) => reading.createdAt <= dayAgo) ?? readings[0];
	const yesterdayDelta = Math.round((currentTemperature - dayAgoReading.temperatureAvg) * 10) / 10;
	let yesterdayComparison = 'Same as';
	if (yesterdayDelta > 0) {
		yesterdayComparison = 'Warmer than';
	} else if (yesterdayDelta < 0) {
		yesterdayComparison = 'Colder than';
	}

	const midnight = new Date();
	midnight.setHours(0, 0, 0, 0);
	const todayReadings = readings.filter((reading) => reading.createdAt >= midnight);
	if (todayReadings.length === 0) {
		todayReadings.push(readings.at(-1)!);
	}
	const todayMin = todayReadings.reduce((min, reading) =>
		reading.temperatureAvg < min.temperatureAvg ? reading : min
	);
	const todayMax = todayReadings.reduce((max, reading) =>
		reading.temperatureAvg > max.temperatureAvg ? reading : max
	);

	const lastUpdate = formatDate(readings.at(-1)!.createdAt);
	const lastUpdateAgo = formatTimeAgo(readings.at(-1)!.createdAt, now);
	const isOnline = now - readings.at(-1)!.createdAt.getTime() < 6 * 60 * 1000;

	return (
		<div className="flex flex-wrap items-center gap-2">
			<StatCard
				title="Current temperature"
				body={`${currentTemperature} ˚C`}
				secondaryText={`${formatDelta(temperatureDelta, 1)} ˚C in the last hour`}
				icon="icon-[material-symbols--thermostat]"
			/>

			<StatCard
				title="Current humidity"
				body={`${currentHumidity} %`}
				secondaryText={`${formatDelta(humidityDelta, 0)} % in the last hour`}
				icon="icon-[material-symbols--humidity-percentage]"
			/>

			<StatCard
				title="Vs. yesterday"
				body={`${formatDelta(yesterdayDelta, 1)} ˚C`}
				secondaryText={`${yesterdayComparison} at ${formatTime(dayAgoReading.createdAt)} yesterday (${dayAgoReading.temperatureAvg.toFixed(1)} ˚C)`}
				icon={
					yesterdayDelta >= 0
						? 'icon-[material-symbols--trending-up]'
						: 'icon-[material-symbols--trending-down]'
				}
			/>

			<StatCard
				title="Today’s min / max"
				body={`${todayMin.temperatureAvg.toFixed(1)} / ${todayMax.temperatureAvg.toFixed(1)} ˚C`}
				secondaryText={`Low ${formatTime(todayMin.createdAt)} · High ${formatTime(todayMax.createdAt)}`}
				icon="icon-[material-symbols--show-chart]"
			/>

			<StatCard
				title="Last update"
				body={lastUpdate}
				secondaryText={
					<>
						<span className={`status ${isOnline ? 'status-success' : 'status-error'}`}></span>
						{isOnline ? 'Online' : 'Offline'} · updated {lastUpdateAgo}
					</>
				}
				icon="icon-[material-symbols--update]"
			/>
		</div>
	);
}

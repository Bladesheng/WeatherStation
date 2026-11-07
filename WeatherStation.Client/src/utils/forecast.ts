import type {IForecastResponse} from '@/types/forecastResponse.ts';

export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;

export type IForecastPoint = {
	time: Date;
	// met.no sends hourly steps for the first few days, then 6-hour blocks
	hours: 1 | 6;
	temperature: number;
	precipitation: number;
	cloudCover: number;
	symbol: string;
};

export type IForecastDay = {
	date: Date;
	points: IForecastPoint[];
	min: number;
	max: number;
	precipitation: number;
	symbol: string;
	sunrise?: Date;
	sunset?: Date;
};

export function parseForecastPoints(response: IForecastResponse): IForecastPoint[] {
	return response.forecast.map((entry) => {
		const range = (entry.data.next_1_hours ?? entry.data.next_6_hours)!;

		return {
			time: new Date(entry.time),
			hours: entry.data.next_1_hours ? 1 : 6,
			temperature: entry.data.instant.details.air_temperature,
			precipitation: range.details.precipitation_amount ?? 0,
			cloudCover: entry.data.instant.details.cloud_area_fraction,
			symbol: range.summary.symbol_code,
		};
	});
}

function pad(n: number): string {
	return n.toString().padStart(2, '0');
}

function isoDate(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function groupForecastDays(
	points: IForecastPoint[],
	sunMoon: IForecastResponse['sunMoon']
): IForecastDay[] {
	const days = new Map<string, IForecastPoint[]>();
	for (const point of points) {
		const key = isoDate(point.time);
		days.set(key, [...(days.get(key) ?? []), point]);
	}

	return [...days].map(([key, dayPoints]) => {
		const date = new Date(dayPoints[0].time);
		date.setHours(0, 0, 0, 0);

		const noon = new Date(date).setHours(12);
		// the midday weather describes the day best, today it may be already over though
		const representative =
			dayPoints.find((p) => p.time.getTime() <= noon && noon < p.time.getTime() + p.hours * HOUR) ??
			dayPoints[0];

		const temperatures = dayPoints.map((p) => p.temperature);
		const sun = sunMoon.find((s) => s.date === key);

		return {
			date,
			points: dayPoints,
			min: Math.min(...temperatures),
			max: Math.max(...temperatures),
			precipitation: dayPoints.reduce((sum, p) => sum + p.precipitation, 0),
			symbol: representative.symbol,
			sunrise: sun ? new Date(sun.sunrise) : undefined,
			sunset: sun ? new Date(sun.sunset) : undefined,
		};
	});
}

export function formatHour(date: Date): string {
	return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatPointTime(point: IForecastPoint): string {
	const startHour = pad(point.time.getHours());
	if (point.hours === 1) {
		return startHour;
	}

	const endHour = (point.time.getHours() + point.hours) % 24;
	return `${startHour}–${pad(endHour)}`;
}

export function formatPrecipitation(value: number): string {
	return `${value.toFixed(1)} mm`;
}

export function relativeDayName(date: Date): string | undefined {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const dayDiff = Math.round((date.getTime() - today.getTime()) / DAY);
	if (dayDiff === 0) {
		return 'Today';
	} else if (dayDiff === 1) {
		return 'Tomorrow';
	}
}

export function weatherIconUrl(symbol: string): string {
	return `/icons/weathericons/${symbol}.svg`;
}

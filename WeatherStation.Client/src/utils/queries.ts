import {queryOptions} from '@tanstack/react-query';
import type {IForecastResponse} from '@/types/forecastResponse.ts';
import type {IReading} from '@/types/reading.ts';

const baseUrl = import.meta.env.DEV
	? 'http://localhost:5087'
	: 'https://weather-api.bladesheng.com';

export function readings24QueryOptions() {
	return queryOptions({
		queryKey: ['readings24'],
		queryFn: async () => {
			const res = await fetch(`${baseUrl}/api/readings/24h`);
			const data: IReading[] = await res.json();
			return data;
		},
	});
}

export function readingsMonthQueryOptions(year: string, month: string) {
	return queryOptions({
		queryKey: ['readingsMonth', year, month],
		queryFn: async () => {
			const res = await fetch(`${baseUrl}/api/readings/month/${year}/${month}`);
			const data: IReading[] = await res.json();
			return data;
		},
	});
}

export function forecastQueryOptions() {
	return queryOptions({
		queryKey: ['forecast'],
		queryFn: async () => {
			const res = await fetch(`${baseUrl}/forecast`);
			const data: IForecastResponse = await res.json();
			return data;
		},
	});
}

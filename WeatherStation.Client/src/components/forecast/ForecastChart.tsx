import ReactECharts from 'echarts-for-react';
import type {EChartsOption} from 'echarts';
import {useTheme} from '@/contexts/ThemeContext.tsx';
import {useDateLocale} from '@/contexts/DateLocaleContext.tsx';
import {chartColors} from '@/utils/echartsTheme.ts';
import {roundDown, roundUp} from '@/utils/utils.ts';
import {DAY, HOUR, formatHour, type IForecastDay, type IForecastPoint} from '@/utils/forecast.ts';

function formatTooltipValue(unit: string, fractionDigits: number) {
	return (value: unknown) => `${Number(value).toFixed(fractionDigits)} ${unit}`;
}

export function ForecastChart({
	points,
	selectedDay,
}: {
	points: IForecastPoint[];
	selectedDay: IForecastDay;
}) {
	const {theme} = useTheme();
	const {dateLocale} = useDateLocale();

	const lastPoint = points.at(-1)!;
	const start = points[0].time.getTime();
	const end = lastPoint.time.getTime() + lastPoint.hours * HOUR;

	const selectionStart = Math.max(start, selectedDay.date.getTime());
	const selectionEnd = Math.min(end, selectedDay.date.getTime() + DAY);

	const option: EChartsOption = {
		tooltip: {
			trigger: 'axis',
		},
		legend: {
			data: ['Temperature', {name: 'Precipitation', icon: 'rect'}, 'Cloud cover'],
			top: 0,
		},
		grid: {
			top: 30,
			left: 0,
			right: 0,
			bottom: 0,
		},
		xAxis: {
			type: 'time',
			min: start,
			max: end,
			// a tick at every midnight
			minInterval: DAY,
			maxInterval: DAY,
			axisLabel: {
				formatter: (value: number) => {
					const date = new Date(value);
					return `${date.toLocaleDateString(dateLocale, {weekday: 'short'})} ${date.getDate()}`;
				},
				hideOverlap: true,
			},
			splitLine: {show: true},
			axisPointer: {
				label: {
					// sets the tooltip header
					formatter: ({value}) => {
						const date = new Date(value);
						return `${date.toLocaleDateString(dateLocale, {weekday: 'short'})} ${date.getDate()}, ${formatHour(date)}`;
					},
				},
			},
		},
		yAxis: [
			{
				type: 'value',
				name: 'Temperature [°C]',
				nameLocation: 'middle',
				min: ({min}) => roundDown(min, 0.5),
				max: ({max}) => roundUp(max, 0.5),
			},
			{
				type: 'value',
				name: 'Precipitation [mm]',
				nameLocation: 'middle',
				position: 'right',
				min: 0,
				// keep some headroom so a drizzle doesn't look like a downpour
				max: ({max}) => Math.max(2, Math.ceil(max)),
				splitLine: {show: false},
			},
			{
				type: 'value',
				show: false,
				min: 0,
				max: 100,
			},
		],
		series: [
			{
				name: 'Temperature',
				type: 'line',
				symbol: 'circle',
				color: chartColors.temperature,
				yAxisIndex: 0,
				z: 3,
				tooltip: {valueFormatter: formatTooltipValue('°C', 1)},
				data: points.map((p) => [p.time.getTime(), p.temperature]),

				markArea: {
					silent: true,
					itemStyle: {color: `${chartColors.cloudCover}26`},
					data: [[{xAxis: selectionStart}, {xAxis: selectionEnd}]],
				},
			},
			{
				name: 'Precipitation',
				type: 'line',
				// the amount covers the whole hour or 6-hour block after the point, hold it until the next one
				step: 'end',
				showSymbol: false,
				color: chartColors.precipitation,
				lineStyle: {width: 0},
				areaStyle: {opacity: 0.7},
				yAxisIndex: 1,
				z: 1,
				tooltip: {valueFormatter: formatTooltipValue('mm', 1)},
				// the closing point draws the last block to its end
				data: [
					...points.map((p) => [p.time.getTime(), p.precipitation]),
					[end, lastPoint.precipitation],
				],
			},
			{
				name: 'Cloud cover',
				type: 'line',
				showSymbol: false,
				color: chartColors.cloudCover,
				lineStyle: {width: 1.5},
				yAxisIndex: 2,
				z: 2,
				tooltip: {valueFormatter: formatTooltipValue('%', 0)},
				data: points.map((p) => [p.time.getTime(), p.cloudCover]),
			},
		],
	};

	return (
		<div className="flex flex-col rounded border border-base-content/10 bg-base-200 p-2">
			<ReactECharts theme={theme} option={option} style={{height: 300, width: '100%'}} />
		</div>
	);
}

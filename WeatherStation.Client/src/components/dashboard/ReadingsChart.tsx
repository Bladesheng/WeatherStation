import ReactECharts from 'echarts-for-react';
import type {IReading} from '@/types/reading.ts';
import {useTheme} from '@/contexts/ThemeContext.tsx';
import type {EChartsOption} from 'echarts';
import {chartColors} from '@/utils/echartsTheme.ts';
import {useState} from 'react';

// dividing by 1 / step instead of multiplying by step avoids float noise like 993.4000000000001
function roundDown(value: number, step: number) {
	return Math.floor(value / step) / (1 / step);
}

function roundUp(value: number, step: number) {
	return Math.ceil(value / step) / (1 / step);
}

function formatDateTime(value: number | string | Date) {
	return new Date(value).toLocaleString(undefined, {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function formatTooltipValue(unit: string) {
	return (value: unknown) => `${Number(value).toFixed(1)} ${unit}`;
}

const xAxisScales = {
	// a tick every hour, no matter the zoom
	hours: {minInterval: 60 * 60 * 1000, maxInterval: 60 * 60 * 1000, formatter: '{HH}:{mm}'},
	// at most a tick per day
	days: {minInterval: 24 * 60 * 60 * 1000, maxInterval: undefined, formatter: '{MMM} {d}'},
};

export function ReadingsChart({
	readings,
	xAxisScale,
}: {
	readings: IReading[];
	xAxisScale: keyof typeof xAxisScales;
}) {
	const {theme} = useTheme();
	// kept in state because every data refresh re-applies the whole option, which would reset the legend toggles
	const [selectedSeries, setSelectedSeries] = useState<Record<string, boolean>>({
		'Temperature (avg)': true,
		'Temperature (BMP)': false,
		'Temperature (DHT)': false,
		Humidity: true,
		Pressure: false,
	});

	const option: EChartsOption = {
		baseOption: {
			tooltip: {
				trigger: 'axis',
			},
			legend: {
				data: [
					'Temperature (avg)',
					'Temperature (BMP)',
					'Temperature (DHT)',
					'Humidity',
					'Pressure',
				],
				selected: selectedSeries,
				top: 0,
			},
			grid: {
				top: 30,
				left: 0,
				right: 0,
			},
			xAxis: {
				type: 'time',
				minInterval: xAxisScales[xAxisScale].minInterval,
				maxInterval: xAxisScales[xAxisScale].maxInterval,
				axisLabel: {
					formatter: xAxisScales[xAxisScale].formatter,
					// on narrow screens skip labels that would overlap instead of drawing them on top of each other
					hideOverlap: true,
				},
				splitLine: {show: true},
				axisPointer: {
					label: {
						// sets the tooltip header
						formatter: ({value}) => formatDateTime(value),
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
					name: 'Pressure [hPa]',
					nameLocation: 'middle',
					show: selectedSeries.Pressure,
					position: 'right',
					alignTicks: true,
					scale: true,
					splitLine: {show: false},
				},
				{
					type: 'value',
					name: 'Humidity [%]',
					nameLocation: 'middle',
					show: selectedSeries.Humidity,
					position: 'right',
					// make room for the pressure axis only when it's shown
					offset: selectedSeries.Pressure ? 80 : 0,
					alignTicks: true,
					scale: true,
					splitLine: {show: false},
				},
			],
			dataZoom: [
				{type: 'inside'},
				{
					type: 'slider',
					labelFormatter: (value) => formatDateTime(value),
				},
			],
			series: [
				{
					name: 'Temperature (avg)',
					type: 'line',
					symbol: 'circle',
					color: chartColors.temperature,
					yAxisIndex: 0,
					tooltip: {valueFormatter: formatTooltipValue('°C')},
					data: readings.map((r) => [r.createdAt.getTime(), r.temperatureAvg]),
				},
				{
					name: 'Temperature (BMP)',
					type: 'line',
					symbol: 'circle',
					color: chartColors.temperatureBmp,
					yAxisIndex: 0,
					tooltip: {valueFormatter: formatTooltipValue('°C')},
					data: readings.map((r) => [r.createdAt.getTime(), r.temperatureBmp]),
				},
				{
					name: 'Temperature (DHT)',
					type: 'line',
					symbol: 'circle',
					color: chartColors.temperatureDht,
					yAxisIndex: 0,
					tooltip: {valueFormatter: formatTooltipValue('°C')},
					data: readings.map((r) => [r.createdAt.getTime(), r.temperatureDht]),
				},
				{
					name: 'Humidity',
					type: 'line',
					symbol: 'circle',
					color: chartColors.humidity,
					yAxisIndex: 2,
					tooltip: {valueFormatter: formatTooltipValue('%')},
					data: readings.map((r) => [r.createdAt.getTime(), r.humidityDht]),
				},
				{
					name: 'Pressure',
					type: 'line',
					symbol: 'circle',
					color: chartColors.pressure,
					yAxisIndex: 1,
					tooltip: {valueFormatter: formatTooltipValue('hPa')},
					// the backend sends pascals
					data: readings.map((r) => [r.createdAt.getTime(), r.pressureBmp / 100]),
				},
			],
		},
		media: [
			{
				// the legend wraps onto a second line on narrow screens, push the plot down so they don't overlap
				query: {maxWidth: 700},
				option: {grid: {top: 55}},
			},
		],
	};

	return (
		<div className="flex flex-1 flex-col rounded border border-base-content/10 bg-base-200 p-2">
			<ReactECharts
				theme={theme}
				option={option}
				onEvents={{
					legendselectchanged: (event: {selected: Record<string, boolean>}) =>
						setSelectedSeries(event.selected),
				}}
				// fill the rest of the page height, the overflow lets it shrink again when the window gets smaller
				style={{flex: 1, minHeight: 400, width: '100%', overflow: 'hidden'}}
			/>
		</div>
	);
}

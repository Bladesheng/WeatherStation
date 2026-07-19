import ReactECharts from 'echarts-for-react';
import type {IReading} from '@/types/reading.ts';
import {useTheme} from '@/contexts/ThemeContext.tsx';
import type {EChartsOption} from 'echarts';

export function TestChart({readings}: {readings: IReading[]}) {
	const {theme} = useTheme();

	const option: EChartsOption = {
		tooltip: {
			trigger: 'axis',
		},
		legend: {
			data: ['Temp (BMP)', 'Temp (DHT)', 'Humidity', 'Pressure'],
		},
		xAxis: {
			type: 'time',
		},
		yAxis: [
			{type: 'value', name: '°C / %'},
			{type: 'value', name: 'hPa', position: 'right', min: 'dataMin', max: 'dataMax'},
			// {type: 'value', name: 'hPa', position: 'right', min: 930, max: 1030},
		],
		dataZoom: [{type: 'inside'}, {type: 'slider'}],
		series: [
			{
				name: 'Temp (BMP)',
				type: 'line',
				yAxisIndex: 0,
				showSymbol: false,
				data: readings.map((r) => [r.createdAt.getTime(), r.temperatureBmp]),
			},
			{
				name: 'Temp (DHT)',
				type: 'line',
				yAxisIndex: 0,
				showSymbol: false,
				data: readings.map((r) => [r.createdAt.getTime(), r.temperatureDht]),
			},
			{
				name: 'Humidity',
				type: 'line',
				yAxisIndex: 0,
				showSymbol: false,
				data: readings.map((r) => [r.createdAt.getTime(), r.humidityDht]),
			},
			{
				name: 'Pressure',
				type: 'line',
				yAxisIndex: 1,
				showSymbol: false,
				data: readings.map((r) => [r.createdAt.getTime(), r.pressureBmp]),
			},
		],
	};

	return <ReactECharts theme={theme} option={option} style={{height: '500px', width: '100%'}} />;
}

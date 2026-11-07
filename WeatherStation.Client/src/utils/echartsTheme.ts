import type {EChartsOption} from 'echarts';
import {registerTheme} from 'echarts/core';
import type {ITheme} from '@/contexts/ThemeContext.tsx';

export function registerEchartsTheme(themeName: ITheme) {
	const base200 = cssColorVariableToHex('--color-base-200');
	const base300 = cssColorVariableToHex('--color-base-300');
	const baseContent = cssColorVariableToHex('--color-base-content');
	const primary = cssColorVariableToHex('--color-primary');
	const accent = cssColorVariableToHex('--color-accent');
	const info = cssColorVariableToHex('--color-info');
	const success = cssColorVariableToHex('--color-success');
	const warning = cssColorVariableToHex('--color-warning');

	const options: EChartsOption = {
		backgroundColor: 'transparent',
		color: [primary, accent, success, info, warning],
		textStyle: {color: baseContent},
		title: {textStyle: {color: baseContent}},
		legend: {textStyle: {color: baseContent}},
		tooltip: {
			backgroundColor: base200,
			borderColor: base300,
			textStyle: {color: baseContent},
		},
		categoryAxis: {
			axisLine: {lineStyle: {color: `${baseContent}1a`}},
			axisLabel: {color: baseContent},
			splitLine: {lineStyle: {color: `${baseContent}1a`}},
		},
		valueAxis: {
			axisLine: {lineStyle: {color: `${baseContent}1a`}},
			axisLabel: {color: baseContent},
			splitLine: {lineStyle: {color: `${baseContent}1a`}},
		},
		timeAxis: {
			axisLine: {lineStyle: {color: `${baseContent}1a`}},
			axisLabel: {color: baseContent},
			splitLine: {lineStyle: {color: `${baseContent}1a`}},
		},
		dataZoom: {
			textStyle: {color: baseContent},
			borderColor: base300,
			fillerColor: `${primary}26`,
			handleStyle: {
				color: primary,
			},
			moveHandleStyle: {
				color: primary,
			},
		},
	};

	registerTheme(themeName, options);
}

export const chartColors = {
	temperature: cssColorVariableToHex('--color-rose-500'),
	temperatureBmp: cssColorVariableToHex('--color-yellow-500'),
	temperatureDht: cssColorVariableToHex('--color-orange-500'),
	humidity: cssColorVariableToHex('--color-blue-400'),
	pressure: cssColorVariableToHex('--color-purple-400'),
	precipitation: cssColorVariableToHex('--color-blue-400'),
	cloudCover: cssColorVariableToHex('--color-gray-400'),
};

function cssColorVariableToHex(cssColorName: string): string {
	const cssColor = getComputedStyle(document.documentElement).getPropertyValue(cssColorName).trim();

	const canvas = document.createElement('canvas');
	canvas.width = 1;
	canvas.height = 1;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw Error('Failed to get canvas context');
	}

	ctx.fillStyle = cssColor;
	ctx.fillRect(0, 0, 1, 1);

	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toHex(v: number) {
	return v.toString(16).padStart(2, '0');
}

import {
	formatPrecipitation,
	relativeDayName,
	weatherIconUrl,
	type IForecastDay,
} from '@/utils/forecast.ts';

export function ForecastDayCards({
	days,
	selectedDay,
	onSelectDay,
}: {
	days: IForecastDay[];
	selectedDay: number;
	onSelectDay: (index: number) => void;
}) {
	return (
		<div className="grid auto-cols-[1fr] grid-flow-col gap-2 overflow-x-auto">
			{days.map((day, i) => (
				<button
					key={day.date.getTime()}
					type="button"
					onClick={() => onSelectDay(i)}
					className={`flex min-w-23 cursor-pointer flex-col items-center gap-1 rounded border px-1.5 py-2.5 hover:border-primary ${i === selectedDay ? 'border-primary bg-primary/10' : 'border-base-content/10 bg-base-200'}`}
				>
					<span className="text-sm font-semibold">
						{relativeDayName(day.date) ?? day.date.toLocaleDateString('en', {weekday: 'long'})}
					</span>

					<span className="text-xs opacity-70">
						{day.date.toLocaleDateString('en', {month: 'short', day: 'numeric'})}
					</span>

					<img src={weatherIconUrl(day.symbol)} alt="" className="size-8" />

					<span className="text-sm tabular-nums">
						<span className="font-bold text-rose-500">{Math.round(day.max)}°</span>
						<span className="opacity-70"> / {Math.round(day.min)}°</span>
					</span>

					<span
						className={`text-xs tabular-nums ${day.precipitation > 0 ? 'text-blue-400' : 'opacity-70'}`}
					>
						{day.precipitation > 0 ? formatPrecipitation(day.precipitation) : 'Dry'}
					</span>
				</button>
			))}
		</div>
	);
}

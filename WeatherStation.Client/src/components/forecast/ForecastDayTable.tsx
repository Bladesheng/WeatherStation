import {Fragment} from 'react';
import {
	formatHour,
	formatPointTime,
	formatPrecipitation,
	relativeDayName,
	weatherIconUrl,
	type IForecastDay,
} from '@/utils/forecast.ts';
import {useDateLocale} from '@/contexts/DateLocaleContext.tsx';
import {capitalize} from '@/utils/utils.ts';

const headerCell = 'border-b border-base-content/10 px-2 py-1.5 text-xs opacity-70';
const cell = 'border-b border-base-content/10 px-2 py-1.75 tabular-nums';

function SunTime({icon, label, time}: {icon: string; label: string; time?: Date}) {
	if (!time) {
		return null;
	}

	return (
		<span className="flex items-center gap-1.5">
			<span className={`${icon} text-lg`} />
			{label} {formatHour(time)}
		</span>
	);
}

export function ForecastDayTable({day}: {day: IForecastDay}) {
	const {dateLocale} = useDateLocale();

	const relativeName = relativeDayName(day.date, dateLocale);
	const dateName = capitalize(
		day.date.toLocaleDateString(dateLocale, {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
		})
	);

	return (
		<div className="flex flex-col gap-2.5 rounded border border-base-content/10 bg-base-200 px-4 py-3">
			<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
				<div className="text-lg font-semibold">
					{relativeName ? `${relativeName} · ${dateName}` : dateName}
				</div>

				<div className="flex gap-4 text-sm opacity-70">
					<SunTime icon="icon-[material-symbols--wb-twilight]" label="Sunrise" time={day.sunrise} />
					<SunTime icon="icon-[material-symbols--bedtime]" label="Sunset" time={day.sunset} />
				</div>
			</div>

			<div className="overflow-x-auto">
				<div className="grid min-w-110 grid-cols-[72px_40px_minmax(70px,1fr)_minmax(90px,1fr)_minmax(150px,2fr)] text-sm">
					<span className={headerCell}>Time</span>
					<span className={headerCell} />
					<span className={headerCell}>Temperature</span>
					<span className={headerCell}>Precipitation</span>
					<span className={headerCell}>Cloud cover</span>

					{day.points.map((point) => (
						<Fragment key={point.time.getTime()}>
							<span className={`${cell} opacity-70`}>{formatPointTime(point)}</span>
							<span className="grid place-items-center border-b border-base-content/10">
								<img src={weatherIconUrl(point.symbol)} alt="" className="size-6" />
							</span>
							<span className={`${cell} font-semibold text-rose-500`}>
								{Math.round(point.temperature)} °C
							</span>
							<span
								className={`${cell} ${point.precipitation > 0 ? 'text-blue-400' : 'opacity-70'}`}
							>
								{point.precipitation > 0 ? formatPrecipitation(point.precipitation) : '–'}
							</span>
							<span className={`${cell} flex items-center gap-2.5`}>
								<span className="w-12 text-right whitespace-nowrap">
									{Math.round(point.cloudCover)} %
								</span>
								<span className="h-1 max-w-40 flex-1 overflow-hidden rounded-sm bg-base-300">
									<span
										className="block h-full bg-base-content/70"
										style={{width: `${point.cloudCover}%`}}
									/>
								</span>
							</span>
						</Fragment>
					))}
				</div>
			</div>
		</div>
	);
}

import {Link, Outlet, createFileRoute} from '@tanstack/react-router';
import {Temporal} from 'temporal-polyfill';

export const Route = createFileRoute('/history')({
	component: HistoryLayout,
});

const now = Temporal.Now.plainDateISO();
const start = Temporal.PlainDate.from('2022-07-02');

const years = Array.from({length: now.year - start.year + 1}, (_, i) => {
	const year = now.year - i;
	const firstMonth = year === start.year ? start.month : 1;
	const lastMonth = year === now.year ? now.month : 12;

	return {
		year,
		months: Array.from(
			{length: lastMonth - firstMonth + 1},
			(_, j) => new Temporal.PlainYearMonth(year, firstMonth + j, 'iso8601')
		),
	};
});

function HistoryLayout() {
	return (
		<main className="m-4">
			<aside>
				{years.map(({year, months}) => (
					<div key={year}>
						<div>{year}</div>
						<div>
							{months.map((month) => (
								<div key={month.month}>
									<Link
										to="/history/$year/$month"
										params={{
											year: month.year.toString(),
											month: month.month.toString(),
										}}
										className="btn btn-ghost"
										activeProps={{className: 'btn-active'}}
									>
										{month.toLocaleString('en', {month: 'long', calendar: 'iso8601'})}
										{month.year}/{month.month}
									</Link>
								</div>
							))}
						</div>
					</div>
				))}
			</aside>

			<Outlet />
		</main>
	);
}

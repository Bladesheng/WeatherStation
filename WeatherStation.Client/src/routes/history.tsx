import {Link, Outlet, createFileRoute, useParams} from '@tanstack/react-router';
import {useState} from 'react';
import {Temporal} from 'temporal-polyfill';
import {historyEnd, historyStart, isHistoryMonth} from '@/utils/history.ts';

export const Route = createFileRoute('/history')({
	component: HistoryLayout,
});

const years = Array.from({length: historyEnd.year - historyStart.year + 1}, (_, i) => {
	const year = historyEnd.year - i;

	return {
		year,
		months: Array.from({length: 12}, (_, j) => {
			const month = new Temporal.PlainYearMonth(year, 12 - j);

			return {month, isDisabled: !isHistoryMonth(month)};
		}),
	};
});

function HistoryLayout() {
	const params = useParams({strict: false});
	const selectedYear = Number(params.year);
	const selectedMonth = Number(params.month);

	const [openYears, setOpenYears] = useState(() => new Set([selectedYear]));

	// navigating to another year (prev/next buttons) expands it, the years opened before stay open
	const [lastSelectedYear, setLastSelectedYear] = useState(selectedYear);
	if (lastSelectedYear !== selectedYear) {
		setLastSelectedYear(selectedYear);
		setOpenYears((prev) => new Set(prev).add(selectedYear));
	}

	function toggleYear(year: number) {
		setOpenYears((prev) => {
			const next = new Set(prev);
			if (!next.delete(year)) {
				next.add(year);
			}
			return next;
		});
	}

	return (
		<main className="m-4 flex flex-1 flex-col gap-2 md:flex-row md:items-start">
			<aside className="flex shrink-0 flex-col gap-1 rounded border border-base-content/10 bg-base-200 p-2 md:sticky md:top-4 md:w-52">
				{years.map(({year, months}) => {
					const isOpen = openYears.has(year);

					return (
						<div key={year}>
							<button
								type="button"
								className="btn w-full justify-between btn-ghost text-base btn-sm"
								aria-expanded={isOpen}
								onClick={() => toggleYear(year)}
							>
								{year}
								<span
									className={`${isOpen ? 'icon-[material-symbols--expand-less]' : 'icon-[material-symbols--expand-more]'} text-xl opacity-70`}
								/>
							</button>

							{isOpen && (
								<div className="grid grid-cols-3 gap-1">
									{months.map(({month, isDisabled}) => {
										const label = month.toLocaleString('en', {month: 'short', calendar: 'iso8601'});

										const isSelected = year === selectedYear && month.month === selectedMonth;

										return (
											<Link
												key={month.month}
												to="/history/$year/$month"
												params={{
													year: month.year.toString(),
													month: month.month.toString(),
												}}
												disabled={isDisabled}
												className={`btn font-normal btn-sm ${isSelected ? 'btn-primary' : 'btn-ghost btn-bordered'} ${isDisabled ? 'btn-disabled' : ''}`}
											>
												{label}
											</Link>
										);
									})}
								</div>
							)}
						</div>
					);
				})}
			</aside>

			<div className="flex min-w-0 flex-1 flex-col gap-2 self-stretch">
				<Outlet />
			</div>
		</main>
	);
}

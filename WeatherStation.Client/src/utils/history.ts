import {Temporal} from 'temporal-polyfill';

// first and last month the station has readings for
export const historyStart = Temporal.PlainYearMonth.from('2022-07');
export const historyEnd = Temporal.Now.plainDateISO().toPlainYearMonth();

export function isHistoryMonth(month: Temporal.PlainYearMonth): boolean {
	return (
		Temporal.PlainYearMonth.compare(month, historyStart) >= 0 &&
		Temporal.PlainYearMonth.compare(month, historyEnd) <= 0
	);
}

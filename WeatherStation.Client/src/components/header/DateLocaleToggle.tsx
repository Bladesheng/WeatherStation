import {useDateLocale} from '@/contexts/DateLocaleContext.tsx';

export function DateLocaleToggle() {
	const {dateLocale, setDateLocale} = useDateLocale();

	return (
		<label className="btn swap btn-circle btn-ghost text-sm" title="Date format language">
			<input
				type="checkbox"
				aria-label="Use English date format"
				checked={dateLocale === 'en'}
				onChange={(e) => setDateLocale(e.currentTarget.checked ? 'en' : 'cs')}
			/>
			<span className="swap-off">CZ</span>
			<span className="swap-on">EN</span>
		</label>
	);
}

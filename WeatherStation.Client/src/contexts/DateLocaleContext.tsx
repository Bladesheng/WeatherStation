import {createContext, type ReactNode, useContext, useEffect, useState} from 'react';

const DATE_LOCALE_KEY = 'dateLocale';

// only used for formatting dates, the rest of the UI stays in English
export type IDateLocale = 'cs' | 'en';

type IDateLocaleContext = {
	dateLocale: IDateLocale;
	setDateLocale: (dateLocale: IDateLocale) => void;
};

const DateLocaleContext = createContext<IDateLocaleContext | undefined>(undefined);

export function DateLocaleProvider({children}: {children: ReactNode}) {
	const [dateLocale, setDateLocale] = useState<IDateLocale>(
		() => (localStorage.getItem(DATE_LOCALE_KEY) as IDateLocale | null) ?? 'cs'
	);

	useEffect(() => {
		localStorage.setItem(DATE_LOCALE_KEY, dateLocale);
	}, [dateLocale]);

	return <DateLocaleContext value={{dateLocale, setDateLocale}}>{children}</DateLocaleContext>;
}

export function useDateLocale() {
	const ctx = useContext(DateLocaleContext);
	if (!ctx) {
		throw Error('useDateLocale must be used within a DateLocaleProvider.');
	}
	return ctx;
}

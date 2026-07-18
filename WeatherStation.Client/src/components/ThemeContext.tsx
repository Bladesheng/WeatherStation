import {createContext, type ReactNode, useContext, useEffect, useState} from 'react';

const THEME_KEY = 'theme';

export type ITheme = 'light' | 'dark';
export type IPreferredTheme = ITheme | 'auto';

type IThemeContext = {
	theme: ITheme;
	preferredTheme: IPreferredTheme;
	setPreferredTheme: (theme: IPreferredTheme) => void;
};

const ThemeContext = createContext<IThemeContext | undefined>(undefined);

export function ThemeProvider({children}: {children: ReactNode}) {
	// User's preference for this website.
	const [preferredTheme, setPreferredTheme] = useState<IPreferredTheme>(
		() => (localStorage.getItem(THEME_KEY) as IPreferredTheme | null) ?? 'auto'
	);

	// User's preference for browser.
	const [systemTheme, setSystemTheme] = useState<ITheme>(() =>
		window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
	);

	const calculatedTheme: ITheme = preferredTheme === 'auto' ? systemTheme : preferredTheme;

	useEffect(() => {
		document.documentElement.setAttribute(
			'data-theme',
			calculatedTheme === 'light' ? 'nord' : 'business'
		);
	}, [calculatedTheme]);

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		function handleColorSchemeChange(event: MediaQueryListEvent) {
			setSystemTheme(event.matches ? 'dark' : 'light');
		}

		mediaQuery.addEventListener('change', handleColorSchemeChange);
		return () => {
			mediaQuery.removeEventListener('change', handleColorSchemeChange);
		};
	}, []);

	useEffect(() => {
		localStorage.setItem(THEME_KEY, preferredTheme);
	}, [preferredTheme]);

	return (
		<ThemeContext
			value={{
				theme: calculatedTheme,
				preferredTheme,
				setPreferredTheme,
			}}
		>
			{children}
		</ThemeContext>
	);
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) {
		throw Error('useTheme must be used within a ThemeProvider.');
	}
	return ctx;
}

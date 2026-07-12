import {useEffect, useState} from 'react';

const THEME_KEY = 'theme';

type ITheme = 'light' | 'dark' | 'auto';

const themes: Record<ITheme, string> = {
	light: 'light-mode',
	dark: 'dark-mode',
	auto: 'contrast',
} as const;

function changeTheme(newTheme: 'light' | 'dark') {
	document.documentElement.setAttribute('data-theme', newTheme === 'light' ? 'nord' : 'business');
}

export function ThemeSelect() {
	const [theme, setTheme] = useState<ITheme>(
		(localStorage.getItem(THEME_KEY) as ITheme | null) ?? 'auto'
	);

	useEffect(() => {
		localStorage.setItem(THEME_KEY, theme);

		if (theme === 'light') {
			changeTheme('light');
		} else if (theme === 'dark') {
			changeTheme('dark');
		} else if (theme === 'auto') {
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				changeTheme('dark');
			} else {
				changeTheme('light');
			}
		}
	}, [theme]);

	useEffect(() => {
		if (theme !== 'auto') {
			return;
		}

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		mediaQuery.addEventListener('change', handleColorSchemeChange);

		function handleColorSchemeChange(event: MediaQueryListEvent) {
			changeTheme(event.matches ? 'dark' : 'light');
		}

		return () => {
			mediaQuery.removeEventListener('change', handleColorSchemeChange);
		};
	}, [theme]);

	return (
		<>
			<button
				className="btn btn-circle btn-ghost"
				popoverTarget="popover-theme"
				style={{anchorName: '--anchor-theme'}}
			>
				<span className={`icon-[material-symbols--${themes[theme]}]`} />
			</button>

			<ul
				className="menu dropdown w-42 rounded-box bg-base-100 shadow-sm"
				popover="auto"
				id="popover-theme"
				style={{positionAnchor: '--anchor-theme'}}
			>
				{Object.entries(themes).map(([name, icon]) => (
					<li key={name} className={theme === name ? 'menu-active' : ''}>
						<button className="capitalize" onClick={() => setTheme(name as ITheme)}>
							<span className={`icon-[material-symbols--${icon}]`} />
							{name}
						</button>
					</li>
				))}
			</ul>
		</>
	);
}

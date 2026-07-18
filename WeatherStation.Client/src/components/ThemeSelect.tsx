import {type IPreferredTheme, useTheme} from '@/components/ThemeContext.tsx';

const themeIcons: Record<IPreferredTheme, string> = {
	light: 'light-mode',
	dark: 'dark-mode',
	auto: 'contrast',
} as const;

export function ThemeSelect() {
	const {preferredTheme, setPreferredTheme} = useTheme();

	return (
		<>
			<button
				className="btn btn-circle btn-ghost"
				popoverTarget="popover-theme"
				style={{anchorName: '--anchor-theme'}}
			>
				<span className={`icon-[material-symbols--${themeIcons[preferredTheme]}]`} />
			</button>

			<ul
				className="menu dropdown w-42 rounded-box bg-base-100 shadow-sm"
				popover="auto"
				id="popover-theme"
				style={{positionAnchor: '--anchor-theme'}}
			>
				{Object.entries(themeIcons).map(([name, icon]) => (
					<li key={name} className={preferredTheme === name ? 'menu-active' : ''}>
						<button
							className="capitalize"
							onClick={() => setPreferredTheme(name as IPreferredTheme)}
						>
							<span className={`icon-[material-symbols--${icon}]`} />
							{name}
						</button>
					</li>
				))}
			</ul>

			{/* Tailwind icons don't know which icons are gonna be used in advance. */}
			<template>
				<span className={`icon-[material-symbols--light-mode]`} />
				<span className={`icon-[material-symbols--dark-mode]`} />
				<span className={`icon-[material-symbols--contrast]`} />
			</template>
		</>
	);
}

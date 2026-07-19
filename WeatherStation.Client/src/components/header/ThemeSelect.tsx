import {type IPreferredTheme, useTheme} from '@/contexts/ThemeContext.tsx';

const themeIcons: Record<IPreferredTheme, string> = {
	light: 'icon-[material-symbols--light-mode]',
	dark: 'icon-[material-symbols--dark-mode]',
	auto: 'icon-[material-symbols--contrast]',
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
				<span className={themeIcons[preferredTheme]} />
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
							<span className={icon} />
							{name}
						</button>
					</li>
				))}
			</ul>
		</>
	);
}

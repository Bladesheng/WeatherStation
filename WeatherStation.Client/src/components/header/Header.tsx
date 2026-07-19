import {Link} from '@tanstack/react-router';
import {useTheme} from '@/contexts/ThemeContext.tsx';
import {ThemeSelect} from '@/components/header/ThemeSelect.tsx';

export const MOBILE_DRAWER_ID = 'mobile-drawer';

export const navLinks = [
	{to: '/', label: 'Dashboard', icon: 'icon-[material-symbols--dashboard]'},
	{to: '/history', label: 'History', icon: 'icon-[material-symbols--show-chart]'},
	{to: '/forecast', label: 'Forecast', icon: 'icon-[material-symbols--partly-cloudy-day]'},
	{to: '/notifications', label: 'Notifications', icon: 'icon-[material-symbols--notifications]'},
] as const;

export function Header() {
	const {theme} = useTheme();

	return (
		<header className="shadow">
			<nav className="navbar grid grid-cols-3">
				<label
					htmlFor={MOBILE_DRAWER_ID}
					className="btn justify-start btn-ghost sm:hidden"
					aria-label="Open menu"
				>
					<span className="icon-[material-symbols--menu]" />
				</label>

				<div className="flex items-center gap-2 text-xl font-bold text-nowrap text-primary">
					<img
						src={`/icons/main/${theme === 'dark' ? 'main_dark.svg' : 'main_light.svg'}`}
						alt="Logo"
						className="h-10 w-10 sm:h-14 sm:w-14"
					/>
					<span>WS2</span>
				</div>

				<ul className="menu menu-horizontal hidden flex-nowrap gap-1 justify-self-center sm:flex">
					{navLinks.map(({to, label, icon}) => (
						<li key={to}>
							<Link to={to} activeProps={{className: 'menu-active'}}>
								<span className={icon} />
								{label}
							</Link>
						</li>
					))}
				</ul>

				<div className="flex justify-end gap-1 sm:gap-2">
					<ThemeSelect />
				</div>
			</nav>
		</header>
	);
}

import {Link} from '@tanstack/react-router';
import {ThemeSelect} from '@/components/ThemeSelect.tsx';
import {useTheme} from '@/components/ThemeContext.tsx';

export function Header() {
	const {theme} = useTheme();

	return (
		<>
			<header className="flex items-center gap-4 p-2 shadow">
				<nav className="navbar grid grid-cols-3">
					<div className="flex items-center gap-2 text-xl font-bold text-nowrap text-primary">
						<img
							src={`/icons/main/${theme === 'dark' ? 'main_dark.svg' : 'main_light.svg'}`}
							alt="Logo"
							className="h-10 w-10 sm:h-14 sm:w-14"
						/>

						<span className="hidden sm:inline">WS2</span>
					</div>

					<ul className="menu menu-horizontal gap-1">
						<li>
							<Link to="/" className="text-xl" activeProps={{className: 'menu-active'}}>
								Dashboard
							</Link>
						</li>

						<li>
							<Link to="/history" className="text-xl" activeProps={{className: 'menu-active'}}>
								History
							</Link>
						</li>

						<li>
							<Link to="/forecast" className="text-xl" activeProps={{className: 'menu-active'}}>
								Forecast
							</Link>
						</li>

						<li>
							<Link
								to="/notifications"
								className="text-xl"
								activeProps={{className: 'menu-active'}}
							>
								Notifications
							</Link>
						</li>
					</ul>

					<div className="flex justify-end gap-1 sm:gap-2">
						<ThemeSelect />
					</div>
				</nav>
			</header>
		</>
	);
}

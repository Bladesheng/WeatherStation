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

					<div className="flex justify-center gap-1 sm:gap-2">
						<Link
							to="/"
							className="btn btn-ghost px-2 text-xl sm:px-4"
							activeProps={{className: 'btn-active'}}
						>
							Dashboard
						</Link>

						<Link
							to="/history"
							className="btn btn-ghost px-2 text-xl sm:px-4"
							activeProps={{className: 'btn-active'}}
						>
							History
						</Link>

						<Link
							to="/forecast"
							className="btn btn-ghost px-2 text-xl sm:px-4"
							activeProps={{className: 'btn-active'}}
						>
							Forecast
						</Link>

						<Link
							to="/notifications"
							className="btn btn-ghost px-2 text-xl sm:px-4"
							activeProps={{className: 'btn-active'}}
						>
							Notifications
						</Link>
					</div>

					<div className="flex justify-end gap-1 sm:gap-2">
						<ThemeSelect />
					</div>
				</nav>
			</header>
		</>
	);
}

import '../styles.css';
import {createRootRouteWithContext, HeadContent, Outlet} from '@tanstack/react-router';
import {TanStackRouterDevtoolsPanel} from '@tanstack/react-router-devtools';
import {TanStackDevtools} from '@tanstack/react-devtools';
import {ReactQueryDevtoolsPanel} from '@tanstack/react-query-devtools';
import type {QueryClient} from '@tanstack/react-query';
import {Link} from '@tanstack/react-router';
import {Header, MOBILE_DRAWER_ID, navLinks} from '@/components/header/Header.tsx';

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: RootComponent,
});

function closeDrawer() {
	const drawer = document.querySelector<HTMLInputElement>(`#${MOBILE_DRAWER_ID}`);
	if (drawer) {
		drawer.checked = false;
	}
}

function RootComponent() {
	return (
		<>
			<HeadContent />

			<div className="drawer">
				<input id={MOBILE_DRAWER_ID} type="checkbox" className="drawer-toggle" />

				<div className="drawer-content flex min-h-screen flex-col">
					<Header />
					<Outlet />
				</div>

				<div className="drawer-side z-50">
					<label htmlFor={MOBILE_DRAWER_ID} aria-label="Close sidebar" className="drawer-overlay" />
					<ul className="menu min-h-full w-72 gap-1 bg-base-100">
						{navLinks.map(({to, label, icon}) => (
							<li key={to}>
								<Link to={to} activeProps={{className: 'menu-active'}} onClick={closeDrawer}>
									<span className={icon} />
									{label}
								</Link>
							</li>
						))}
					</ul>
				</div>

				<TanStackDevtools
					config={{
						position: 'bottom-right',
					}}
					plugins={[
						{
							name: 'TanStack Router',
							render: <TanStackRouterDevtoolsPanel />,
						},
						{
							name: 'TanStack Query',
							render: <ReactQueryDevtoolsPanel />,
						},
					]}
				/>
			</div>
		</>
	);
}

import '../styles.css';
import {createRootRouteWithContext, HeadContent, Outlet} from '@tanstack/react-router';
import {TanStackRouterDevtoolsPanel} from '@tanstack/react-router-devtools';
import {TanStackDevtools} from '@tanstack/react-devtools';
import {ReactQueryDevtoolsPanel} from '@tanstack/react-query-devtools';
import type {QueryClient} from '@tanstack/react-query';
// import {Header} from '@/components/Header.tsx';

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: RootComponent,
});

function RootComponent() {
	return (
		<>
			<HeadContent />

			{/*<Header />*/}

			<Outlet />

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
		</>
	);
}

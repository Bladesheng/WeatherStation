import {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import {createRouter, RouterProvider} from '@tanstack/react-router';
import {routeTree} from './routeTree.gen';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {BProgress} from '@bprogress/core';
import {ThemeProvider} from '@/contexts/ThemeContext.tsx';

window.addEventListener('load', async () => {
	await navigator.serviceWorker.register('/sw.js');
	console.log('[App] SW registered.');
});

const queryClient = new QueryClient();

const router = createRouter({
	routeTree,
	defaultPreload: 'intent',
	scrollRestoration: true,
	context: {
		queryClient,
	},
	// Since we're using React Query, we don't want loader calls to ever be stale
	// This will ensure that the loader is always called when the route is preloaded or visited
	defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

let timeout: number | undefined = undefined;

BProgress.configure({
	showSpinner: false,
});

router.subscribe('onBeforeNavigate', ({fromLocation}) => {
	// Don't show progress on initial page load.
	if (fromLocation) {
		clearTimeout(timeout);
		timeout = window.setTimeout(() => BProgress.start(), 250);
	}
});

router.subscribe('onResolved', () => {
	clearTimeout(timeout);

	if (BProgress.isStarted()) {
		BProgress.done();
	}
});

const rootElement = document.getElementById('app')!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider>
					<RouterProvider router={router} />
				</ThemeProvider>
			</QueryClientProvider>
		</StrictMode>
	);
}

import {defineConfig, type Plugin} from 'vite';
import {devtools} from '@tanstack/devtools-vite';
import {tanstackRouter} from '@tanstack/router-plugin/vite';
import react, {reactCompilerPreset} from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import babel from '@rolldown/plugin-babel';
import {visualizer} from 'rollup-plugin-visualizer';

const config = defineConfig({
	plugins: [
		devtools(),

		tailwindcss(),

		tanstackRouter({
			target: 'react',
			autoCodeSplitting: true,
		}),

		react(),

		babel({
			presets: [reactCompilerPreset()],
		}),

		serviceWorkerPlugin(),

		visualizer(),
	],

	build: {
		rolldownOptions: {
			input: {
				index: 'index.html',
				sw: 'src/sw.ts',
			},
			output: {
				entryFileNames: (chunk) => {
					if (chunk.name === 'sw') {
						return 'sw.js';
					}
					return 'assets/[name]-[hash].js';
				},
			},
		},
	},

	resolve: {
		tsconfigPaths: true,
	},
});

/**
 * Handles transformation of the service worker script from .ts to .js in dev.
 */
function serviceWorkerPlugin(): Plugin {
	return {
		name: 'service-worker-plugin',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use('/sw.js', async (req, res) => {
				const result = await server.transformRequest('/src/sw.ts');
				const code = result?.code?.replace('export {};', '') ?? '';
				res.setHeader('Content-Type', 'application/javascript');
				res.end(code);
			});
		},
	};
}

export default config;

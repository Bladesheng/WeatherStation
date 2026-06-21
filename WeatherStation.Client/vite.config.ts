import {defineConfig} from 'vite';
import {devtools} from '@tanstack/devtools-vite';
import {tanstackRouter} from '@tanstack/router-plugin/vite';
import react, {reactCompilerPreset} from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import babel from '@rolldown/plugin-babel';

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
	],

	resolve: {
		tsconfigPaths: true,
	},
});

export default config;

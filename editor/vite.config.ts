import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 3001,
		fs: {
			allow: ['..'] // Allow access to parent directory for showdown.json
		}
	},
	preview: {
		port: 3001
	}
});

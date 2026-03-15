import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// Extension-specific build settings
	build: {
		// Ensure no external dependencies are bundled
		rollupOptions: {
			output: {
				// Keep asset hashes consistent for extension updates
				assetFileNames: 'assets/[name].[hash][extname]',
				chunkFileNames: 'assets/[name].[hash].js',
				entryFileNames: 'assets/[name].[hash].js'
			}
		}
	}
});

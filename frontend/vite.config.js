import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // Correct plugin for SWC

export default defineConfig({
	plugins: [react()],
	build: {
		outDir: '../dist', // Output directory for Electron
	},
	server: {
		port: 5173,
	},
});

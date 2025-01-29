import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { startHost } from './host.js';
import { startViewer } from './viewer.js';

// ✅ Manually define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

app.whenReady().then(() => {
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 700,
		webPreferences: {
			preload: path.join(__dirname, 'preload.cjs'), // ✅ Ensure correct path
			contextIsolation: true,
			nodeIntegration: false,
			enableRemoteModule: false,
		},
	});

	mainWindow.loadURL('http://localhost:5173');

	ipcMain.handle('start-screen-share', async () => {
		console.log('Starting screen share...');

		try {
			const result = await startHost();
			return { success: true, ...result }; // ✅ Ensure it's a simple object
		} catch (error) {
			console.error('Screen share error:', error);
			return { success: false, error: error.message }; // ✅ Send only JSON-safe data
		}
	});

	ipcMain.handle('start-viewer', async (_, peerId) => {
		console.log('Starting viewer...');
		return await startViewer(peerId);
	});

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') app.quit();
	});
});

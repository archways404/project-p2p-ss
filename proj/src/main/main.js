import {
	app,
	BrowserWindow,
	ipcMain,
	desktopCapturer,
	session,
} from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket, { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

// ✅ Start Electron Window
app.whenReady().then(() => {
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 700,
		webPreferences: {
			preload: path.join(__dirname, 'preload.cjs'),
			contextIsolation: true, // ✅ Allow `navigator.mediaDevices`
			nodeIntegration: false, // ✅ Prevent security issues
			enableRemoteModule: false,
			sandbox: false, // ✅ Electron sandbox blocks screen capture (disable it)
			webSecurity: false, // ✅ Allow media access
		},
	});

	mainWindow.loadURL('http://localhost:5173');

	// ✅ Set media request handler (Allows screen sharing)
	session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
		desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
			console.log('🖥️ Available Screens:', sources);
			callback({ video: sources[0], audio: 'loopback' }); // ✅ Automatically grants screen access
		});
	});

	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		callback({
			responseHeaders: {
				...details.responseHeaders,
				'Content-Security-Policy': [
					"default-src 'self' ws://localhost:8080 ws://localhost:5173; " +
						"script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
						"style-src 'self' 'unsafe-inline'; " +
						'connect-src ws://localhost:8080 ws://localhost:5173; ' +
						"img-src 'self' data:;",
				],
			},
		});
	});

	// ✅ Handle IPC request to get screen sources
	ipcMain.handle('get-screen-sources', async () => {
		const sources = await desktopCapturer.getSources({
			types: ['screen', 'window'],
		});
		return sources.map((source) => ({
			id: source.id,
			name: source.name,
			thumbnail: source.thumbnail.toDataURL(),
		}));
	});

	// ✅ IPC for starting viewer mode in a room
	ipcMain.handle('start-viewer', async (_, roomId) => {
		console.log(`🔍 Starting Viewer in Room: ${roomId}`);
		return { success: true, message: `Viewer started in room ${roomId}` };
	});

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') app.quit();
	});
});

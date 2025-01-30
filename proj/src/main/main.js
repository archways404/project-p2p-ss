import { app, BrowserWindow, ipcMain, session } from 'electron';
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
			contextIsolation: true,
			nodeIntegration: false,
			enableRemoteModule: false,
		},
	});

	mainWindow.loadURL('http://localhost:5173');

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

	// ✅ IPC for starting screen share in a room
	ipcMain.handle('request-screen-share', async (_, roomId) => {
		console.log(`📡 Start Screen Sharing in Room: ${roomId}`);

		const stream = await mainWindow.webContents.executeJavaScript(
			'navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true })'
		);

		return {
			success: true,
			message: `Screen sharing started in room ${roomId}`,
			stream,
		};
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

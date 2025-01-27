const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	// Load the Vite dev server during development
	if (process.env.NODE_ENV === 'development') {
		win.loadURL('http://localhost:5173');
	} else {
		// Load the production build
		win.loadFile(path.join(__dirname, 'dist/index.html'));
	}
}

function createOverlayWindow() {
	const overlayWin = new BrowserWindow({
		width: 400,
		height: 200,
		frame: false, // Removes the window frame
		transparent: true, // Makes the window background transparent
		alwaysOnTop: true, // Keeps the window always on top
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	overlayWin.loadURL(`data:text/html;charset=utf-8,
    <style>
      body {
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        background-color: rgba(0, 0, 0, 0); /* Transparent background */
        color: white;
        font-size: 3rem;
        font-family: Arial, sans-serif;
      }
    </style>
    <body>Cursor</body>`); // Inline HTML and CSS for simplicity
}

// Bindings to handle backend-like operations
ipcMain.handle('greet', async (event, name) => {
	return `Hello ${name}, welcome to Electron with Vite and React!`;
});

ipcMain.on('open-overlay', () => {
	createOverlayWindow();
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

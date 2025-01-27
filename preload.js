const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
	greet: (name) => ipcRenderer.invoke('greet', name),
	openOverlay: () => ipcRenderer.send('open-overlay'),
});

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
	getScreenSources: async () => await ipcRenderer.invoke('get-screen-sources'),
});

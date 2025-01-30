const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
	requestScreenShare: async (roomId) =>
		await ipcRenderer.invoke('request-screen-share', roomId),
	startViewer: async (roomId) =>
		await ipcRenderer.invoke('start-viewer', roomId),
});

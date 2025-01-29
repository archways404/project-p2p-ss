const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
	startScreenShare: async () => {
		const response = await ipcRenderer.invoke('start-screen-share');
		console.log('Response from Electron:', response);
		return response; // ✅ Ensure response stays JSON-safe
	},
	startViewer: (peerId) => ipcRenderer.invoke('start-viewer', peerId),
});

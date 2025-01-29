import React from 'react';

const App = () => {
	const startSharing = async () => {
		try {
			const response = await window.electronAPI.startScreenShare();
			if (response.success) {
				console.log('✅ Screen sharing started:', response.message);
			} else {
				console.error('❌ Failed to start screen share:', response.error);
			}
		} catch (error) {
			console.error('Unhandled IPC error:', error);
		}
	};

	const startViewing = async () => {
		if (window.electronAPI.startViewer) {
			await window.electronAPI.startViewer();
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
			<h1 className="text-3xl font-bold">P2P Screen Sharing</h1>
			<button
				className="mt-4 px-6 py-2 bg-blue-500 rounded hover:bg-blue-600"
				onClick={startSharing}>
				Start Screen Sharing
			</button>
			<button
				className="mt-4 px-6 py-2 bg-green-500 rounded hover:bg-green-600"
				onClick={startViewing}>
				Start Viewing
			</button>
		</div>
	);
};

export default App;

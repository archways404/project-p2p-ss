import React, { useState, useEffect } from 'react';

const App = () => {
	const [sources, setSources] = useState([]);
	const [selectedSource, setSelectedSource] = useState(null);
	const [isSharing, setIsSharing] = useState(false);

	useEffect(() => {
		// ✅ Fetch available screens when the app starts
		window.electronAPI.getScreenSources().then(setSources);
	}, []);

	const startScreenShare = async () => {
		if (!selectedSource) {
			alert('❌ Please select a screen to share!');
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					mandatory: {
						chromeMediaSource: 'desktop',
						chromeMediaSourceId: selectedSource.id,
						minWidth: 1280,
						minHeight: 720,
						maxWidth: 3840,
						maxHeight: 2160,
						minFrameRate: 30,
						maxFrameRate: 120,
					},
				},
				audio: {
					mandatory: {
						chromeMediaSource: 'desktop',
					},
				},
			});

			console.log('✅ Screen sharing started.', stream);
			setIsSharing(true);

			// Display video
			const video = document.getElementById('screen-preview');
			video.srcObject = stream;
			video.play();
		} catch (error) {
			console.error('❌ Screen sharing error:', error);
			alert(`Error: ${error.message}`);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
			<h1 className="text-3xl font-bold">P2P Screen Sharing (Electron)</h1>

			{/* Screen Selection */}
			<select
				className="mt-4 p-2 bg-gray-700"
				onChange={(e) =>
					setSelectedSource(sources.find((src) => src.id === e.target.value))
				}>
				<option value="">Select a screen</option>
				{sources.map((source) => (
					<option
						key={source.id}
						value={source.id}>
						{source.name}
					</option>
				))}
			</select>

			<button
				className={`mt-4 px-6 py-2 rounded ${
					isSharing ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'
				}`}
				onClick={startScreenShare}
				disabled={isSharing}>
				{isSharing ? 'Sharing Started' : 'Start Screen Sharing'}
			</button>

			{/* Screen Preview */}
			<video
				id="screen-preview"
				className="mt-4 w-2/3"></video>
		</div>
	);
};

export default App;

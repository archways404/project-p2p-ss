import React, { useState, useEffect } from 'react';

const App = () => {
	const [socket, setSocket] = useState(null);
	const [roomId, setRoomId] = useState('');
	const [isInRoom, setIsInRoom] = useState(false);
	const [sources, setSources] = useState([]);
	const [selectedSource, setSelectedSource] = useState(null);
	const [resolution, setResolution] = useState('1920x1080');
	const [fps, setFps] = useState(30);
	const [isSharing, setIsSharing] = useState(false);
	const [activeStreams, setActiveStreams] = useState([]); // 🔥 Store active screenshare streams

	// Fetch available screens
	useEffect(() => {
		window.electronAPI.getScreenSources().then(setSources);
	}, []);

	// Generate a random room ID
	const generateRoomId = () => Math.random().toString(36).substring(2, 8);

	// Create a new room and connect
	const createRoom = () => {
		const newRoomId = generateRoomId();
		setRoomId(newRoomId);
		joinRoom(newRoomId);
	};

	// Join an existing room
	const joinRoom = (room) => {
		const ws = new WebSocket('ws://localhost:8080');
		ws.onopen = () => {
			console.log(`✅ Connected to WebSocket, joining room: ${room}`);
			ws.send(JSON.stringify({ type: 'join', room }));
		};

		// 🔥 Handle incoming screenshare streams automatically
		ws.onmessage = async (event) => {
			const data = JSON.parse(event.data);
			if (data.type === 'new-peer') {
				console.log(`🔗 New peer connected: ${data.peerId}`);
			} else if (data.type === 'start-share') {
				console.log(`📡 New screenshare started: ${data.peerId}`);
				await addScreenShare(data.peerId);
			} else if (data.type === 'stop-share') {
				console.log(`🛑 Screenshare stopped: ${data.peerId}`);
				removeScreenShare(data.peerId);
			}
		};

		ws.onclose = () => console.log('❌ Disconnected from WebSocket.');
		ws.onerror = (error) => console.error('⚠️ WebSocket error:', error);

		setSocket(ws);
		setRoomId(room);
		setIsInRoom(true);
	};

	// 🛠️ Start screen sharing
	const startScreenShare = async () => {
		if (!selectedSource) {
			alert('❌ Please select a screen to share!');
			return;
		}

		try {
			const [width, height] = resolution.split('x').map(Number);

			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					mandatory: {
						chromeMediaSource: 'desktop',
						chromeMediaSourceId: selectedSource.id,
						minWidth: width,
						minHeight: height,
						maxWidth: width,
						maxHeight: height,
						minFrameRate: fps,
						maxFrameRate: fps,
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

			// Send start-share message to WebSocket server
			socket.send(
				JSON.stringify({
					type: 'start-share',
					room: roomId,
					peerId: socket.peerId,
				})
			);

			// Display local preview
			setActiveStreams((prev) => [...prev, { peerId: socket.peerId, stream }]);
		} catch (error) {
			console.error('❌ Screen sharing error:', error);
			alert(`Error: ${error.message}`);
		}
	};

	// 🛠️ Stop screen sharing
	const stopScreenShare = () => {
		const video = document.getElementById('local-preview');
		if (video?.srcObject) {
			video.srcObject.getTracks().forEach((track) => track.stop());
			video.srcObject = null;
		}
		setIsSharing(false);
		socket.send(
			JSON.stringify({
				type: 'stop-share',
				room: roomId,
				peerId: socket.peerId,
			})
		);

		// Remove from active streams
		setActiveStreams((prev) => prev.filter((s) => s.peerId !== socket.peerId));
	};

	// 🛠️ Function to add a new screenshare stream
	const addScreenShare = async (peerId) => {
		if (!socket) return;

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					mandatory: {
						chromeMediaSource: 'desktop',
						chromeMediaSourceId: peerId,
					},
				},
				audio: false,
			});

			setActiveStreams((prev) => [...prev, { peerId, stream }]);
		} catch (error) {
			console.error('❌ Failed to view screenshare:', error);
		}
	};

	// 🛠️ Function to remove a screenshare
	const removeScreenShare = (peerId) => {
		setActiveStreams((prev) => prev.filter((s) => s.peerId !== peerId));
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
			<h1 className="text-3xl font-bold">P2P Screen Sharing</h1>

			{!isInRoom ? (
				<div className="mt-4 flex flex-col items-center">
					<button
						className="px-6 py-2 bg-blue-500 rounded hover:bg-blue-600"
						onClick={createRoom}>
						Create Room
					</button>
					<p className="mt-2">or</p>
					<input
						type="text"
						placeholder="Enter Room Code"
						className="mt-2 p-2 text-black"
						value={roomId}
						onChange={(e) => setRoomId(e.target.value)}
					/>
					<button
						className="mt-2 px-6 py-2 bg-green-500 rounded hover:bg-green-600"
						onClick={() => joinRoom(roomId)}>
						Join Room
					</button>
				</div>
			) : (
				<>
					<p className="mt-4">
						Room Code: <strong>{roomId}</strong>
					</p>

					{/* Streaming UI */}
					{!isSharing && (
						<>
							<select
								className="mt-4 p-2 bg-gray-700"
								onChange={(e) =>
									setSelectedSource(
										sources.find((src) => src.id === e.target.value)
									)
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

							<select
								className="mt-2 p-2 bg-gray-700"
								onChange={(e) => setResolution(e.target.value)}>
								<option value="1920x1080">1920x1080</option>
								<option value="2560x1440">2560x1440</option>
								<option value="3840x2160">3840x2160</option>
							</select>

							<select
								className="mt-2 p-2 bg-gray-700"
								onChange={(e) => setFps(Number(e.target.value))}>
								<option value="30">30 FPS</option>
								<option value="60">60 FPS</option>
								<option value="120">120 FPS</option>
							</select>

							<button
								className="mt-4 px-6 py-2 bg-blue-500 rounded hover:bg-blue-600"
								onClick={startScreenShare}>
								Start Screen Sharing
							</button>
						</>
					)}

					{/* Display active screenshares */}
					{activeStreams.map((streamData) => (
						<video
							key={streamData.peerId}
							className="mt-4 w-2/3"
							autoPlay
							playsInline
							ref={(video) => video && (video.srcObject = streamData.stream)}
						/>
					))}
				</>
			)}
		</div>
	);
};

export default App;

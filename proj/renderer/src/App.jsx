import React, { useState } from 'react';

const App = () => {
	const [socket, setSocket] = useState(null);
	const [roomId, setRoomId] = useState('');
	const [isInRoom, setIsInRoom] = useState(false);
	const [isSharing, setIsSharing] = useState(false);
	const [isViewing, setIsViewing] = useState(false);

	const generateRoomId = () => Math.random().toString(36).substring(2, 8);

	const createRoom = () => {
		const newRoomId = generateRoomId();
		setRoomId(newRoomId);
		joinRoom(newRoomId);
	};

	const joinRoom = (room) => {
		const ws = new WebSocket('ws://localhost:8080');

		ws.onopen = () => {
			console.log(`✅ Connected to WebSocket server, joining room: ${room}`);
			ws.send(JSON.stringify({ type: 'join', room }));
		};

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === 'new-peer') {
				console.log(`🔗 New peer connected: ${data.peerId}`);
			}
		};

		ws.onclose = () => {
			console.log('❌ Disconnected from WebSocket server.');
		};

		ws.onerror = (error) => {
			console.error('⚠️ WebSocket error:', error);
		};

		setSocket(ws);
		setRoomId(room);
		setIsInRoom(true);
	};

	const startScreenShare = async () => {
		if (!isInRoom || !socket) {
			console.error('❌ Must join a room before screen sharing.');
			return;
		}

		try {
			const response = await window.electronAPI.requestScreenShare(roomId);
			console.log(response);
			if (response.success) setIsSharing(true);
		} catch (error) {
			console.error('❌ Failed to start screen share:', error);
		}
	};

	const startViewing = async () => {
		if (!isInRoom || !socket) {
			console.error('❌ Must join a room before viewing.');
			return;
		}

		try {
			const response = await window.electronAPI.startViewer(roomId);
			console.log(response);
			if (response.success) setIsViewing(true);
		} catch (error) {
			console.error('❌ Viewer connection failed:', error);
		}
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
					<button
						className={`mt-4 px-6 py-2 rounded ${
							isSharing ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'
						}`}
						onClick={startScreenShare}
						disabled={isSharing}>
						{isSharing ? 'Sharing Started' : 'Start Screen Sharing'}
					</button>

					<button
						className={`mt-4 px-6 py-2 rounded ${
							isViewing ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'
						}`}
						onClick={startViewing}
						disabled={isViewing}>
						{isViewing ? 'Viewing Started' : 'Start Viewing'}
					</button>
				</>
			)}
		</div>
	);
};

export default App;

import Peer from 'simple-peer';
import { startP2P } from './p2p.js';

let peers = {}; // Store active screen sharers

export async function startHost() {
	const { onPeerConnected, sendToAll } = await startP2P();

	onPeerConnected((peerId, sendSignal) => {
		console.log(`Viewer connected: ${peerId}`);

		// Tell all viewers who is sharing
		sendToAll(
			JSON.stringify({ type: 'active-screens', screens: Object.keys(peers) })
		);
	});

	// ✅ Return a simple object
	return {
		status: 'started',
		message: 'Screen sharing started successfully',
		activePeers: Object.keys(peers), // Only send peer IDs, no functions/instances
	};
}

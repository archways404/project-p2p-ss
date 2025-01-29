import Peer from 'simple-peer';
import { startP2P } from './p2p.js';

export async function startViewer(videoElement) {
	// ✅ Ensure correct export
	const { onPeerConnected, sendSignal } = await startP2P();

	let peer = null;

	onPeerConnected((message) => {
		const data = JSON.parse(message);

		if (data.type === 'active-screens') {
			console.log('Active Screens:', data.screens);
			// Display list of screens for user to pick
		}

		if (data.type === 'offer') {
			peer = new Peer({ initiator: false, trickle: false });

			peer.on('signal', (signalData) => {
				sendSignal(JSON.stringify({ type: 'answer', data: signalData }));
			});

			peer.on('stream', (stream) => {
				videoElement.srcObject = stream;
			});

			peer.signal(data.data);
		}
	});

	return { peer };
}

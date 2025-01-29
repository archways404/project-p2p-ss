import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { noise } from '@libp2p/noise';
import { mplex } from '@libp2p/mplex';
import { mdns } from '@libp2p/mdns';

export async function startP2P() {
	const node = await createLibp2p({
		transports: [tcp()],
		connectionEncryption: [noise()],
		streamMuxers: [mplex()],
		peerDiscovery: [mdns()],
	});

	await node.start();
	console.log('P2P Node started:', node.peerId.toString());

	// Store connected peers
	const connectedPeers = new Map();

	return {
		onPeerConnected: (callback) => {
			node.addEventListener('peer:connect', (event) => {
				const peerId = event.detail.id.toString();
				console.log('New peer connected:', peerId);
				connectedPeers.set(peerId, event.detail);
				callback(peerId);
			});
		},

		onSignalReceived: (callback) => {
			node.addEventListener('message', (event) => {
				const { from, data } = event.detail;
				callback(from, JSON.parse(data));
			});
		},

		sendToPeer: (peerId, data) => {
			const peer = connectedPeers.get(peerId);
			if (peer) {
				peer.write(JSON.stringify(data));
			}
		},

		sendToAll: (data) => {
			connectedPeers.forEach((peer) => {
				peer.write(JSON.stringify(data));
			});
		},
	};
}

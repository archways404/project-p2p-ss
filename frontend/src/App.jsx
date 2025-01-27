import { useState } from 'react';

function App() {
	const [name, setName] = useState('');
	const [message, setMessage] = useState('');

	const handleGreet = async () => {
		const result = await window.electron.greet(name);
		setMessage(result);

		// Open the overlay window
		window.electron.openOverlay();
	};

	return (
		<div style={{ padding: '20px' }}>
			<h1>Electron + Vite + React</h1>
			<input
				type="text"
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="Enter your name"
				style={{ padding: '10px', marginRight: '10px' }}
			/>
			<button
				onClick={handleGreet}
				style={{ padding: '10px' }}>
				Greet
			</button>
			{message && <p>{message}</p>}
		</div>
	);
}

export default App;

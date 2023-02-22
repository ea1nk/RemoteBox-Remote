import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  const [status, setStatus] = useState(Array(8).fill(false));
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('status', (data) => {
      setStatus(data);
    });
  }, []);

  const handleButtonClick = (index) => {
    const newStatus = [...status];
    newStatus[index] = !newStatus[index];
    setStatus(newStatus);
    socket.emit('set-antenna', index, newStatus[index]);
  };

  return (
    <div>
      <h1>Antenna Control</h1>
      {connected ? <p>Status: {status.join(',')}</p> : <p>Not connected</p>}
      <div>
        {status.map((s, i) => (
          <button key={i} onClick={() => handleButtonClick(i)}>
            {s ? 'On' : 'Off'}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;

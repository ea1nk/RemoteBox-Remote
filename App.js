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
    
    const intervalId = setInterval(() => {
      socket.emit('get-status');
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleButtonClick = (index) => {
    // The RemoteBox selects one antenna per radio: turning one on turns the others off,
    // and sending "off" has no effect. Radio 1 by default.
    if (status[index]) return;
    setStatus(status.map((_, i) => i === index));
    socket.emit('set-antenna', 1, index, true); // trx, antenna index, on
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

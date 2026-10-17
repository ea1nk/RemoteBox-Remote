import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  // { 1: [bool x8], 2: [bool x8] }, one key per radio the RemoteBox reports
  const [status, setStatus] = useState({ 1: Array(8).fill(false) });
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

  const handleButtonClick = (radio, index) => {
    // The RemoteBox selects one antenna per radio: turning one on turns the others
    // of that radio off, and sending "off" has no effect.
    if (status[radio][index]) return;
    setStatus({ ...status, [radio]: status[radio].map((_, i) => i === index) });
    socket.emit('set-antenna', radio, index, true); // radio, antenna index (0..7), on
  };

  return (
    <div>
      <h1>Antenna Control</h1>
      {connected ? null : <p>Not connected</p>}
      {Object.keys(status).map((radio) => (
        <div key={radio}>
          <h2>Radio {radio}</h2>
          {status[radio].map((s, i) => (
            <button key={i} onClick={() => handleButtonClick(Number(radio), i)}>
              {`ANT-${i + 1}: ${s ? 'On' : 'Off'}`}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export default App;

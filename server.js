const RemoteBox = require('./RemoteBox');

const RB = new RemoteBox('/dev/ttyACM0', 38400);
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer();
const io = socketIo(server, {
  cors: {
    origin: "http://localhost",
    methods: ["GET", "POST"]
  }
});

async function updateAntennaStatus(socket) {
  try {
    const status = await RB.getAntennaStatus();
    socket.emit('status', status);
  } catch (error) {
    console.error('Error getting antenna status:', error);
  }
}

io.on('connection', (socket) => {
  console.log('Client connected');

  updateAntennaStatus(socket);

  socket.on('set-antenna', (index, on) => {
    RB.setRadio1Antenna(index + 1, on)
      .then(() => {
        updateAntennaStatus(io);
      })
      .catch((error) => {
        console.error('Error setting antenna:', error);
      });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('get-status', () => {
    updateAntennaStatus(socket);
  });
});

server.listen(3001, () => {
  console.log('Server listening on port 3001');
});

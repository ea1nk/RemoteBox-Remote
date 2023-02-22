const RemoteBox = require('./RemoteBox');

const RB = new RemoteBox('/dev/ttyACM0', 9600);
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer();
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.emit('status', controller.getAntennaStatus());

  socket.on('set-antenna', (index, on) => {
    RB.setRadio1Antenna(index + 1, on).then(() => {
      const newStatus = RB.getAntennaStatus();
      io.emit('status', newStatus);
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(3001, () => {
  console.log('Server listening on port 3001');
});

const RemoteBox = require('./RemoteBox');
const RB = new RemoteBox('/dev/ttyUSB0', 9600);

RB.getName()
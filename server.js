const RemoteBox = require('./RemoteBox');
const RB = new RemoteBox('/dev/ttyACM0', 9600);

RB.getName()
const {SerialPort} = require('serialport');
class RemoteBox {
  constructor(port, baudRate) {
    this.port = new SerialPort({ path:port, baudRate: baudRate });
    this.commands = {
      NAME: 'O',
      ANTENNA_STATUS: 'S',
      TRACE: 'X',
      ANTENNA_INFO: 'FI',
      SET_RADIO1_ANTENNA: '1R',
      SET_RADIO2_ANTENNA: '2R'
    };
    this.commandCallbacks = {};
    this.responseBuffer = '';
    this.port.on('data', this.handleData.bind(this));
  }

  sendCommand(command, args, callback) {
    const commandString = `${command}${args}\n`;
    this.commandCallbacks[command] = callback;
    this.port.write(commandString, (err) => {
      if (err) {
        console.error(`Error sending command ${commandString}: ${err.message}`);
      }
    });
  }

  handleData(data) {
    this.responseBuffer += data.toString();
    if (this.responseBuffer.includes('\n')) {
      const [response, ...remaining] = this.responseBuffer.split('\n');
      this.responseBuffer = remaining.join('\n');
      const [command, ...args] = response.trim().split(':');
      const callback = this.commandCallbacks[command];
      if (callback) {
        callback(args);
        delete this.commandCallbacks[command];
      }
    }
  }

  getName(callback) {
    this.sendCommand(this.commands.NAME, '', (args) => {
      callback(args[0]);
    });
  }

  getAntennaStatus(callback) {
    this.sendCommand(this.commands.ANTENNA_STATUS, '', (args) => {
      const [antennaStatus] = args;
      callback(antennaStatus.split(':').slice(1).map(Number));
    });
  }

  setTrace(on, callback) {
    this.sendCommand(this.commands.TRACE, on ? '1' : '0', callback);
  }

  getAntennaInfo(callback) {
    this.sendCommand(this.commands.ANTENNA_INFO, '', (args) => {
      const [antennaInfo] = args;
      callback(antennaInfo.split(':').slice(1).map(Number));
    });
  }

  setRadio1Antenna(antennaNumber, on, callback) {
    const args = `${antennaNumber}${on ? '1' : '0'}`;
    this.sendCommand(this.commands.SET_RADIO1_ANTENNA, args, callback);
  }

  setRadio2Antenna(antennaNumber, on, callback) {
    const args = `${antennaNumber}${on ? '1' : '0'}`;
    this.sendCommand(this.commands.SET_RADIO2_ANTENNA, args, callback);
  }
}

module.exports = RemoteBox;

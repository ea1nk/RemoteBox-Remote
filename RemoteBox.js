const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

class RemoteBox {
  constructor(port, baudRate) {
    this.port = new SerialPort({ path: port, baudRate: baudRate });
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r' }));
    this.AntennaStatus = [];
    this.port.on('error', (err) => {
      console.log(err);
    });
  }

  sendCommand(command) {
    const self = this;
    console.log(`Voy a enviar el comando: ${command}`)
    return new Promise(function (resolve, reject) {
      self._writeAndRead(`${command}\n`)
        .then((response) => resolve(response.trim()))
        .catch((error) => reject(error));
    });
  }

  _writeAndRead(data) {
    const self = this;
    console.log("_write and read " + data);
    return new Promise(function (resolve, reject) {
      const dataListener = (responseData) => {
        self.parser.removeListener('data', dataListener);
        resolve(responseData);
      };

      self.parser.on('data', dataListener);

      self.port.write(data, (err) => {
        if (err) {
          self.parser.removeListener('data', dataListener);
          reject(err);
        }
      });
    });
  }

  getInfo() {
    //Todo: return this.sendCommand('O');
  }

  getAntennaStatus() {
    const self = this;
    return new Promise(function (resolve, reject) {
      self.sendCommand('S')
        .then((response) => {
          console.log(response)
          self.AntennaStatus = self._parseAntennaStatus(response);
          resolve(self._parseAntennaStatus(response));
        })
        .catch((error) => {
          console.error('Error in getAntennaStatus:', error);
          reject(error);
        });
    });
  }

  setDebugMessages(enabled) {
    //Todo
    //const value = enabled ? 1 : 0;
    //return this.sendCommand(`X${value}`);
  }

  getAntennaInfo() {
    //Todo: return this.sendCommand('FI');
  }

  setRadio1Antenna(n, on) {
    const value = on ? 1 : 0;
    return this.sendCommand(`1R${n}${value}`);
  }

  setRadio2Antenna(n, on) {
    const value = on ? 1 : 0;
    return this.sendCommand(`2R${n}${value}`);
  }

 _parseAntennaStatus(response) {
  console.log(`Response ${response}`);
  try {
    const matches = response.match(/lSW\d+:<([\d,]+)>/);
    console.log(matches)
    if (!matches) {
      throw new Error('Invalid antenna status message');
    }
    const statuses = matches[1].split(',').map((s) => parseInt(s, 10));
    return statuses;
  } catch (error) {
    throw new Error('Invalid antenna status message');
  }
}
}

module.exports = RemoteBox;

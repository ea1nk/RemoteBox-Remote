const {SerialPort} = require('serialport');
const {Readline} = require('@serialport/parser-readline');

class RemoteBox {
  constructor(port, baudRate) {
    this.port = new SerialPort({ path:port, baudRate: baudRate });
    this.parser = this.port.pipe(new Readline({ delimiter: '\r\n' }));
    this.AntennaStatus = []
  }

  async sendCommand(command) {
    const response = await this._writeAndRead(`${command}\r\n`);
    return response.trim();
  }

  _writeAndRead(data) {
    return new Promise((resolve, reject) => {
      this.port.write(data, (err) => {
        if (err) return reject(err);
      });

      this.parser.once('data', (data) => resolve(data));
    });
  }

  async getInfo() {
    return await this.sendCommand('O');
  }

  async getAntennaStatus() {
    const response = await this.sendCommand('S');
    this.AntennaStatus = this._parseAntennaStatus(response);
    return this._parseAntennaStatus(response);
  }

  async setDebugMessages(enabled) {
    const value = enabled ? 1 : 0;
    return await this.sendCommand(`X${value}`);
  }

  async getAntennaInfo() {
    return await this.sendCommand('FI');
  }

  async setRadio1Antenna(n, on) {
    const value = on ? 1 : 0;
    return await this.sendCommand(`1R${n}${value}`);
  }

  async setRadio2Antenna(n, on) {
    const value = on ? 1 : 0;
    return await this.sendCommand(`2R${n}${value}`);
  }

  _parseAntennaStatus(response) {
    const matches = response.match(/(SW\d+:|lSW:)(\d,?)+/);
    if (!matches) throw new Error('Invalid antenna status message');

    const statuses = matches[0].split(':')[1].split(',').map((s) => parseInt(s, 10));
    return statuses;
  }
}

module.exports = RemoteBox;

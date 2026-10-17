const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const RESPONSE_TIMEOUT = 2000; // ms waiting for the first response line
const IDLE_TIMEOUT = 100; // ms without new lines => response complete (SW1 + SW2)
const ANTENNAS = 8;

class RemoteBox {
  constructor(port, baudRate) {
    this.port = new SerialPort({ path: port, baudRate: baudRate });
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r' }));
    this.AntennaStatus = [];
    this._queue = Promise.resolve();
    this.port.on('error', (err) => {
      console.error(err);
    });
  }

  // Commands are serialized so responses can't get mixed between callers.
  sendCommand(command) {
    const run = () => this._writeAndRead(`${command}\n`).then((lines) => lines.join('\n'));
    const result = this._queue.then(run, run);
    this._queue = result.catch(() => {});
    return result;
  }

  // Writes data and resolves with every line received until the device goes quiet.
  _writeAndRead(data) {
    const self = this;
    return new Promise(function (resolve, reject) {
      const lines = [];
      let timer = null;

      const finish = (err) => {
        clearTimeout(timer);
        self.parser.removeListener('data', onData);
        if (err) {
          reject(err);
        } else {
          resolve(lines);
        }
      };

      const onData = (line) => {
        const text = String(line).trim();
        if (!text) return;
        lines.push(text);
        clearTimeout(timer);
        timer = setTimeout(() => finish(), IDLE_TIMEOUT);
      };

      timer = setTimeout(
        () => finish(new Error(`Timeout waiting for response to ${data.trim()}`)),
        RESPONSE_TIMEOUT
      );
      self.parser.on('data', onData);

      self.port.write(data, (err) => {
        if (err) finish(err);
      });
    });
  }

  // O: device name and model
  getInfo() {
    return this.sendCommand('O');
  }

  // S: antenna status. Returns the array of statuses of the given radio (SW1 by default).
  async getAntennaStatus(radio = 1) {
    const response = await this.sendCommand('S');
    const all = this._parseAntennaStatus(response);
    if (!all[radio]) {
      throw new Error(`No status received for radio ${radio}`);
    }
    this.AntennaStatus = all[radio];
    return all[radio];
  }

  // S: antenna status of every radio, as { 1: [...], 2: [...] }
  async getAllAntennaStatus() {
    const response = await this.sendCommand('S');
    return this._parseAntennaStatus(response);
  }

  // X: trace ON/OFF. It is a toggle, it takes no parameter.
  toggleDebugMessages() {
    return this.sendCommand('X');
  }

  // FI: antenna configuration and names
  getAntennaInfo() {
    return this.sendCommand('FI');
  }

  // trx: radio 1 or 2, n: antenna 1..8, on: true/false
  setRadioAntenna(trx, n, on) {
    trx = Number(trx);
    n = Number(n);
    if (!Number.isInteger(trx) || trx < 1 || trx > 2) {
      return Promise.reject(new RangeError(`Invalid radio: ${trx}`));
    }
    if (!Number.isInteger(n) || n < 1 || n > ANTENNAS) {
      return Promise.reject(new RangeError(`Invalid antenna: ${n}`));
    }
    return this.sendCommand(`${trx}R${n}${on ? 1 : 0}`);
  }

  // Parses "SW1:<x,x,x,x,x,x,x,x>" (and "SW2:..." on two-radio models)
  // into { 1: [bool x8], 2: [bool x8] }.
  _parseAntennaStatus(response) {
    const result = {};
    const re = /SW(\d+):<([01](?:\s*,\s*[01])*)>/g;
    let m;
    while ((m = re.exec(response)) !== null) {
      result[parseInt(m[1], 10)] = m[2].split(',').map((s) => s.trim() === '1');
    }
    if (Object.keys(result).length === 0) {
      throw new Error('Invalid antenna status message');
    }
    return result;
  }
}

module.exports = RemoteBox;

# RemoteBox

[Leer en castellano](LEEME.md)
## EA4TX RemoteBox Web Interface & NodeJS Class

Simple NodeJS class to switch antennas with a EA4TX's RemoteBox.

Sample basic web interface is provided.

Reading antenna names, writing configuration and other functions are not supported.

### Installation:
```
git clone https://github.com/ea1nk/RemoteBox.git
npm install
```
### Sample NodeJS application:
```
node server.js
```

### How to include in your own system:

Import class into your NodeJS app:
```
const RemoteBox = require('./RemoteBox')
```
Create a RemoteBox instace:

```
const RB = new RemoteBox('/dev/ttyACM0', 38400); // Change to match your /dev/ttyX serial port

```
Commands available:

```
getInfo()                      : Device name and model (O)
getAntennaStatus(radio = 1)    : Array of 8 booleans with the antenna status of that radio (S)
getAllAntennaStatus()          : Status of every radio, as { 1: [...], 2: [...] } (S)
setRadioAntenna(radio, n, on)  : Radio 1 or 2, antenna 1..8, on = true/false
getAntennaInfo()               : Raw antenna configuration dump (FI)
toggleDebugMessages()          : Toggles the device trace on/off (X)
```

All commands return a Promise and are queued, so they can be called concurrently.
Each command rejects with an error if the device does not answer within 2 seconds.

Note: the RemoteBox selects **one antenna per radio**. Turning an antenna on turns the
others of that radio off, and sending "off" has no effect, so to change antenna just turn
the new one on.

### Two radio models

Two radio models answer the status command with one line per radio (`SW1:<...>` and `SW2:<...>`).
The class reads both lines, nothing needs to be configured in it.

```
const all = await RB.getAllAntennaStatus();  // { 1: [true,false,...], 2: [false,false,...] }
const radio2 = await RB.getAntennaStatus(2); // only radio 2
await RB.setRadioAntenna(2, 3, true);        // radio 2, antenna 3 ON
```

The sample application (`server.js`, `App.js` and `interface.html`) supports two radios out of the box:
the server emits the `status` event as `{ 1: [...], 2: [...] }` (one key per radio reported by the
RemoteBox) and the interfaces draw one row of antenna buttons per radio. Clicking a button sends
`socket.emit('set-antenna', radio, antennaIndex, true)`, with `antennaIndex` starting at 0.

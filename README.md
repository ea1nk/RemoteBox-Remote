# RemoteBox
## EA4TX RemoteBox Web Interface & NodeJS Class

Simple NodeJS class to switch antennas with a EA4TX's RemoteBox.

Basic web interface is provided as sample.

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
const RB = new RemoteBox('/dev/ttyACM0', 38400);

```
Commands available:

  ```
   getAntennaStatus : Returns an array with the status of the antennas (1=ON, 0=OFF)
 
   setAntenna(TRX,ANTENNA) :  Turns antenna ON for provided TRX
```

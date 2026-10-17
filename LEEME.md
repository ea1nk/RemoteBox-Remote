# RemoteBox
## Interfaz web y clase NodeJS para el RemoteBox de EA4TX

Clase NodeJS sencilla para conmutar antenas con un RemoteBox de EA4TX.

Se incluye una interfaz web de ejemplo.

La escritura de la configuración y otras funciones del equipo no están soportadas.

### Instalación
```
git clone https://github.com/ea1nk/RemoteBox.git
npm install
```

### Aplicación de ejemplo
```
node server.js
```
El servidor abre el puerto serie `/dev/ttyACM0` a 38400 baudios (ajústalo en `server.js` si tu equipo usa otro puerto) y escucha conexiones Socket.IO en el puerto 3001.

### Cómo usarlo en tu propio sistema

Importa la clase en tu aplicación NodeJS:
```
const RemoteBox = require('./RemoteBox')
```
Crea una instancia de RemoteBox:

```
const RB = new RemoteBox('/dev/ttyACM0', 38400); // Cambia el puerto serie según tu sistema
```
Comandos disponibles:

```
getInfo()                      : Nombre y modelo del equipo (O)
getAntennaStatus(radio = 1)    : Array de 8 booleanos con el estado de las antenas de ese radio (S)
getAllAntennaStatus()          : Estado de todos los radios, como { 1: [...], 2: [...] } (S)
setRadioAntenna(radio, n, on)  : Radio 1 o 2, antena 1..8, on = true/false
getAntennaInfo()               : Volcado en bruto de la configuración de las antenas (FI)
toggleDebugMessages()          : Activa/desactiva la traza de depuración del equipo (X)
```

Todos los comandos devuelven una Promesa y se ponen en cola, así que se pueden llamar a la vez.
Si el equipo no responde en 2 segundos, el comando se rechaza con un error.

Nota: el RemoteBox selecciona **una sola antena por radio**. Activar una antena desactiva las demás de ese radio, y enviar "off" no tiene ningún efecto. Para cambiar de antena basta con activar la nueva.

### Modelos de dos radios

Los modelos de dos radios responden al comando de estado con una línea por radio (`SW1:<...>` y `SW2:<...>`). La clase lee las dos líneas y no hay que configurar nada.

```
const todos = await RB.getAllAntennaStatus();  // { 1: [true,false,...], 2: [false,false,...] }
const radio2 = await RB.getAntennaStatus(2);   // solo el radio 2
await RB.setRadioAntenna(2, 3, true);          // radio 2, antena 3 activada
```

La aplicación de ejemplo (`server.js`, `App.js` e `interface.html`) funciona con dos radios sin cambios: el servidor emite el evento `status` como `{ 1: [...], 2: [...] }` (una clave por cada radio que informa el RemoteBox) y las interfaces dibujan una fila de botones de antena por radio. Al pulsar un botón se envía `socket.emit('set-antenna', radio, indiceAntena, true)`, con `indiceAntena` empezando en 0.

### Documentación del protocolo

La lista de comandos del equipo está en [RemoteBox API.md](RemoteBox%20API.md).

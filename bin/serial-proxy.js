#!/usr/bin/env node
const { SerialPort } = require("serialport");
const HeartbeatByte = "|";

const [nodePath, scriptPath, serialPath] = process.argv;
if (process.argv.length !== 3) {
  console.error(`usage: ${nodePath} ${scriptPath} serial-path`);
  process.exit(1);
}

const serial = new SerialPort({
  path: serialPath,
  baudRate: 115200,
});

serial.on("data", (data) => {
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    console.log(byte);
  }
});

serial.on("error", (error) => {
  console.log(`Error on serial port: ${error}`);
  if (serial.isOpen) {
    serial.close();
    serial.open();
  } else {
    setTimeout(() => {
      serial.open();
    }, 100);
  }
});

serial.on("close", (error) => {
  console.log(`Serial port closed: ${error}`);
  if (!error || error.disconnected) {
    serial.open();
  }
});

serial.on("open", () => {
  console.log(`Serial port opened`);
  serial.write(HeartbeatByte);
});

setInterval(() => {
  serial.write(HeartbeatByte);
}, 500);

#!/usr/bin/env node
const fs = require("fs");
const { SerialPort } = require("serialport");
const processedChords = "processed.json";

const config = JSON.parse(fs.readFileSync(processedChords));

const TOPLAYER = config.layout.layers.length - 1;
const VIRT_KEYS = config.layout.keys.length;
const VIRT_KEYMULT_DOWN = 0;
const VIRT_KEYMULT_UP = 1;
const VIRT_KEYMULT_CHENTRY = 2;
const VIRT_KEYMULT_HOLD = 3;
const VIRT_KEYMULT_LAST = 4;
const VIRT_WARN = 0;
const VIRT_HEARTBEAT = 1;
const VIRT_KEYS_START = VIRT_HEARTBEAT + 1;
const VIRT_KEYS_END = VIRT_KEYS_START + VIRT_KEYS * VIRT_KEYMULT_LAST;
const VIRT_CHORD_STARTED = VIRT_KEYS_END + 1;
const VIRT_CHORD_ENDED = VIRT_CHORD_STARTED + 1;
const VIRT_LAYER_ZERO = VIRT_CHORD_ENDED + 1;
const VIRT_LAYER_LAST = VIRT_LAYER_ZERO + TOPLAYER;
const VIRT_MOD_ZERO = VIRT_LAYER_LAST + 1;
const VIRT_SHIFT_DOWN = VIRT_MOD_ZERO;
const VIRT_SHIFT_UP = VIRT_SHIFT_DOWN + 1;
const VIRT_CTRL_DOWN = VIRT_SHIFT_UP + 1;
const VIRT_CTRL_UP = VIRT_CTRL_DOWN + 1;
const VIRT_ALT_DOWN = VIRT_CTRL_UP + 1;
const VIRT_ALT_UP = VIRT_ALT_DOWN + 1;
const VIRT_GUI_DOWN = VIRT_ALT_UP + 1;
const VIRT_GUI_UP = VIRT_GUI_DOWN + 1;
const VIRT_MOD_LAST = VIRT_GUI_UP;
const VIRT_TIMEOUT = 1000;

const [nodePath, scriptPath, serialPath] = process.argv;
if (process.argv.length !== 3) {
  console.error(`usage: ${nodePath} ${scriptPath} serial-path`);
  process.exit(1);
}

let currentCombo;
let currentLayer = config.layout.layers[0];
let currentMods = {
  shift: false,
  ctrl: false,
  alt: false,
  gui: false,
};

const serial = new SerialPort({
  path: serialPath,
  baudRate: 115200,
});

const layersToCheck = (mods) => {
  let layers = [currentLayer];
  ["Shift", "Ctrl", "Alt", "Gui"].forEach((mod) => {
    if (mods[mod.toLowerCase()]) {
      layers.unshift(...layers.map((layer) => `${layer}-${mod}`));
    }
  });
  layers.push("Alpha");
  return layers;
};

serial.on("data", (data) => {
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];

    if (byte === VIRT_WARN) {
      console.warn("Got warning from keyboard");
    } else if (byte === VIRT_HEARTBEAT) {
      console.log("");
    } else if (byte >= VIRT_KEYS_START && byte <= VIRT_KEYS_END) {
      const index = (byte - VIRT_KEYS_START) % VIRT_KEYS;

      if (currentCombo) {
        currentCombo.push(index);
      } else {
        const type = Math.floor((byte - VIRT_KEYS_START) / VIRT_KEYS);
        const key = config.layout.keys[index];

        if (type == VIRT_KEYMULT_DOWN) {
          console.log(`${key.Alpha} down`);
        } else if (type == VIRT_KEYMULT_UP) {
          console.log(`${key.Alpha} up`);
        } else if (type == VIRT_KEYMULT_CHENTRY) {
          let output = null;
          let mods = currentMods;

          layersToCheck(mods).forEach((layer) => {
            if (output === null && layer in key) {
              output = key[layer];
            }
          });
          console.log(`${output} typed`);
        } else if (type == VIRT_KEYMULT_HOLD) {
          const label = key[currentLayer] ?? key.Alpha;
          const output = key[`${currentLayer}-Hold`];
          if (output === null) {
            console.log(`${label} held for gui ${label}`);
          } else {
            console.log(`${label} held to type ${output}`);
          }
        } else {
          console.warn(`Unhandled key byte: ${byte}`);
        }
      }
    } else if (byte === VIRT_CHORD_STARTED) {
      currentCombo = [];
    } else if (byte === VIRT_CHORD_ENDED) {
      console.log("Combo", currentCombo);
      currentCombo = undefined;
    } else if (byte >= VIRT_LAYER_ZERO && byte <= VIRT_LAYER_LAST) {
      const layer = config.layout.layers[byte - VIRT_LAYER_ZERO];
      console.log(`Layer ${currentLayer} -> ${layer}`);
      currentLayer = layer;
    } else if (byte >= VIRT_MOD_ZERO && byte <= VIRT_MOD_LAST) {
      let mod;
      let down;

      switch (byte) {
        case VIRT_SHIFT_DOWN:
        case VIRT_CTRL_DOWN:
        case VIRT_ALT_DOWN:
        case VIRT_GUI_DOWN:
          down = true;
          break;

        case VIRT_SHIFT_UP:
        case VIRT_CTRL_UP:
        case VIRT_ALT_UP:
        case VIRT_GUI_UP:
          down = false;
          break;

        default:
          console.warn(`Unhandled mod input ${byte}`);
          break;
      }

      switch (byte) {
        case VIRT_SHIFT_DOWN:
        case VIRT_SHIFT_UP:
          mod = "shift";
          break;

        case VIRT_CTRL_DOWN:
        case VIRT_CTRL_UP:
          mod = "ctrl";
          break;

        case VIRT_ALT_DOWN:
        case VIRT_ALT_UP:
          mod = "alt";
          break;

        case VIRT_GUI_DOWN:
        case VIRT_GUI_UP:
          mod = "gui";
          break;
      }

      currentMods[mod] = down;
      console.log(`${mod} ${down ? "down" : "up"}`);
    } else {
      console.warn(`Unhandled input ${byte}`);
    }
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
  serial.write(String.fromCharCode(VIRT_HEARTBEAT));
});

setInterval(() => {
  serial.write(String.fromCharCode(VIRT_HEARTBEAT));
}, VIRT_TIMEOUT / 2);

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

const indexForAlpha = {};
config.layout.keys.forEach((key, i) => {
  indexForAlpha[key.Alpha] = i;
});

const chordForCombo = {};
config.chords.forEach((chord) => {
  const key = chord.combo
    .map((k) => indexForAlpha[k])
    .sort()
    .join("+");
  chordForCombo[key] = chord;
});

let currentCombo;
let currentLayer = config.layout.layers[0];
let currentMods = {
  shift: false,
  ctrl: false,
  alt: false,
  gui: false,
};
let currentDup;
let currentDupAlternate;
let dupMods = { ...currentMods };

const serial = new SerialPort({
  path: serialPath,
  baudRate: 115200,
});

const describeModded = (mods, output) => {
  const m = Object.entries(mods)
    .map(([mod, down]) => (down ? mod : null))
    .filter(Boolean)
    .join(" ");
  return `${m}${m ? " " : ""}${output}`;
};

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

const typed = (output, mods) => {
  console.log(`Typed ${describeModded(mods, output)}`);
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

          if (output === "Dup") {
            mods = { ...dupMods };

            if (typeof currentDup === "string") {
              output = currentDup;
            } else if (typeof currentDup === "object") {
              const chord = currentDup;
              if (chord.alternates?.length) {
                const alternate = chord.alternates[currentDupAlternate];
                currentDupAlternate =
                  (currentDupAlternate + 1) % chord.alternates.length;
                if (alternate.backspaces) {
                  typed("\b".repeat(alternate.backspaces), mods);
                }
                output = alternate.append;
                if (!alternate.exact) {
                  output += " ";
                }
              } else {
                console.log("Dupping chord but has no alternates", { chord });
                output = "";
              }
            } else {
              output = "";
              console.warn(`Unexpected dup: ${currentDup}`);
            }
          } else {
            currentDup = output;
            dupMods = { ...mods };
          }
          typed(output, mods);
        } else if (type == VIRT_KEYMULT_HOLD) {
          const label = key[currentLayer] ?? key.Alpha;
          let output = key[`${currentLayer}-Hold`];
          const mods = { ...currentMods };

          if (output === null) {
            mods.gui = true;
            output = label;
          }

          typed(output, mods);
          currentDup = output;
          dupMods = { ...currentMods };
          // Not implemented yet in qmk-config
          // dupMods = { ...mods };
        } else {
          console.warn(`Unhandled key byte: ${byte}`);
        }
      }
    } else if (byte === VIRT_CHORD_STARTED) {
      currentCombo = [];
    } else if (byte === VIRT_CHORD_ENDED) {
      const key = currentCombo.sort().join("+");
      const chord = chordForCombo[key];

      if (chord.behavior) {
        console.log(`Chord behavior ${chord.behavior}`);
      } else {
        let output = chord.output;
        if (!chord.exact) {
          output += " ";
        }
        typed(output, currentMods);
      }

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

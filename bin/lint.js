#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const { join: pathJoin } = require("path");
const { spawnSync } = require("child_process");
const chordFiles = ["chords.json", "personal.json"];
const layoutFiles = ["layout.json"];

const types = `
type Layer = "Alpha" | "Symbol" | "Number" | "Function";
type Modifier = "Shift" | "Ctrl" | "Alt" | "Gui" | "Hold";
type LayerWithModifier = Layer | ${"`${Layer}-${Modifier}`"};

type AlphaKey = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
type NumberKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type SymbolKey = '"' | "#" | "$" | "%" | "&" | "'" | "(" | ")" | "*" | "+" | "," | "-" | "." | "/" | "<" | "=" | ">" | "@" | "[" | "\\\\" | "]" | "^" | "_" | "\`" | "{" | "|" | "}" | "~" | "—" | "…";
type NavigationKey = "Spc" | "Bksp" | "Ret" | "Tab" | "Esc" | "Up" | "Down" | "Left" | "Rght" | "Dup";
type ModifierKey = "Shft" | "Ctrl" | "Alt" | "Gui";
type LayerKey = "Alph" | "Sym" | "Num";
type MediaKey = "Alfr" | "VlUp" | "VlDn" | "Mute" | "Prev" | "PlPs" | "Next" | "BrUp" | "BrDn" | "ZmIn" | "ZmOt" | "Lang" | "ScSh" | "Lock";
type BluetoothKey = "BTTg" | "BTCl" | "BT1" | "BT2" | "BT3" | "BT4" | "BT5" | "BT6";
type KeyboardKey = "BtlL" | "BtlR" | "RstL" | "RstR";
type Key = AlphaKey | NumberKey | SymbolKey | NavigationKey | ModifierKey | LayerKey | MediaKey | BluetoothKey | KeyboardKey;

type Behavior = "delete-word" | "left-click" | "right-click" | "function-layer";

type ChordInput = {
  combo: Array<Key>;
};

type ChordResult = {
  output: string | Array<string>;
} | {
  behavior: Behavior;
};

type ChordDefaults = {
  label?: string;
  layers?: Layer | Array<Layer>;
  exact?: boolean;
  skipSentence?: boolean;
  sentenceShift?: boolean;
  quiet?: boolean;
  personal?: boolean;
  builtin?: boolean | "zmk" | "qmk";
};

type Chord = ChordInput & ChordResult & ChordDefaults;

type ChordHeader = string;

type ChordConfig = {
  defaults?: ChordDefaults;
  chords: Array<Chord | ChordHeader>;
};

type KeyConfig = Key | "" | null;

type MainRowConfig = [
  KeyConfig, KeyConfig, KeyConfig, KeyConfig, KeyConfig,
  KeyConfig, KeyConfig, KeyConfig, KeyConfig, KeyConfig,
];

type ThumbRowConfig = [
  KeyConfig, KeyConfig, KeyConfig, KeyConfig,
];

type LayerConfig = [
  MainRowConfig,
  MainRowConfig,
  MainRowConfig,
  ThumbRowConfig,
];

type LayoutConfig = {
  Alpha: LayerConfig;
} & {
  [L in LayerWithModifier]?: LayerConfig;
};
`;

let wroteTypes = false;
const tempDir = os.tmpdir();

const lint = (file, content) => {
  if (!wroteTypes) {
    fs.writeFileSync(pathJoin(tempDir, "chords.d.ts"), types);
    wroteTypes = true;
  }

  const tsFile = file + ".ts";
  const path = pathJoin(tempDir, tsFile);
  fs.writeFileSync(path, content);
  const { status, stdout, stderr } = spawnSync(
    "tsc",
    ["--strict", "--noEmit", "--pretty", tsFile, "chords.d.ts"],
    {
      cwd: tempDir,
    }
  );
  if (stdout.length) {
    console.log(String(stdout).replaceAll(tsFile, file));
  }
  if (stderr.length) {
    console.warn(String(stderr).replaceAll(tsFile, file));
  }
  if (status !== 0) {
    process.exit(status);
  }
};

chordFiles.forEach((file) => {
  const json = fs.readFileSync(file);
  const content = `const config: ChordConfig = ${json}`;
  lint(file, content);
});

layoutFiles.forEach((file) => {
  const json = fs.readFileSync(file);
  const content = `const config: LayoutConfig = ${json}`;
  lint(file, content);
});

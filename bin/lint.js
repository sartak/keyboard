#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const { join: pathJoin } = require("path");
const { spawnSync } = require("child_process");
const chordFiles = ["chords.json", "personal.json"];

const types = `
type Layer = "Alpha" | "Symbol" | "Number" | "Function";

type ChordInput = {
  combo: Array<string>;
};

type ChordResult = {
  output: string | Array<string>;
} | {
  behavior: string;
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

#!/usr/bin/env node
const fs = require("fs");
const sqlite3 = require("better-sqlite3");
const processedChords = "processed.json";

const [nodeArg, scriptArg, ankiDatabase, noteType] = process.argv;
if (process.argv.length !== 4) {
  console.error(`usage: ${nodeArg} ${scriptArg} collection.anki2 note-type`);
  process.exit(1);
}

if (!fs.existsSync(ankiDatabase)) {
  throw new Error(`anki sqlite database '${ankiDatabase}' does not exist`);
}

const getCards = () => {
  const cards = [];

  const anki = sqlite3(ankiDatabase);
  anki.pragma("journal_mode = WAL");

  const res = anki
    .prepare("SELECT id FROM notetypes WHERE name = ? COLLATE nocase")
    .get(noteType);

  if (!res) {
    throw new Error(`Note type '${noteType}' does not exist in Anki database`);
  }

  const mid = res.id;

  const stmt = anki.prepare(`
  SELECT notes.id, notes.flds, notes.tags, cards.queue
  FROM notes
  LEFT JOIN cards ON cards.nid = notes.id
  WHERE notes.mid = ?
`);
  for (const { id, flds, tags: tagString, queue } of stmt.iterate(mid)) {
    const tags = tagString.split(" ").filter((t) => t.length);
    const [output, inputString] = flds.split("\x1F");
    const input = inputString.split(" ");

    let suspended;
    switch (queue) {
      case -1: // suspended
        suspended = true;
        break;

      case -3: // user buried (in scheduler 2)
      case -2: // sched buried (in scheduler 2), buried (in scheduler 1)
      case 0: // new
      case 1: // learning
      case 2: // review
      case 3: // in learning, next rev in at least a day after the previous review
      case 4: // preview
        suspended = false;
        break;

      default:
        suspended = undefined;
        console.warn(
          `Unable to determine suspended state for card nid:${id} for ${inputString} => ${output}`
        );
        break;
    }

    cards.push({ id, output, input, tags, suspended });
  }

  return cards;
};

const config = JSON.parse(fs.readFileSync(processedChords));
const cards = getCards();
const cardForInput = {};
const chordForCombo = {};
let studyingChords = 0;
let studyingOther = 0;
let chordsCount = config.chords.length;

cards.forEach((card) => {
  const key = card.input
    .map((c) => c.toUpperCase())
    .sort()
    .join("+");
  cardForInput[key] = card;
});

config.chords.forEach((chord) => {
  const key = chord.combo
    .map((c) => c.toUpperCase())
    .sort()
    .join("+");
  chordForCombo[key] = chord;
});

Object.entries(chordForCombo).forEach(([key, chord]) => {
  let ok = true;
  let k = key;
  let card = cardForInput[k];
  if (!card && chord.layers?.length) {
    k = [...chord.layers, ...chord.combo]
      .map((c) => c.toUpperCase())
      .sort()
      .join("+");
    card = cardForInput[k];
  }

  const combo = chord.combo.join("+");
  let context = `${combo} => ${chord.output || chord.behavior}`;

  if (!card) {
    ok = false;
    console.warn(`No Anki card for chord: ${context}`);
    return;
  }

  context = `card nid:${card.id} for ${context}`;
  if (!card.tags.includes("chord")) {
    ok = false;
    console.warn(`Missing tag 'chord' for ${context}`);
  }

  if (chord.behavior) {
    if (card.output !== chord.behavior) {
      ok = false;
      console.warn(
        `Card nid:${card.id} for combo ${combo} does not match expected behavior`
      );
      console.warn(` Card: ${card.output}`);
      console.warn(`Chord: ${chord.behavior}`);
    }
  } else {
    let expected = chord.output;
    if (expected.length === 1 && expected.match(/[a-zA-Z]/)) {
      expected += " (word)";
    }
    expected = expected.replaceAll(/\x08/g, "⌫");

    if (card.output !== expected) {
      ok = false;
      console.warn(
        `Card nid:${card.id} for combo ${combo} does not match expected output`
      );
      console.warn(` Card: ${card.output}`);
      console.warn(`Chord: ${expected}`);
    }
  }

  delete cardForInput[k];

  if (ok) {
    chord.anki = card;
    if (card.suspended === false) {
      studyingChords++;
    }
  }
});

Object.values(cardForInput).forEach((card) => {
  if (!card.tags.includes("chord")) {
    if (card.suspended === false) {
      studyingOther++;
    }
    return;
  }
  console.warn(
    `No chord found for Anki card nid:${card.id} ${card.input.join(" ")} => ${
      card.output
    }`
  );
});

fs.writeFileSync(processedChords, JSON.stringify(config));

console.log(
  `Studying ${studyingChords} of ${config.chords.length} chords, plus ${studyingOther} others`
);

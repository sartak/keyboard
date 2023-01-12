#!/usr/bin/env node
const fs = require("fs");
const chordFiles = ["chords.json", "personal.json"];
const layoutFile = "layout.json";
const readmeFile = "README.md";

const tidyReadmeCombo = {
  Ret: "↵",
  Dup: "⨧",
  Bksp: `⌫`,
  Spc: "␣",
  Tab: "⇥",
};

const tidyReadmeOutput = {
  "\b": "⌫",
};

const intuitLabel = ({ output }) =>
  output[0]
    .split("")
    .map((l) => tidyReadmeOutput[l] || l)
    .join("");

const intuitIdentifierStem = ({ label }) => {
  let identifier = label.toLowerCase();
  identifier = identifier.replaceAll(/[^a-z_0-9]+/g, "_");
  return identifier.substring(0, 7);
};

const parseLayout = (layers) => {
  const validKey = {};
  layers.Alpha.forEach((row) => {
    row.forEach((key) => {
      validKey[key] = true;
    });
  });

  return {
    layers: Object.keys(layers),
    validKey,
  };
};

const { validKey } = parseLayout(JSON.parse(fs.readFileSync(layoutFile)));

const validateCombo = ({ combo }) => {
  combo.forEach((key) => {
    if (!validKey[key]) {
      throw new Error(`Unexpected combo key '${key}'`);
    }
  });
};

const parseChords = (files) => {
  const result = [];
  let seenIdentifier = {};

  files.forEach(({ chords, defaults, ...rest }) => {
    if (Object.keys(rest).length) {
      throw new Error(
        `Unexpected keys ${Object.keys(rest)
          .map((r) => `'${r}'`)
          .join(", ")} in file`
      );
    }

    chords.forEach((input) => {
      if (typeof input === "string") {
        result.push(input);
        return;
      }

      try {
        const chord = { ...defaults, ...input };

        {
          const {
            combo,
            output,
            label,
            exact,
            quiet,
            skipSentence,
            layers,
            identifier,
            ...rest
          } = chord;

          if (Object.keys(rest).length) {
            throw new Error(
              `Unexpected keys ${Object.keys(rest)
                .map((r) => `'${r}'`)
                .join(", ")}`
            );
          }
        }

        if (chord.combo.length === 0) {
          return;
        }
        validateCombo(chord);

        if (typeof chord.output === "string") {
          chord.output = [chord.output];
        }

        if (chord.label === undefined) {
          chord.label = intuitLabel(chord);
        }

        if (typeof chord.layers === "string") {
          chord.layers = [chord.layers];
        }

        if (chord.identifier === undefined) {
          const stem = intuitIdentifierStem(chord);
          let identifier = stem;
          let i = 0;
          while (seenIdentifier[identifier]) {
            i++;
            identifier = stem + i;
          }
          chord.identifier = identifier;
        } else {
          if (seenIdentifier[chord.identifier]) {
            throw new Error(`Duplicate identifier '${chord.identifier}'`);
          }
        }
        seenIdentifier[chord.identifier] = true;

        if (!chord.identifier.match(/^[a-z_][a-z_0-9]{0,6}$/)) {
          throw new Error(`Malformed identifier '${chord.identifier}'`);
        }

        result.push(chord);
      } catch (err) {
        throw new Error(`${err.message} in chord '${JSON.stringify(input)}'`);
      }
    });
  });

  return result;
};

const chordsAndCategories = parseChords(
  chordFiles.map((file) => JSON.parse(fs.readFileSync(file)))
);

const dropAfter = (xs, re) => {
  const i = xs.findIndex((x) => x.match(re));
  return i === -1 ? xs : xs.slice(0, i);
};

const renderCombo = ({ combo }) => {
  return combo
    .map((key) =>
      ["`", key in tidyReadmeCombo ? tidyReadmeCombo[key] : key, "`"].join("")
    )
    .join(" + ");
};

const renderOutput = ({ output }) => {
  return output
    .map((output) =>
      output
        .split("")
        .map((letter) =>
          letter in tidyReadmeOutput ? tidyReadmeOutput[letter] : letter
        )
        .join("")
    )
    .join(" → ");
};

const updateReadme = (original) => {
  const lines = dropAfter(original, new RegExp(/^## \d+ chords$/));

  const visibleChords = chordsAndCategories.filter(
    (chord) => typeof chord === "object" && !chord.quiet
  );
  lines.push(`## ${visibleChords.length} chords`);

  chordsAndCategories.forEach((chord) => {
    if (typeof chord === "string") {
      lines.push("", `### ${chord}`, "");
      return;
    }

    const { quiet } = chord;
    if (quiet) {
      return;
    }
    lines.push(`- ${renderCombo(chord)} → ${renderOutput(chord)}`);
  });
  lines.push("");

  fs.writeFileSync(readmeFile, lines.join("\n"));
};

updateReadme(fs.readFileSync(readmeFile, "utf-8").split("\n"));

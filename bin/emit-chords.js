#!/usr/bin/env node
const fs = require("fs");
const chordFiles = ["chords.json", "personal.json"];
const layoutFile = "layout.json";
const readmeFile = "README.md";
const qmkChordFile = "../qmk-config/chords.c";

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
  const qmkKey = {};

  layers.Alpha.forEach((row) => {
    row.forEach((key) => {
      validKey[key] = true;
    });
  });

  Object.entries(layers).forEach(([layer, rows]) => {
    qmkKey[layer] = {};
    const prefix = layer.substring(0, 1);

    const qmkKeyTidy = {
      ".": `${prefix}_d`,
      ",": `${prefix}_c`,
      Ret: `${prefix}_r`,
      "'": `${prefix}_q`,
    };

    rows[3].forEach((key, i) => {
      qmkKeyTidy[key] = `${prefix}T${i}`;
    });

    rows.forEach((row, r) => {
      row.forEach((_, c) => {
        const alpha = layers.Alpha[r][c];
        qmkKey[layer][alpha] =
          qmkKeyTidy[alpha] || `${prefix}_${alpha.toUpperCase()}`;
      });
    });
  });

  return {
    layers: Object.keys(layers),
    validKey,
    qmkKey,
  };
};

const { validKey, qmkKey } = parseLayout(
  JSON.parse(fs.readFileSync(layoutFile))
);

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

const macro = (name, params, lines) => {
  const sig = params === null ? "" : `(${params.join(", ")})`;
  const define = `#define ${name}${sig}`;
  if (Array.isArray(lines)) {
    return [define, ...lines.map((l) => `  ${l}`)].join(" \\\n");
  } else {
    return [`${define} ${lines}`];
  }
};

const qmkCombo = ({ combo, layers }) => {
  let layer = "Alpha";

  if (Array.isArray(layers)) {
    if (layers.length > 1) {
      throw new Error(`Cannot yet encode combo for multiple layers ${layers}`);
    } else {
      layer = layers[0];
    }
  }

  return combo.map((key) => qmkKey[layer][key]).join(", ");
};

const qmkOutput = ({ output }) => {
  const out = [];
  let rest = output[0];
  let buf = [];
  let ascii = null;

  const emit = () => {
    if (buf.length) {
      if (ascii) {
        out.push(`SEND_STRING("${buf.join("")}");`);
      } else {
        out.push(`send_unicode_string("${buf.join("")}");`);
      }
    }
    buf = [];
    ascii = null;
  };

  while (rest.length) {
    const head = rest.substring(0, 1);
    rest = rest.substring(1);

    if (head === "\b") {
      emit();
      out.push("tap_code16(KC_BSPC);");
      continue;
    }

    if (head.charCodeAt(0) > 127) {
      if (ascii == true) {
        emit();
      }
      ascii = false;
    } else {
      if (ascii == false) {
        emit();
      }
      ascii = true;
    }

    buf.push(head);
  }

  emit();

  return out;
};

const qmkAlternates = ({ output, exact }) => {
  const alternates = [];
  for (let i = 0, max = output.length - 1; i < max; i++) {
    alternates.push([i, i + 1, output[i], output[i + 1]]);
  }
  const i = output.length - 1;
  alternates.push([i, 0, output[i], output[0]]);

  alternates.forEach((alt) => {
    const [, , from, to] = alt;

    let f = from;
    while (f.length) {
      if (to.substr(0, f.length) === f) {
        break;
      }
      f = f.substring(0, f.length - 1);
    }

    let backspaces = from.length - f.length;
    const append = to.substring(f.length);

    if (!exact) {
      backspaces++;
    }

    alt.push(backspaces);
    alt.push(append);
    alt.push(exact);
  });

  return alternates;
};

const qmkEnum = (chords) => [
  macro(
    "CHORD_ENUM",
    null,
    chords.map(({ identifier }) => `CHORD_${identifier},`)
  ),
];

const qmkCombos = (chords) => [
  macro(
    "COMBO_FOR_CHORD",
    ["name", "..."],
    "const uint16_t PROGMEM chord_##name[] = {__VA_ARGS__, COMBO_END};"
  ),
  ...chords.map(
    (chord) => `COMBO_FOR_CHORD(${chord.identifier}, ${qmkCombo(chord)});`
  ),
];

const qmkActions = (chords) => [
  macro("CHORD_COMBO", ["name"], "[CHORD_##name] = COMBO_ACTION(chord_##name)"),
  macro(
    "CHORD_COMBOS",
    null,
    chords.map(({ identifier }) => `CHORD_COMBO(${identifier}),`)
  ),
];

const qmkFunction = (chords) => {
  const intro = `void process_chord_event(uint16_t combo_index, bool pressed) {
  if (!pressed) {
    return;
  }
  bool space = true;
  switch(combo_index) {`;

  const cases = [];
  chords.forEach((chord) => {
    cases.push(`    case CHORD_${chord.identifier}:`);
    if (chord.exact) {
      cases.push("      space = false;");
    }
    qmkOutput(chord).forEach((line) => {
      cases.push(`      ${line}`);
    });
    cases.push("      break;");
  });

  const outro = `    default:
      space = false;
      break;
  }
  if (space) {
    tap_code(KC_SPC);
  }
}`;

  return [
    macro("CHORD_FUNC", null, [
      ...intro.split("\n"),
      ...cases,
      ...outro.split("\n"),
    ]),
  ];
};

const qmkDupFunction = (chords) => {
  const intro = `uint8_t process_chord_dup(uint16_t last_chord, uint8_t last_chord_cycle) {
  uint8_t next_chord_cycle = 0;
  uint8_t backspaces = 0;
  char *append = NULL;
  bool space = true;
  switch(last_chord) {`;

  const cases = [];
  chords
    .filter((chord) => chord.output.length > 1)
    .forEach((chord) => {
      cases.push(`    case CHORD_${chord.identifier}:`);
      cases.push("      switch(last_chord_cycle) {");
      qmkAlternates(chord).forEach(([i, j, _from, _to, bs, append, exact]) => {
        cases.push(`        case ${i}:`);
        if (bs) {
          cases.push(`          backspaces = ${bs};`);
        }
        if (append.length) {
          cases.push(`          append = "${append}";`);
        }
        if (exact) {
          cases.push(`          space = false;`);
        }
        cases.push(`          next_chord_cycle = ${j};`);
        cases.push(`        break;`);
      });
      cases.push("      }");
      cases.push("      break;");
    });

  const outro = `    default:
      space = false;
      break;
  }
  for (uint8_t i = 0; i < backspaces; i++) {
    tap_code(KC_BSPC);
  }
  if (append != NULL) {
    send_string(append);
  }
  if (space) {
    tap_code(KC_SPC);
  }
  return next_chord_cycle;
}`;

  return [
    macro("CHORD_DUP_FUNC", null, [
      ...intro.split("\n"),
      ...cases,
      ...outro.split("\n"),
    ]),
  ];
};

const updateQmk = () => {
  const lines = [];
  const chords = chordsAndCategories.filter(
    (chord) => typeof chord === "object"
  );

  lines.push(...qmkEnum(chords), "");
  lines.push(...qmkCombos(chords), "");
  lines.push(...qmkActions(chords), "");
  lines.push(...qmkFunction(chords), "");
  lines.push(...qmkDupFunction(chords), "");

  fs.writeFileSync(qmkChordFile, lines.join("\n"));
};

updateReadme(fs.readFileSync(readmeFile, "utf-8").split("\n"));
updateQmk();

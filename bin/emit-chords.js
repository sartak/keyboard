#!/usr/bin/env node
const fs = require("fs");
const chordFiles = ["chords.json", "personal.json"];
const layoutFile = "layout.json";
const readmeFile = "README.md";
const qmkChordFile = "../qmk-config/chords.c";
const zmkChordFile = "../zmk-config/config/chords.keymap";

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
  const zmkKey = {};

  let z = 0;
  layers.Alpha.forEach((row) => {
    row.forEach((key) => {
      validKey[key] = true;
      zmkKey[key] = z++;
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

  const zmkLayers = Object.keys(layers).filter((l) => l !== "Function");
  return {
    layers: Object.keys(layers),
    validKey,
    qmkKey,
    zmkKey,
    zmkLayers,
  };
};

const { validKey, qmkKey, zmkKey, zmkLayers } = parseLayout(
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
            sentenceShift,
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

const dropAfter = (xs, re) => {
  const i = xs.findIndex((x) => x.match(re));
  return i === -1 ? xs : xs.slice(0, i);
};

const makeAlternates = ({ output, exact }) => {
  const alternates = [];
  for (let i = 0, max = output.length - 1; i < max; i++) {
    alternates.push([i, i + 1, output[i], output[i + 1]]);
  }
  const i = output.length - 1;
  alternates.push([i, 0, output[i], output[0]]);

  alternates.forEach((alt) => {
    let [, , from, to] = alt;
    const length = to.length;

    if (!exact) {
      from += " ";
      to += " ";
    }

    let f = from;

    while (f.length) {
      if (to.substr(0, f.length) === f) {
        break;
      }
      f = f.substring(0, f.length - 1);
    }

    let backspaces = from.length - f.length;
    let append = to.substring(f.length);

    if (!exact) {
      append = append.substring(0, append.length - 1);
    }

    alt.push(backspaces);
    alt.push(append);
    alt.push(exact);
    alt.push(length);
  });

  return alternates;
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

const readmeContent = (chordsAndCategories, original) => {
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

  return lines;
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
  let length = 0;

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
      length--;
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

    length++;
    buf.push(head);
  }

  emit();

  return [out, length];
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
    const [calls, length] = qmkOutput(chord);
    calls.forEach((line) => {
      cases.push(`      ${line}`);
    });
    cases.push(`      last_chord_length = ${length};`);
    cases.push("      break;");
  });

  const outro = `    default:
      space = false;
      break;
  }
  if (space) {
    tap_code(KC_SPC);
    last_chord_length++;
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
      makeAlternates(chord).forEach(
        ([i, j, _from, _to, bs, append, exact, length]) => {
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
          cases.push(`          last_chord_length = ${length};`);
          cases.push(`          next_chord_cycle = ${j};`);
          cases.push(`        break;`);
        }
      );
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
    last_chord_length++;
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

const qmkConfig = (chordsAndCategories) => {
  const lines = [];
  const chords = chordsAndCategories.filter(
    (chord) => typeof chord === "object"
  );

  lines.push(...qmkEnum(chords), "");
  lines.push(...qmkCombos(chords), "");
  lines.push(...qmkActions(chords), "");
  lines.push(...qmkFunction(chords), "");
  lines.push(...qmkDupFunction(chords), "");

  return lines;
};

const zmkPress = {
  " ": "&kp SPC",
  "!": "&kp EXCL",
  "'": "&kp APOS",
  ",": "&kp COMMA",
  ".": "&kp DOT",
  "/": "&kp SLASH",
  ":": "&kp COLON",
  ";": "&kp SEMI",
  "\b": "&kp BSPC",
  "<SKLS>": "&sk LSHFT",
  "?": "&kp QMARK",
  "¢": "&kp LA(N4)",
  "£": "&kp LA(N3)",
  "¥": "&kp INT_YEN",
  "°": "&kp LA(LS(N8))",
  "•": "&kp LA(N8)",
  "‽": "&kp QMARK",
  "€": "&kp LA(LS(N2))",
  "←": "&kp QMARK",
  "↑": "&kp QMARK",
  "→": "&kp QMARK",
  "↓": "&kp QMARK",
  "∞": "&kp LA(N5)",
  "⋯": "&kp QMARK",
  "✔": "&kp QMARK",
  "✗": "&kp QMARK",
  λ: "&kp QMARK",
};

"abcdefghijklmnopqrstuvwxyz".split("").forEach((alpha) => {
  const upper = alpha.toUpperCase();
  zmkPress[upper] = `&kp LS(${upper})`;
  zmkPress[alpha] = `&kp ${upper}`;
});
"0123456789".split("").forEach((digit) => {
  zmkPress[digit] = `&kp NUM_${digit}`;
});

const zmkPresses = (output) => {
  const presses = [];
  let o = output;
  while (o.length) {
    let key;
    const special = o.match(/^<\w+>/);
    if (special) {
      key = special[0];
    } else {
      key = o.substring(0, 1);
    }

    if (!(key in zmkPress)) {
      throw new Error(`Unable to handle zmkPress for '${key}'`);
    }

    o = o.substring(key.length);
    presses.push(zmkPress[key]);
  }

  return presses;
};

const zmkOutput = (chord) => {
  let content = chord.output[0];
  if (!chord.exact) {
    content += " ";
  }

  const presses = zmkPresses(content);
  const macro = `ch_${chord.identifier}`;

  return presses.length === 1 ? [presses[0], null] : [presses.join(" "), macro];
};

const zmkCombo = (chord) => chord.combo.map((key) => zmkKey[key]).join(" ");

const zmkCombos = (chords) => {
  const lines = [
    macro(
      "COMBO",
      ["name", "keypress", "keypos"],
      [
        "combo_##name {",
        "  timeout-ms = <60>;",
        "  bindings = <keypress>;",
        "  key-positions = <keypos>;",
        "};",
      ]
    ),
    "",
    macro(
      "LAYER_CHORD",
      ["name", "keypress", "keypos", "lays"],
      [
        "chord_##name {",
        "  timeout-ms = <60>;",
        "  bindings = <keypress>;",
        "  key-positions = <keypos>;",
        "  layers = <lays>;",
        "};",
      ]
    ),
    "",
    macro(
      "CHORD",
      ["name", "keypress", "keypos"],
      ["LAYER_CHORD(name, keypress, keypos, ALPHA SENTENCE)"]
    ),
    "",
    "/ {",
    "  combos {",
    '    compatible = "zmk,combos";',
  ];

  chords.forEach((chord) => {
    let macro = "CHORD";
    const output = zmkOutput(chord);
    const args = [
      `ch_${chord.identifier}`,
      output[1] ? `&${output[1]}` : output[0],
      zmkCombo(chord),
    ];

    if (chord.layers) {
      macro = "LAYER_CHORD";
      args.push(chord.layers.map((l) => l.toUpperCase()).join(" "));
    }

    lines.push(`    ${macro}(${args.join(", ")})`);
  });

  lines.push("  };", "};");

  return lines;
};

const zmkMacros = (chords) => {
  const lines = [
    macro(
      "MACRO",
      ["name", "keys"],
      [
        "name: name##_macro {",
        "label = #name;",
        'compatible = "zmk,behavior-macro";',
        "#binding-cells = <0>;",
        "tap-ms = <1>;",
        "wait-ms = <1>;",
        "bindings = <keys>;",
        "};",
      ]
    ),
    "",
    macro(
      "CHMAC",
      ["name", "keys"],
      [
        "name: name##_macro {",
        "  label = #name;",
        '  compatible = "zmk,behavior-macro";',
        "  #binding-cells = <0>;",
        "  tap-ms = <1>;",
        "  wait-ms = <1>;",
        "  bindings = <keys>, <&to SENTENCE>;",
        "};",
      ]
    ),
    "",
    "/ {",
    "  macros {",
  ];

  chords.forEach((chord) => {
    const [content, identifier] = zmkOutput(chord);
    if (!identifier) {
      return;
    }

    let macro = "CHMAC";
    const args = [identifier, content];

    if (chord.skipSentence) {
      macro = "MACRO";
    }

    lines.push(`    ${macro}(${args.join(", ")})`);
  });

  lines.push("  };", "};");

  return lines;
};

const zmkConfig = (chordsAndCategories) => {
  const lines = [];
  const chords = [];

  chordsAndCategories
    .filter((chord) => typeof chord === "object")
    .forEach((chord) => {
      if (chord.sentenceShift !== undefined) {
        chords.push({
          ...chord,
          identifier: `${chord.identifier}_s`,
          output: [
            `\b${chord.output[0]} ${chord.sentenceShift ? "<SKLS>" : ""}`,
          ],
          layers: ["Sentence"],
        });
        chords.push({
          ...chord,
          layers: zmkLayers,
        });
      } else {
        chords.push(chord);
      }
    });

  lines.push(...zmkCombos(chords), "");
  lines.push(...zmkMacros(chords), "");

  return lines;
};

const chordsAndCategories = parseChords(
  chordFiles.map((file) => JSON.parse(fs.readFileSync(file)))
);

fs.writeFileSync(
  readmeFile,
  readmeContent(
    chordsAndCategories,
    fs.readFileSync(readmeFile, "utf-8").split("\n")
  ).join("\n")
);
fs.writeFileSync(qmkChordFile, qmkConfig(chordsAndCategories).join("\n"));
fs.writeFileSync(zmkChordFile, zmkConfig(chordsAndCategories).join("\n"));

initializeKeymap(config.layout);
drawKeymap(config.layout, { layer: "Alpha" });

let { events } = test;
const { wordsList, replayData } = test.replay;
const { burstHistory, lastResult } = test.stats;

const makeLetter = (letter, idx) => {
  return `<span class="letter" data-index="${idx}" data-letter="${letter}">${letter}</span>`;
};

const wordsTags = wordsList
  .map((word, i) => {
    if (burstHistory[i] === undefined) {
      return;
    }
    return `<div class="word" data-index="${i}">${word
      .split("")
      .map((l, i) => makeLetter(l, i))
      .join("")}</div>`;
  })
  .filter(Boolean);

const wordsListNode = document.getElementById("wordsList");
wordsListNode.innerHTML = wordsTags.join(" ");

const makeRows = () => {
  const {
    width,
    height,
    top: parentTop,
  } = wordsListNode.getBoundingClientRect();
  wordsListNode.style.width = `${width}px`;
  wordsListNode.style.height = `${height}px`;

  const rows = {};
  wordsListNode.querySelectorAll(".word").forEach((node) => {
    const { top } = node.getBoundingClientRect();
    if (!rows[top]) {
      rows[top] = [];
    }
    rows[top].push(node);
  });

  const rowTags = [];
  const wordNodes = [];
  Object.entries(rows).forEach(([top, nodes], i) => {
    wordNodes.push(nodes);
    rowTags.push(
      `<div class="row" style="top: ${
        top - parentTop
      }px" data-index="${i}"></div>`
    );
  });

  wordsListNode.innerHTML = rowTags.join("");
  wordsListNode.querySelectorAll(".row").forEach((rowNode, i) => {
    wordNodes[i].forEach((wordNode, w) => {
      if (w > 0) {
        rowNode.appendChild(document.createTextNode(" "));
      }
      rowNode.appendChild(wordNode);
    });
  });
};
makeRows();

const outputForEvent = (event, committed, current) => {
  let changed = false;

  if (event.type !== "typed") {
    return changed;
  }

  if (event.mods.alt && event.output === "\b") {
    while (current.length && current[current.length - 1] === " ") {
      if (current.length) {
        changed = true;
      }
      current.pop();
    }
    while (current.length && current[current.length - 1] !== " ") {
      if (current.length) {
        changed = true;
      }
      current.pop();
    }
    return changed;
  }

  if (event.mods.ctrl || event.mods.alt || event.mods.gui) {
    return changed;
  }

  for (const char of event.output.split("")) {
    if (char === "\b") {
      if (current.length) {
        changed = true;
      }
      current.pop();
    } else {
      if (char === " ") {
        const words = current
          .join("")
          .split(" ")
          .filter((w) => w.length);
        const i = committed.length + words.length - 1;
        if (words[words.length - 1] === wordsList[i]) {
          committed.push(...words);
          current.splice(0, current.length);
          changed = true;
        } else {
          current.push(char);
          changed = true;
        }
      } else {
        current.push(char);
        changed = true;
      }
    }
  }

  return changed;
};

const outputForEvents = (events, limit = 0) => {
  const committed = [];
  const current = [];
  let sawText = false;
  let backspacedAll = false;

  for (const event of events) {
    const changed = outputForEvent(event, committed, current);
    if (committed.length || current.length) {
      sawText = true;
    }
    if (sawText && committed.length === 0 && current.length === 0) {
      backspacedAll = true;
    }

    if (changed && limit && committed.length >= limit) {
      return [committed, current, backspacedAll];
    }
  }

  return [committed, current];
};

const outputForWords = (words, nullOnError) => {
  return words
    .filter(({ input }) => input !== undefined)
    .map(({ text, letters }) => {
      if (nullOnError) {
        for (const [, classes] of letters) {
          const c = classes.filter(
            (c) =>
              c !== "extraCorrected" && c !== "incorrectExtra" && c !== "extra"
          );
          if (!c.length) {
            return null;
          }
          if (c.length !== 1) {
            alert(`Got multiple letter classes: ${c.join(", ")}`);
            return null;
          }
          if (c[0] !== "correct" && c[0] !== "corrected") {
            return null;
          }
        }
      }
      return text;
    });
};

const dropIrrelevantEvents = (events) => {
  const expected = outputForWords(test.words.slice(0, 9), true);
  const relevantEvents = events.filter(({ type }) => type === "typed");
  let lastEvent;
  while (true) {
    const [committed, current, backspacedAll] = outputForEvents(
      relevantEvents,
      expected.length
    );
    if (!backspacedAll) {
      const got = committed.slice(0, expected.length);
      let ok = true;
      for (let i = 0, len = expected.length; i < len; i++) {
        if (expected[i] !== null && got[i] !== expected[i]) {
          ok = false;
          break;
        }
      }

      if (ok) {
        while (true) {
          const changed = outputForEvent(relevantEvents[0], committed, current);
          if (changed) {
            break;
          }
          lastEvent = relevantEvents.shift();
          if (!relevantEvents.length) {
            alert("Ran out of events trying to scan past unrelated events");
            throw new Error();
          }
        }

        break;
      }
    }

    lastEvent = relevantEvents.shift();
    if (!relevantEvents.length) {
      alert("Ran out of events trying to find the right prefix");
      throw new Error();
    }
  }

  const startTime = lastEvent ? lastEvent.time : relevantEvents[0].time;
  const graceTime = relevantEvents[0].time - 500;
  const endTime = relevantEvents[relevantEvents.length - 1].time;
  return events.filter(
    ({ time }) => time > startTime && time >= graceTime && time <= endTime
  );
};

events = dropIrrelevantEvents(events);

let lastTime = events[0].time;
const committed = [];
const current = [];
let caretCommitted = 0;
let caretWords = [];
let caretWord = 0;
let caretLetter = 0;
const caret = document.querySelector("#caret");

const commitWord = (idx) => {
  const wordNode = wordsListNode.querySelector(`.word[data-index="${idx}"]`);
  if (!wordNode || wordNode.classList.contains("committed")) {
    return;
  }

  if (wordNode.querySelector(".incorrect")) {
    wordNode.classList.add("incorrect");
  } else if (wordNode.querySelector(".was-incorrect")) {
    wordNode.classList.add("was-incorrect");
  } else {
    wordNode.classList.add("perfect");
  }

  wordNode.classList.add("committed");
};

const positionCaret = (wordIdx = caretWord, letterIdx = caretLetter) => {
  const wordNode = wordsListNode.querySelector(
    `.word[data-index="${wordIdx}"]`
  );

  if (!wordNode) {
    return;
  }

  const { top: wordTop, left: wordLeft } = wordNode.getBoundingClientRect();
  const { top: containerTop, left: containerLeft } =
    wordNode.parentNode.parentNode.getBoundingClientRect();
  const { width: letterWidth } = wordNode.childNodes[0].getBoundingClientRect();
  const newLeft = wordLeft - containerLeft + letterIdx * letterWidth;
  const newTop = wordTop - containerTop;

  let newLine = caret.style.top !== `${newTop}px`;

  caret.classList.add("instant");

  if (newLine) {
    caret.style.left = `${newLeft}px`;
  } else {
    caret.style.left = caret.style.left;
  }
  caret.style.top = `${newTop}px`;

  caret.offsetHeight;
  caret.classList.remove("instant");

  if (!newLine) {
    caret.style.left = `${newLeft}px`;
  }
};

positionCaret();

const drawEvent = (event) => {
  handleEvent(event);
  const changed = outputForEvent(event, committed, current);

  if (!changed) {
    return;
  }
  const currentWords = current.join("").split(" ");
  const allWords = [...committed, ...currentWords];
  const nextWord = allWords.length - 1;
  const nextLetter = currentWords[currentWords.length - 1].length;

  for (let i = caretCommitted; i < committed.length; i++) {
    commitWord(i);
  }

  if (
    nextWord > caretWord ||
    (nextWord === caretWord && nextLetter > caretLetter)
  ) {
    let i = caretWord;
    let j = caretLetter;

    while (i < nextWord || (i === nextWord && j < nextLetter)) {
      const letter = allWords[i].substr(j, 1);
      if (letter.length) {
        const wordNode = wordsListNode.querySelector(
          `.word[data-index="${i}"]`
        );
        if (wordNode) {
          const letterNode = wordNode.querySelector(
            `.letter[data-index="${j}"]`
          );
          if (letterNode) {
            if (letterNode.dataset.letter === letter) {
              letterNode.classList.add("correct");
            } else {
              letterNode.classList.add("incorrect");

              if (!letterNode.classList.contains("extra")) {
                let typoNode = letterNode.querySelector(".typo");
                if (!typoNode) {
                  typoNode = document.createElement("span");
                  typoNode.classList.add("typo");
                  letterNode.appendChild(typoNode);
                }

                typoNode.innerHTML = letter;
              }
            }
          } else {
            const newNode = document.createElement("span");
            newNode.classList.add("letter", "extra", "incorrect");
            newNode.dataset.index = j;
            newNode.innerHTML = letter;
            wordNode.appendChild(newNode);
          }
        }
      }

      j++;
      if (j >= allWords[i].length) {
        i++;
        j = 0;
      }
    }
  } else {
    let i = caretWord;
    let j = caretLetter;

    while (i > nextWord || (i === nextWord && j > nextLetter)) {
      j--;
      if (j === -1) {
        i--;
        j = caretWords[i].length;
      }

      const wordNode = wordsListNode.querySelector(`.word[data-index="${i}"]`);
      if (wordNode) {
        const letterNode = wordNode.querySelector(`.letter[data-index="${j}"]`);
        if (letterNode) {
          if (letterNode.classList.contains("extra")) {
            wordNode.removeChild(letterNode);
          } else {
            if (letterNode.classList.contains("incorrect")) {
              letterNode.classList.add("was-incorrect");
            }
            if (letterNode.classList.contains("correct")) {
              letterNode.classList.add("was-correct");
            }
            letterNode.classList.remove("correct", "incorrect");
          }
        }
      }
    }
  }

  positionCaret(nextWord, nextLetter);
  caretWord = nextWord;
  caretLetter = nextLetter;
  caretCommitted = committed.length;
  caretWords = allWords;
};

const finishDrawing = () => {
  const currentWords = current.join("").split(" ");
  const allWords = [...committed, ...currentWords];
  allWords.forEach((_, i) => {
    commitWord(i);
  });
  resetKeymap(config.layout);
  caret.classList.add("pulse");
};

const replayEvent = () => {
  if (!events.length) {
    setTimeout(() => finishDrawing(), 200);
    return;
  }

  const event = events.shift();

  setTimeout(() => {
    lastTime = event.time;
    drawEvent(event);
    replayEvent();
  }, event.time - lastTime);
};

setTimeout(() => {
  caret.classList.remove("pulse");
  replayEvent();
}, 1000);

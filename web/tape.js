let tape;
let tapeLines;
let tapeEnd;

const initializeTape = (layout) => {
  tape = document.querySelector(".tape");
  tapeLines = tape.querySelector(".lines");
  tapeEnd = tape.querySelector(".end");
};

const clearTape = () => {
  tapeLines.innerHTML = "";
};

const appendLine = (word) => {
  const line = document.createElement("div");
  line.innerText = word;
  tapeLines.appendChild(line);
  tapeEnd.scrollIntoView({ behavior: "smooth", block: "end" });
};

const tapeHandleEvent = (event) => {
  switch (event.type) {
    case "word":
      appendLine(event.word);
      break;
  }
};

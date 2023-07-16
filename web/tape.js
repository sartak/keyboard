let tape;
let tapeLines;
let tapeEnd;
let tapeClearer;

const initializeTape = (layout) => {
  tape = document.querySelector(".tape");
  tapeLines = tape.querySelector(".lines");
  tapeEnd = tape.querySelector(".end");

  window.removeEventListener("message", tapeMessage);
  window.addEventListener("message", tapeMessage);
};

const tapeMessage = (event) => {
  if (event.data === "prepare-test") {
    clearTape();
  }
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

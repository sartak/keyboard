const initializeKeymap = (layout) => {
  const rootStyle = document.querySelector(":root").style;
  Object.entries(layout.board).forEach(([key, value]) => {
    rootStyle.setProperty(`--${key}`, value);
  });

  const keymap = document.querySelector(".keymap");
  keymap.querySelectorAll(".key").forEach((el, i) => {
    let key = layout.keys[i];
    el.setAttribute("data-index", i);
    Object.entries(key).forEach(([layer, value]) => {
      el.setAttribute(`data-${layer}`, value);
    });
  });
};

const drawKeymap = (layout, { layer, shift, ctrl, alt, gui, settings }) => {
  const keymap = document.querySelector(".keymap");
  keymap.setAttribute("data-layer", layer);
  keymap.setAttribute("data-shift", shift ? "true" : "false");
  keymap.setAttribute("data-ctrl", ctrl ? "true" : "false");
  keymap.setAttribute("data-alt", alt ? "true" : "false");
  keymap.setAttribute("data-gui", gui ? "true" : "false");

  Object.entries(settings).forEach(([key, value]) => {
    keymap.setAttribute(`data-setting-${key}`, value);
  });

  let layers = [layer];
  [
    [shift, "Shift"],
    [ctrl, "Ctrl"],
    [alt, "Alt"],
    [gui, "Gui"],
  ].forEach(([enabled, mod]) => {
    if (enabled) {
      layers.unshift(...layers.map((layer) => `${layer}-${mod}`));
    }
  });
  layers.push("Alpha");

  keymap.querySelectorAll(".key").forEach((el, i) => {
    let label = null;
    layers.forEach((layer) => {
      if (label === null && layer in layout.keys[i]) {
        label = layout.keys[i][layer];
      }
    });

    if (label in layout.labels) {
      label = layout.labels[label][0];
    }

    if (label === "") {
      label = " ";
    }

    const letter = el.querySelector(".letter");
    letter.innerHTML = label;
    letter.setAttribute("data-length", label.length);
  });
};

const highlightKey = (index, type) => {
  const el = document.querySelector(`.keymap .key[data-index="${index}"]`);
  if (el) {
    if (type === null) {
      el.removeAttribute("data-highlight");
    } else {
      el.setAttribute("data-highlight", type);
    }
  } else {
    alert(`Unable to highlightKey ${index}`);
  }
};

const clearHighlights = () => {
  const keymap = document.querySelector(".keymap");
  keymap.querySelectorAll(".key[data-highlight]").forEach((el) => {
    el.removeAttribute("data-highlight");
  });
};

const setKeymapStatic = (static = true) => {
  const keymap = document.querySelector(".keymap");
  if (static) {
    keymap.classList.add("static");
  } else {
    keymap.classList.remove("static");
  }
};

const resetKeymap = (layout) => {
  drawKeymap(layout, { layer: "Alpha" });
  clearHighlights();
};

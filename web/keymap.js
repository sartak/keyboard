const drawKeymap = ({ layer, shift, ctrl, alt, gui }) => {
  const rootStyle = document.querySelector(":root").style;
  Object.entries(layout.board).forEach(([key, value]) => {
    rootStyle.setProperty(`--${key}`, value);
  });

  const keymap = document.querySelector(".keymap");
  keymap.setAttribute("data-layer", layer);
  keymap.setAttribute("data-shift", shift ? "true" : "false");
  keymap.setAttribute("data-ctrl", ctrl ? "true" : "false");
  keymap.setAttribute("data-alt", alt ? "true" : "false");
  keymap.setAttribute("data-gui", gui ? "true" : "false");

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
    let key = layout.keys[i];
    Object.entries(key).forEach(([layer, value]) => {
      el.setAttribute(`data-${layer}`, value);
    });

    let label = null;
    layers.forEach((layer) => {
      if (label === null && layer in layout.keys[i]) {
        label = layout.keys[i][layer];
      }
    });

    if (label in layout.labels) {
      label = layout.labels[label];
    }

    if (label === "") {
      label = " ";
    }

    el.querySelector(".letter").innerHTML = label;
  });
};

const highlightKey = (key, type) => {
  const el = document.querySelector(`.keymap .key[data-Alpha="${key}"]`);
  if (el) {
    el.classList.add(type);
  } else {
    alert(`Unable to highlightKey ${key}`);
  }
};

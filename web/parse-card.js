const parseInput = (layout, inputs) => {
  return inputs
    .split("-")
    .map((i) => i.split(" ").filter((i) => i !== ""))
    .map((input) => {
      let layer = "Alpha";
      let shift = false;
      let ctrl = false;
      let alt = false;
      let gui = false;
      const downKeys = [];
      const holdKeys = [];

      let isChord = false;
      let hold = false;

      input.forEach((key) => {
        switch (key) {
          case "Shift":
            shift = true;
            holdKeys.push(layout.keyPosition[layout.modKeys.Shft]);
            break;
          case "Ctrl":
            ctrl = true;
            holdKeys.push(layout.keyPosition[layout.modKeys.Ctrl]);
            break;
          case "Alt":
            alt = true;
            holdKeys.push(layout.keyPosition[layout.modKeys.Alt]);
            break;
          case "Gui":
            gui = true;
            holdKeys.push(layout.keyPosition[layout.modKeys.Gui]);
            break;
          case "Hold":
            hold = true;
            break;
          default:
            if (layout.layerKeys[key]) {
              const k = layout.modKeys[key];
              if (Array.isArray(k)) {
                holdKeys.push(...k.map((k) => layout.keyPosition[k]));
              } else {
                holdKeys.push(layout.keyPosition[k]);
              }
              layer = layout.layerKeys[key];
            } else {
              if (downKeys.length) {
                isChord = true;
              }
              downKeys.push(layout.keyPosition[key]);
            }
        }
      });

      if (hold) {
        holdKeys.push(...downKeys.splice(0, downKeys.length));
      }

      return { layer, shift, ctrl, alt, gui, downKeys, holdKeys, isChord };
    });
};

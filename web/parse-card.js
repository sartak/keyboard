const parseInput = (layout, input) => {
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
        holdKeys.push(layout.modKeys.Shft);
        break;
      case "Ctrl":
        ctrl = true;
        holdKeys.push(layout.modKeys.Ctrl);
        break;
      case "Alt":
        alt = true;
        holdKeys.push(layout.modKeys.Alt);
        break;
      case "Gui":
        gui = true;
        holdKeys.push(layout.modKeys.Gui);
        break;
      case "Hold":
        hold = true;
        break;
      default:
        downKeys.push(key);
    }
  });

  return { layer, shift, ctrl, alt, gui, downKeys, holdKeys, isChord };
};

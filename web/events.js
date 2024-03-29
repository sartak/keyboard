let state = { layer: "Alpha", settings: {} };

const redrawKeymap = () => drawKeymap(config.layout, state);

const handleEvent = (event) => {
  try {
    switch (event.type) {
      case "down":
      case "hold":
        highlightKey(event.index, event.type);
        break;
      case "up":
        highlightKey(event.index, null);
        break;
      case "all-up":
        clearHighlights();
        break;
      case "chord":
        event.indexes.forEach((index) => {
          highlightKey(index, `chord-${event.action}`);
        });
        break;
      case "indeterminate-chord":
        event.indexes.forEach((index) => {
          highlightKey(index, "chord-tap");
        });
        break;
      case "mod":
        state[event.mod] = event.down;
        redrawKeymap();
        break;
      case "layer":
        state.layer = event.layer;
        redrawKeymap();
        break;
      case "settings":
        state.settings = event.settings;
        redrawKeymap();
        break;
      case "setting":
        state.settings[event.key] = event.value;
        redrawKeymap();
        break;
    }
  } catch (e) {
    console.error(e);
  }
};

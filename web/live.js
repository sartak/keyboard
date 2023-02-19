const connect = () => {
  const keymap = document.querySelector(".keymap");
  let config;
  let state;

  const configJson = localStorage.getItem("config");
  if (configJson) {
    config = JSON.parse(configJson);
    initializeKeymap(config.layout);
    drawKeymap(config.layout, { layer: "Alpha" });
  }

  const redrawKeymap = () => drawKeymap(config.layout, state);

  longPoll("/events", (events, connected) => {
    if (connected === true) {
      keymap.classList.remove("isolated");
    } else if (connected === false) {
      keymap.classList.add("isolated");
    }

    events.forEach((event) => {
      try {
        switch (event.type) {
          case "initialize":
            config = event.config;
            state = event.state;
            initializeKeymap(config.layout);
            drawKeymap(config.layout, state);
            localStorage.setItem("config", JSON.stringify(config));
            break;
          case "down":
          case "hold":
            highlightKey(event.index, event.type);
            break;
          case "up":
            highlightKey(event.index, null);
            break;
          case "mod":
            state[event.mod] = event.down;
            redrawKeymap();
            break;
          case "layer":
            state.layer = event.layer;
            redrawKeymap();
            break;
          case "close":
            keymap.classList.add("disconnected");
            break;
          case "connected":
            keymap.classList.remove("disconnected");
            break;
          default:
            console.log(event);
        }
      } catch (e) {
        console.error(e);
      }
    });
  });
};

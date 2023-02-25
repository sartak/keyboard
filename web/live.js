let config;

const connect = () => {
  const keymap = document.querySelector(".keymap");

  const configJson = localStorage.getItem("config");
  if (configJson) {
    config = JSON.parse(configJson);
    initializeKeymap(config.layout);
    drawKeymap(config.layout, { layer: "Alpha" });
  }

  longPoll("/events", (events, connected) => {
    if (connected === true) {
      keymap.classList.remove("isolated");
    } else if (connected === false) {
      keymap.classList.add("isolated");
      if (config) {
        resetKeymap(config.layout);
      }
    }

    events.forEach((event) => {
      switch (event.type) {
        case "initialize":
          config = event.config;
          state = event.state;
          initializeKeymap(config.layout);
          drawKeymap(config.layout, state);
          localStorage.setItem("config", JSON.stringify(config));
          break;
        case "close":
          keymap.classList.add("disconnected");
          resetKeymap(config.layout);
          break;
        case "connected":
          keymap.classList.remove("disconnected");
          break;
        default:
          handleEvent(event);
          break;
      }
    });
  });
};

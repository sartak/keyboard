const connect = () => {
  let config;
  let state;

  longPoll("/events", (events, connected) => {
    if (connected === true) {
      console.log("Connected");
    } else if (connected === false) {
      console.log("Disconnected");
    }

    events.forEach((event) => {
      try {
        switch (event.type) {
          case "initialize":
            config = event.config;
            state = event.state;
            initializeKeymap(config.layout);
            drawKeymap(config.layout, state);
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

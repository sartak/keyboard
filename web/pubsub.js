const longPoll = (url, callback, reconnect = true) => {
  callback([], false);

  let canceled = false;
  const controller = new AbortController();
  const { signal } = controller;

  function streamEvents() {
    fetch(url, { signal })
      .then((response) => {
        if (!response.ok) {
          const err = new Error(
            `Got response code ${response.status} from ${url}`
          );
          callback([], false, err);

          if (reconnect) {
            setTimeout(() => {
              streamEvents();
            }, 1000);
          }
          return;
        }

        callback([], true);
        return readNewlineDelimitedJSON(
          response,
          (newEvents, reader) => {
            if (canceled) {
              reader.cancel();
              return;
            }

            if (newEvents.length) {
              callback(newEvents);
            }
          },
          (reader) => {
            if (canceled) {
              reader.cancel();
              return;
            }

            if (reconnect) {
              console.log(`Disconnected from ${url}; reconnecting in 1s…`);
            } else {
              console.log(`Disconnected from ${url}; not reconnecting`);
            }

            callback([], false);

            if (reconnect) {
              setTimeout(() => {
                streamEvents();
              }, 1000);
            }
          }
        );
      })
      .catch((err) => {
        if (canceled) {
          return;
        }

        if (reconnect) {
          console.log(`Failed to connect to ${url}; retrying in 1s…`);
        } else {
          console.log(`Failed to connect to ${url}; not reconnecting`);
        }

        callback([], false, err);

        if (reconnect) {
          setTimeout(() => {
            if (!canceled) {
              streamEvents();
            }
          }, 1000);
        }
      });
  }

  streamEvents();

  return () => {
    canceled = true;
    controller.abort();
  };
};

function readNewlineDelimitedJSON(response, resultCallback, doneCallback) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let partialResult = "";
  const completeResults = [];

  function readChunk() {
    return reader.read().then((chunk) => {
      partialResult += decoder.decode(chunk.value || new Uint8Array(), {
        stream: !chunk.done,
      });
      completeResults.push(...partialResult.split("\n"));

      if (!chunk.done) {
        partialResult = completeResults.pop();
      }

      const events = completeResults
        .filter((res) => res.length > 1)
        .map(JSON.parse);
      if (events.length) {
        resultCallback(events, reader);
      }
      completeResults.length = 0;

      if (chunk.done) {
        doneCallback(reader);
        return;
      }

      return readChunk();
    });
  }

  return readChunk();
}

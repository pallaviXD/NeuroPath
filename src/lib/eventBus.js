const listeners = new Set();

let channel = null;
if (typeof BroadcastChannel !== "undefined") {
  channel = new BroadcastChannel("neuropath-live");
  channel.onmessage = (event) => {
    if (event.data?.type === "intervention") {
      listeners.forEach((cb) => cb(event.data.payload));
    }
  };
}

export function subscribeInterventions(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function emitIntervention(logEntry) {
  listeners.forEach((cb) => cb(logEntry));
  channel?.postMessage({ type: "intervention", payload: logEntry });
}

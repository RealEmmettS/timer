let intervalId = null;

self.onmessage = (e) => {
  const { action, interval = 50 } = e.data; // Default to 50ms for smooth UI

  if (action === 'START') {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      self.postMessage('TICK');
    }, interval);
  } else if (action === 'STOP') {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};


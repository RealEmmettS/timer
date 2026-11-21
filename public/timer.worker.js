let timeout;

self.onmessage = ({ data: { action, interval = 50, origin = Date.now() } }) => {
  clearTimeout(timeout);
  if (action !== 'START' || interval <= 0) return;

  function tick() {
    self.postMessage('TICK');
    // Schedule against the original clock so throttled or late ticks never accumulate drift.
    timeout = setTimeout(tick, interval - (Math.max(0, Date.now() - origin) % interval));
  }
  tick();
};

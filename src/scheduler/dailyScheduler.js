function msUntilNextRun(hour, minute) {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

function scheduleDaily({ hour, minute, task, onScheduled }) {
  const firstDelay = msUntilNextRun(hour, minute);
  const firstRunAt = new Date(Date.now() + firstDelay);

  if (typeof onScheduled === 'function') onScheduled(firstRunAt);

  const timeoutId = setTimeout(async () => {
    await task();
    setInterval(task, 24 * 60 * 60 * 1000);
  }, firstDelay);

  return { timeoutId, firstRunAt };
}

module.exports = { scheduleDaily };

const MUTEX = {
  eat: ['drink', 'sleep', 'climb'],
  drink: ['eat', 'sleep', 'climb'],
  sleep: ['eat', 'drink', 'climb'],
  climb: ['eat', 'drink', 'sleep', 'roll']
};

const LOOK_COOLDOWN_MS = 8000;

const PRIORITY = {
  intercept: 100,
  story: 80,
  need: 60,
  player: 40,
  idle: 10
};

function canEnter(current, next) {
  const blocked = MUTEX[current] || [];
  if (blocked.indexOf(next) >= 0) return false;
  if (current === 'climb' && (next === 'drink' || next === 'roll')) return false;
  return true;
}

function lookAllowed(lastLookAt, now) {
  if (!lastLookAt) return true;
  return now - lastLookAt >= LOOK_COOLDOWN_MS;
}

function nextIdle(rand) {
  const idle = ['idle_stand', 'idle_sit', 'idle_scratch', 'idle_yawn'];
  return idle[Math.floor(rand() * idle.length)];
}

module.exports = { MUTEX, LOOK_COOLDOWN_MS, PRIORITY, canEnter, lookAllowed, nextIdle };

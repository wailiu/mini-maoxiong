const { test } = require('node:test');
const assert = require('node:assert/strict');
const { canEnter, lookAllowed, LOOK_COOLDOWN_MS } = require('../js/systems/panda');

test('eat drink sleep climb are mutually exclusive', () => {
  assert.equal(canEnter('eat', 'drink'), false);
  assert.equal(canEnter('climb', 'drink'), false);
  assert.equal(canEnter('climb', 'roll'), false);
  assert.equal(canEnter('idle_stand', 'eat'), true);
});

test('look has an 8 second cooldown', () => {
  const t0 = 1_000_000;
  assert.equal(lookAllowed(t0, t0 + 1000), false);
  assert.equal(lookAllowed(t0, t0 + LOOK_COOLDOWN_MS), true);
});

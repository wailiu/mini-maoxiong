const { test } = require('node:test');
const assert = require('node:assert/strict');
const { POOLS, assertPoolRates } = require('../js/config/discovery');
const { publicRates, draw, canExchange } = require('../js/systems/discovery');

test('every pool sums to 100%', () => {
  assert.doesNotThrow(() => assertPoolRates());
  Object.keys(POOLS).forEach((id) => {
    const sum = Object.values(POOLS[id].rates).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9);
  });
});

test('owned pool hides species tier and renormalizes', () => {
  const shown = publicRates('exotic', ['gecko']);
  assert.equal(shown.speciesHidden, true);
  assert.equal(shown.rates.species, undefined);
  const sum = Object.values(shown.rates).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
});

test('every draw grants one observation badge', () => {
  const rng = () => 0.99;
  const r = draw('exotic', [], rng);
  assert.equal(r.ok, true);
  assert.equal(r.badges, 1);
});

test('exchange costs 10 / 30 / 50 and rejects shortfall', () => {
  assert.equal(canExchange('exotic', 9, []).ok, false);
  assert.deepEqual(canExchange('exotic', 10, []), { ok: true, cost: 10, grant: 'gecko' });
  assert.equal(canExchange('protected', 29, []).ok, false);
  assert.equal(canExchange('protected', 30, []).grant, 'panda');
  assert.equal(canExchange('extinct', 50, []).grant, 'mammoth');
});

test('exchange refuses when already owned', () => {
  const r = canExchange('exotic', 99, ['gecko']);
  assert.equal(r.ok, false);
  assert.equal(r.code, 'owned');
});

test('batch draw distribution stays near configured rates', () => {
  let seed = 1;
  const rng = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const counts = { species: 0, fragment: 0, decoration: 0, material: 0 };
  const n = 20000;
  for (let i = 0; i < n; i++) {
    const r = draw('exotic', [], rng);
    counts[r.tier] += 1;
  }
  const rates = POOLS.exotic.rates;
  Object.keys(rates).forEach((k) => {
    const got = counts[k] / n;
    assert.ok(Math.abs(got - rates[k]) < 0.03, k + ' ' + got);
  });
});

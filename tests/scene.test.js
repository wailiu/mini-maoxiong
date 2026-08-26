const { test } = require('node:test');
const assert = require('node:assert/strict');
const { canPlaceAnimal, canPlaceFurniture } = require('../js/systems/scene');

test('panda cannot enter private home and redirects to reserve', () => {
  const r = canPlaceAnimal('panda', 'home');
  assert.equal(r.ok, false);
  assert.equal(r.redirect, 'reserve');
  assert.equal(r.code, 'redirect_reserve');
});

test('gecko cannot enter apartment', () => {
  const r = canPlaceAnimal('gecko', 'home');
  assert.equal(r.ok, false);
  assert.equal(r.redirect, 'terrarium');
});

test('mammoth mismatch uses restoration copy', () => {
  const r = canPlaceAnimal('mammoth', 'home');
  assert.equal(r.ok, false);
  assert.match(r.message, /复原模型不适配/);
});

test('cat can stay in apartment', () => {
  assert.equal(canPlaceAnimal('cat', 'home').ok, true);
});

test('home furniture mismatch is a mild hint, not a hard block', () => {
  const r = canPlaceFurniture('heat_mat', 'home');
  assert.equal(r.ok, true);
  assert.equal(r.hint, true);
});

test('bamboo ball is valid in reserve', () => {
  assert.equal(canPlaceFurniture('bamboo_ball', 'reserve').ok, true);
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { evaluateFeed } = require('../js/systems/food');

test('forbidden food is intercepted and never swallowed', () => {
  const r = evaluateFeed('cat', 'chocolate');
  assert.equal(r.ok, false);
  assert.equal(r.swallowed, false);
  assert.equal(r.intimacy, 0);
});

test('panda wrong food is intercepted without eat-and-spit', () => {
  const r = evaluateFeed('panda', 'cat_kibble');
  assert.equal(r.ok, false);
  assert.equal(r.swallowed, false);
  assert.match(r.message, /不会吃下/);
});

test('recommended bamboo is allowed for panda', () => {
  const r = evaluateFeed('panda', 'bamboo_culm');
  assert.equal(r.ok, true);
  assert.equal(r.swallowed, true);
  assert.equal(r.intimacy, 10);
});

test('occasional food does not apply permanent intimacy penalty', () => {
  const r = evaluateFeed('cat', 'cat_treat');
  assert.equal(r.ok, true);
  assert.ok(r.intimacy >= 0);
  assert.equal(r.code, 'occasional');
});

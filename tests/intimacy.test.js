const { test } = require('node:test');
const assert = require('node:assert/strict');
const { grantIntimacy, stageOf, DAILY_CAP } = require('../js/systems/intimacy');

test('daily intimacy cap is 50', () => {
  const r = grantIntimacy(0, 40, 20);
  assert.equal(r.granted, 10);
  assert.equal(r.dailyGained, DAILY_CAP);
  assert.equal(r.capped, true);
});

test('stage boundaries match the design table', () => {
  assert.equal(stageOf(0).name, '初识');
  assert.equal(stageOf(99).name, '初识');
  assert.equal(stageOf(100).name, '熟悉');
  assert.equal(stageOf(300).name, '信任');
  assert.equal(stageOf(600).name, '默契');
  assert.equal(stageOf(1000).name, '档案完成');
});

test('intimacy cannot exceed 1000', () => {
  const r = grantIntimacy(990, 0, 50);
  assert.equal(r.next, 1000);
  assert.equal(r.completed, true);
});

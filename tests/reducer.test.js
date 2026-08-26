const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createInitialState } = require('../js/systems/state');
const { reduce } = require('../js/systems/reducer');
const { addDays } = require('../js/systems/clock');

const T0 = Date.parse('2026-08-26T04:00:00+08:00');

function play(actions, t) {
  let state = createInitialState(t || T0);
  let events = [];
  actions.forEach((a) => {
    const r = reduce(state, a, t || T0);
    state = r.state;
    events = events.concat(r.events);
  });
  return { state, events };
}

function onboard() {
  return play([
    { type: 'ACCEPT_PRIVACY' },
    { type: 'CHOOSE_STARTER', speciesId: 'cat' }
  ]);
}

test('companion can water immediately after feeding', () => {
  let { state } = play([
    { type: 'ACCEPT_PRIVACY' },
    { type: 'CHOOSE_STARTER', speciesId: 'cat' },
    { type: 'FEED', foodId: 'cat_kibble' }
  ]);
  assert.equal(state.animals.cat.pose, 'eat');
  const r = reduce(state, { type: 'FEED', foodId: 'water' }, T0);
  assert.equal(r.events[0].type, 'care');
  assert.equal(r.state.animals.cat.pose, 'drink');
});

test('first session can adopt cat, feed, water, play, furnish', () => {
  const { state } = play([
    { type: 'ACCEPT_PRIVACY' },
    { type: 'CHOOSE_STARTER', speciesId: 'cat' },
    { type: 'FEED', foodId: 'cat_kibble' },
    { type: 'FEED', foodId: 'water' },
    { type: 'PLAY' },
    { type: 'PLACE_FURNITURE', furnitureId: 'cushion' }
  ]);
  assert.equal(state.animals.cat.owned, true);
  assert.ok(state.animals.cat.intimacy > 0);
  assert.ok(state.scenes.home.furniture.indexOf('cushion') >= 0);
});

test('blocked food does not change pose to eat', () => {
  let { state } = onboard();
  const before = state.animals.cat.pose;
  const r = reduce(state, { type: 'FEED', foodId: 'chocolate' }, T0);
  assert.equal(r.events[0].swallowed, false);
  assert.equal(r.state.animals.cat.pose, before);
  assert.equal(r.state.animals.cat.intimacy, state.animals.cat.intimacy);
});

test('panda cannot be moved into the apartment', () => {
  let { state } = onboard();
  state = reduce(state, { type: 'DEBUG_GRANT', allow: true, own: ['panda'], intimacy: 10 }, T0).state;
  const r = reduce(state, { type: 'MOVE_ANIMAL_TO_SCENE', speciesId: 'panda', sceneId: 'home' }, T0);
  assert.equal(r.events[0].type, 'intercept');
  assert.equal(r.state.activeSceneId, 'reserve');
});

test('draw consumes one ticket and always adds one badge', () => {
  let { state } = onboard();
  state.resources.researchTickets = 3;
  const r = reduce(state, { type: 'DRAW', poolId: 'exotic', rng: () => 0.5 }, T0);
  assert.equal(r.state.resources.researchTickets, 2);
  assert.equal(r.state.resources.observationBadges, 1);
  assert.equal(r.state.discoveryLog.length, 1);
});

test('exchange gecko requires course and exact 10 badges', () => {
  let { state } = onboard();
  state.resources.observationBadges = 10;
  const blocked = reduce(state, { type: 'EXCHANGE', poolId: 'exotic' }, T0);
  assert.match(blocked.events[0].message, /课程/);
  state = reduce(state, { type: 'COMPLETE_COURSE', courseId: 'gecko_course' }, T0).state;
  const ok = reduce(state, { type: 'EXCHANGE', poolId: 'exotic' }, T0);
  assert.equal(ok.state.animals.gecko.owned, true);
  assert.equal(ok.state.resources.observationBadges, 0);
  assert.equal(ok.state.activeSceneId, 'terrarium');
});

test('weekly tickets do not exceed 7', () => {
  let { state } = onboard();
  state = reduce(state, { type: 'PLACE_FURNITURE', furnitureId: 'cushion' }, T0).state;
  state = reduce(state, { type: 'COMPLETE_QUIZ', questionId: 'q_cat_food', choice: 0 }, T0).state;
  state = reduce(state, { type: 'OBSERVE' }, T0).state;
  state = reduce(state, { type: 'PHOTO' }, T0).state;
  state = reduce(state, { type: 'CLEAN' }, T0).state;
  state = reduce(state, { type: 'VIEW_ARCHIVE', speciesId: 'cat' }, T0).state;
  state = reduce(state, { type: 'PLAY' }, T0).state;
  assert.ok(state.weekly.ticketsEarned <= 7);
});

test('wrong quiz does not reduce intimacy', () => {
  let { state } = onboard();
  state = reduce(state, { type: 'FEED', foodId: 'cat_kibble' }, T0).state;
  const before = state.animals.cat.intimacy;
  const r = reduce(state, { type: 'COMPLETE_QUIZ', questionId: 'q_cat_food', choice: 1 }, T0);
  assert.equal(r.state.animals.cat.intimacy, before);
  assert.equal(r.events[0].correct, false);
});

test('cross-day resets daily cap', () => {
  let { state } = onboard();
  state.daily.intimacyGained.cat = 50;
  const nextDay = addDays(T0, 1);
  const r = reduce(state, { type: 'FEED', foodId: 'cat_kibble' }, nextDay);
  assert.ok(r.state.animals.cat.intimacy > 0);
  assert.equal(r.state.daily.intimacyGained.cat > 0, true);
});

test('delete account wipes progress', () => {
  let { state } = onboard();
  const r = reduce(state, { type: 'DELETE_ACCOUNT' }, T0);
  assert.equal(r.state.animals.cat.owned, false);
  assert.equal(r.state.privacyAccepted, false);
});

test('panda look cooldown ignores extra taps', () => {
  let { state } = onboard();
  state = reduce(state, { type: 'DEBUG_GRANT', allow: true, own: ['panda'] }, T0).state;
  state = reduce(state, { type: 'SWITCH_ANIMAL', speciesId: 'panda' }, T0).state;
  state = reduce(state, { type: 'TAP_ANIMAL' }, T0).state;
  const again = reduce(state, { type: 'TAP_ANIMAL' }, T0 + 1000);
  assert.equal(again.events[0].type, 'toast');
});

test('climb cannot switch directly to drink', () => {
  let { state } = onboard();
  state = reduce(state, { type: 'DEBUG_GRANT', allow: true, own: ['panda'], intimacy: 400 }, T0).state;
  state = reduce(state, { type: 'SWITCH_ANIMAL', speciesId: 'panda' }, T0).state;
  state = reduce(state, { type: 'CLIMB' }, T0).state;
  const r = reduce(state, { type: 'FEED', foodId: 'water' }, T0);
  assert.equal(r.events[0].type, 'intercept');
  assert.equal(r.state.animals.panda.pose, 'climb');
});

test('second companion unlocks after familiar stage and archive', () => {
  let { state } = onboard();
  state.animals.cat.intimacy = 100;
  const r = reduce(state, { type: 'VIEW_ARCHIVE', speciesId: 'cat' }, T0);
  assert.equal(r.state.animals.dog.owned, true);
});

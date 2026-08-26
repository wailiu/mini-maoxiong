const { SPECIES_ORDER } = require('../config/species');
const { SCENES } = require('../config/scenes');
const { dateKey, weekKey } = require('./clock');

const SAVE_VERSION = 1;

const WEEKLY_TASKS = [
  { id: 'care_week', name: '完成本周照护记录' },
  { id: 'quiz_week', name: '完成本周科普问答' },
  { id: 'observe_week', name: '完成一次行为观察' },
  { id: 'photo_week', name: '留下一张观察记录' },
  { id: 'enrich_week', name: '完成一次丰容或布置' },
  { id: 'dex_week', name: '阅读一份物种档案' },
  { id: 'clean_week', name: '完成一次环境整理' }
];

function emptyDaily(ts) {
  const gained = {};
  const actions = {};
  SPECIES_ORDER.forEach((id) => {
    gained[id] = 0;
    actions[id] = {
      feed: 0,
      water: 0,
      play: 0,
      observe: 0,
      enrich: 0,
      quiz: 0,
      clean: 0,
      bamboo: 0,
      env: 0,
      log: 0
    };
  });
  return { date: dateKey(ts), intimacyGained: gained, actions };
}

function emptyWeekly(ts) {
  const done = {};
  WEEKLY_TASKS.forEach((t) => {
    done[t.id] = false;
  });
  return { weekKey: weekKey(ts), ticketsEarned: 0, done };
}

function emptyAnimal(id) {
  return {
    id,
    owned: false,
    intimacy: 0,
    mood: 70,
    pose: 'idle_stand',
    lastLookAt: 0,
    courseDone: false
  };
}

function createInitialState(now) {
  const ts = now || Date.now();
  const animals = {};
  SPECIES_ORDER.forEach((id) => {
    animals[id] = emptyAnimal(id);
  });
  const scenes = {};
  Object.keys(SCENES).forEach((id) => {
    scenes[id] = { furniture: [] };
  });
  return {
    version: SAVE_VERSION,
    createdAt: ts,
    privacyAccepted: false,
    tutorialStep: 'privacy',
    starterId: null,
    activeAnimalId: null,
    activeSceneId: 'home',
    resources: {
      researchTickets: 0,
      observationBadges: 0,
      fragments: { gecko: 0, panda: 0, mammoth: 0 },
      materials: 0,
      decorations: []
    },
    daily: emptyDaily(ts),
    weekly: emptyWeekly(ts),
    animals,
    scenes,
    encyclopedia: { viewed: [], courses: [] },
    discoveryLog: [],
    accountDeleted: false
  };
}

function refreshCalendars(state, now) {
  if (state.daily.date !== dateKey(now)) {
    state.daily = emptyDaily(now);
  }
  if (state.weekly.weekKey !== weekKey(now)) {
    state.weekly = emptyWeekly(now);
  }
  return state;
}

function ownedIds(state) {
  return SPECIES_ORDER.filter((id) => state.animals[id].owned);
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports = {
  SAVE_VERSION,
  WEEKLY_TASKS,
  createInitialState,
  refreshCalendars,
  ownedIds,
  clone,
  emptyDaily,
  emptyWeekly
};

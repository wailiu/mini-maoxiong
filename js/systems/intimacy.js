const STAGES = [
  { id: 'new', name: '初识', min: 0, max: 99 },
  { id: 'familiar', name: '熟悉', min: 100, max: 299 },
  { id: 'trust', name: '信任', min: 300, max: 599 },
  { id: 'bond', name: '默契', min: 600, max: 999 },
  { id: 'archive', name: '档案完成', min: 1000, max: 1000 }
];

const DAILY_CAP = 50;
const MAX_INTIMACY = 1000;

function stageOf(value) {
  const n = Math.max(0, Math.min(MAX_INTIMACY, value));
  if (n >= 1000) return STAGES[4];
  return STAGES.find((s) => n >= s.min && n <= s.max) || STAGES[0];
}

function grantIntimacy(current, dailyGained, amount) {
  const want = Math.max(0, amount);
  const roomDaily = Math.max(0, DAILY_CAP - dailyGained);
  const roomTotal = Math.max(0, MAX_INTIMACY - current);
  const granted = Math.min(want, roomDaily, roomTotal);
  return {
    granted,
    next: current + granted,
    dailyGained: dailyGained + granted,
    capped: granted < want,
    completed: current + granted >= MAX_INTIMACY && current < MAX_INTIMACY
  };
}

module.exports = { STAGES, DAILY_CAP, MAX_INTIMACY, stageOf, grantIntimacy };

const { POOLS, DISCOVERY_VERSION, DISCOVERY_ENABLED_AT, RATE_LABELS } = require('../config/discovery');

function cloneRates(rates) {
  const out = {};
  Object.keys(rates).forEach((k) => {
    out[k] = rates[k];
  });
  return out;
}

function publicRates(poolId, ownedSpeciesIds) {
  const pool = POOLS[poolId];
  if (!pool) return null;
  const owned = ownedSpeciesIds || [];
  const remaining = pool.species.filter((id) => owned.indexOf(id) < 0);
  const rates = cloneRates(pool.rates);
  if (remaining.length === 0 && rates.species) {
    delete rates.species;
    const rest = Object.keys(rates).reduce((a, k) => a + rates[k], 0);
    Object.keys(rates).forEach((k) => {
      rates[k] = rest > 0 ? rates[k] / rest : 0;
    });
    return {
      poolId,
      name: pool.name,
      version: DISCOVERY_VERSION,
      enabledAt: DISCOVERY_ENABLED_AT,
      exchangeBadges: pool.exchangeBadges,
      labels: RATE_LABELS,
      rates,
      speciesHidden: true,
      remainingSpecies: remaining,
      note: '本池已全部获得，完整物种档位已隐藏并重算概率。'
    };
  }
  return {
    poolId,
    name: pool.name,
    version: DISCOVERY_VERSION,
    enabledAt: DISCOVERY_ENABLED_AT,
    exchangeBadges: pool.exchangeBadges,
    labels: RATE_LABELS,
    rates,
    speciesHidden: false,
    remainingSpecies: remaining,
    note: '单次结果独立。每抽固定获得 1 枚观察徽章。'
  };
}

function pickTier(rates, roll) {
  let acc = 0;
  const keys = Object.keys(rates);
  for (let i = 0; i < keys.length; i++) {
    acc += rates[keys[i]];
    if (roll < acc) return keys[i];
  }
  return keys[keys.length - 1];
}

function draw(poolId, ownedSpeciesIds, rng) {
  const shown = publicRates(poolId, ownedSpeciesIds);
  if (!shown) {
    return { ok: false, code: 'unknown_pool', message: '未知发现池' };
  }
  const roll = rng();
  const tier = pickTier(shown.rates, roll);
  const result = {
    ok: true,
    poolId,
    version: DISCOVERY_VERSION,
    badges: 1,
    tier,
    roll,
    rates: shown.rates,
    item: null
  };
  if (tier === 'species') {
    const list = shown.remainingSpecies;
    result.item = list[Math.floor(rng() * list.length)] || list[0];
    result.label = '完整项目：' + result.item;
  } else if (tier === 'fragment') {
    const pool = POOLS[poolId];
    result.item = pool.species[0];
    result.label = '物种碎片';
  } else if (tier === 'decoration') {
    result.item = 'deco_' + poolId;
    result.label = '场景装饰';
  } else {
    result.item = 'mat_' + poolId;
    result.label = '环境材料';
  }
  return result;
}

function canExchange(poolId, badges, ownedSpeciesIds) {
  const pool = POOLS[poolId];
  if (!pool) return { ok: false, code: 'unknown_pool', message: '未知发现池' };
  const remaining = pool.species.filter((id) => (ownedSpeciesIds || []).indexOf(id) < 0);
  if (remaining.length === 0) {
    return { ok: false, code: 'owned', message: '本池项目均已开启，无需兑换。' };
  }
  if (badges < pool.exchangeBadges) {
    return { ok: false, code: 'short', need: pool.exchangeBadges, message: '观察徽章不足，兑换需 ' + pool.exchangeBadges + ' 枚。' };
  }
  return { ok: true, cost: pool.exchangeBadges, grant: remaining[0] };
}

module.exports = { publicRates, draw, canExchange };

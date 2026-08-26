const POOLS = {
  exotic: {
    id: 'exotic',
    name: '异宠观察',
    species: ['gecko'],
    exchangeBadges: 10,
    rates: {
      species: 0.08,
      fragment: 0.42,
      decoration: 0.20,
      material: 0.30
    }
  },
  protected: {
    id: 'protected',
    name: '保护项目',
    species: ['panda'],
    exchangeBadges: 30,
    rates: {
      species: 0.03,
      fragment: 0.47,
      decoration: 0.20,
      material: 0.30
    }
  },
  extinct: {
    id: 'extinct',
    name: '史前复原',
    species: ['mammoth'],
    exchangeBadges: 50,
    rates: {
      species: 0.01,
      fragment: 0.54,
      decoration: 0.15,
      material: 0.30
    }
  }
};

const DISCOVERY_VERSION = 'mvp-0.2';
const DISCOVERY_ENABLED_AT = '2026-08-26T00:00:00+08:00';

const RATE_LABELS = {
  species: '完整新物种/项目',
  fragment: '物种碎片',
  decoration: '场景装饰',
  material: '环境材料'
};

function assertPoolRates() {
  Object.keys(POOLS).forEach((id) => {
    const rates = POOLS[id].rates;
    const sum = Object.keys(rates).reduce((a, k) => a + rates[k], 0);
    if (Math.abs(sum - 1) > 1e-9) {
      throw new Error('pool ' + id + ' rates must sum to 1, got ' + sum);
    }
  });
}

module.exports = {
  POOLS,
  DISCOVERY_VERSION,
  DISCOVERY_ENABLED_AT,
  RATE_LABELS,
  assertPoolRates
};

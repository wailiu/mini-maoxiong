const { getSpecies } = require('../config/species');
const { foodName } = require('../config/foods');

function foodTier(speciesId, foodId) {
  const species = getSpecies(speciesId);
  if (!species) return 'unknown';
  if (species.foods.recommend.indexOf(foodId) >= 0) return 'recommend';
  if (species.foods.occasional.indexOf(foodId) >= 0) return 'occasional';
  if (species.foods.forbidden.indexOf(foodId) >= 0) return 'forbidden';
  return 'forbidden';
}

function evaluateFeed(speciesId, foodId) {
  const species = getSpecies(speciesId);
  const name = foodName(foodId);
  if (!species) {
    return { ok: false, swallowed: false, code: 'unknown_species', message: '未知物种' };
  }
  const tier = foodTier(speciesId, foodId);
  if (tier === 'forbidden') {
    const pandaExtra = speciesId === 'panda'
      ? '圈养食谱由专业人员制定，游戏不允许自由配方。大熊猫不会吃下错误食物。'
      : '该食物不在白名单，宠物不会实际吞食。';
    return {
      ok: false,
      swallowed: false,
      code: 'blocked',
      tier,
      foodId,
      intimacy: 0,
      message: '已拦截「' + name + '」。' + pandaExtra
    };
  }
  if (tier === 'occasional') {
    return {
      ok: true,
      swallowed: true,
      code: 'occasional',
      tier,
      foodId,
      intimacy: 5,
      message: '偶尔可提供「' + name + '」，注意份量。心情有短暂提示，不永久扣亲密度。'
    };
  }
  return {
    ok: true,
    swallowed: true,
    code: 'recommend',
    tier,
    foodId,
    intimacy: foodId === 'water' ? 5 : 10,
    message: '已按推荐清单提供「' + name + '」。'
  };
}

module.exports = { foodTier, evaluateFeed };

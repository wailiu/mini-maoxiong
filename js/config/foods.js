const FOODS = {
  water: { id: 'water', name: '清水', group: 'drink' },
  cat_kibble: { id: 'cat_kibble', name: '猫粮', group: 'staple' },
  wet_food: { id: 'wet_food', name: '猫用湿粮', group: 'staple' },
  cat_treat: { id: 'cat_treat', name: '猫零食', group: 'treat' },
  cooked_chicken: { id: 'cooked_chicken', name: '熟鸡肉碎', group: 'treat' },
  dog_kibble: { id: 'dog_kibble', name: '犬粮', group: 'staple' },
  dog_wet: { id: 'dog_wet', name: '犬用湿粮', group: 'staple' },
  dog_chew: { id: 'dog_chew', name: '洁齿咬胶', group: 'treat' },
  cricket: { id: 'cricket', name: '饲料蟋蟀', group: 'staple' },
  mealworm: { id: 'mealworm', name: '面包虫', group: 'treat' },
  gecko_calcium: { id: 'gecko_calcium', name: '钙粉虫饲', group: 'staple' },
  bamboo_culm: { id: 'bamboo_culm', name: '系统推荐竹茎', group: 'staple' },
  bamboo_leaf: { id: 'bamboo_leaf', name: '系统推荐竹叶', group: 'staple' },
  bamboo_shoot: { id: 'bamboo_shoot', name: '春季竹笋（系统）', group: 'event' },
  tundra_grass: { id: 'tundra_grass', name: '冰原草本（复原模型）', group: 'staple' },
  woody_browse: { id: 'woody_browse', name: '灌木枝叶（复原模型）', group: 'treat' },
  chocolate: { id: 'chocolate', name: '巧克力', group: 'junk' },
  onion: { id: 'onion', name: '洋葱', group: 'junk' },
  grape: { id: 'grape', name: '葡萄', group: 'junk' },
  human_snack: { id: 'human_snack', name: '人类零食', group: 'junk' },
  raw_meat: { id: 'raw_meat', name: '生肉块', group: 'junk' },
  milk: { id: 'milk', name: '牛奶', group: 'junk' }
};

function foodName(id) {
  return (FOODS[id] && FOODS[id].name) || id;
}

module.exports = { FOODS, foodName };

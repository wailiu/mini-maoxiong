const SCENES = {
  home: {
    id: 'home',
    name: '公寓',
    tag: 'home',
    kind: 'private',
    facilities: ['bowl', 'water_bowl', 'cushion', 'toy']
  },
  yard: {
    id: 'yard',
    name: '小院',
    tag: 'home',
    kind: 'private',
    facilities: ['bowl', 'water_bowl', 'cushion', 'toy', 'tree_stump']
  },
  terrarium: {
    id: 'terrarium',
    name: '恒温爬宠箱',
    tag: 'terrarium',
    kind: 'husbandry',
    facilities: ['heat_mat', 'hide', 'water_dish', 'humidity']
  },
  reserve: {
    id: 'reserve',
    name: '高山竹林保护区',
    tag: 'reserve',
    kind: 'sanctuary',
    facilities: ['bamboo_rack', 'water_pool', 'mark_tree', 'lookout', 'bamboo_ball', 'hollow_log']
  },
  ice: {
    id: 'ice',
    name: '冰河平原复原区',
    tag: 'ice',
    kind: 'restoration',
    facilities: ['tundra_grass', 'rock_layer', 'research_station']
  }
};

const FURNITURE = {
  bowl: { id: 'bowl', name: '食盆', scenes: ['home', 'yard'] },
  water_bowl: { id: 'water_bowl', name: '饮水碗', scenes: ['home', 'yard'] },
  cushion: { id: 'cushion', name: '睡垫', scenes: ['home', 'yard'] },
  toy: { id: 'toy', name: '逗趣玩具', scenes: ['home', 'yard'] },
  tree_stump: { id: 'tree_stump', name: '小木桩', scenes: ['yard'] },
  heat_mat: { id: 'heat_mat', name: '温区垫', scenes: ['terrarium'] },
  hide: { id: 'hide', name: '躲避屋', scenes: ['terrarium'] },
  water_dish: { id: 'water_dish', name: '浅水皿', scenes: ['terrarium'] },
  humidity: { id: 'humidity', name: '保湿苔', scenes: ['terrarium'] },
  bamboo_rack: { id: 'bamboo_rack', name: '竹架', scenes: ['reserve'] },
  water_pool: { id: 'water_pool', name: '水源', scenes: ['reserve'] },
  mark_tree: { id: 'mark_tree', name: '标记树', scenes: ['reserve'] },
  lookout: { id: 'lookout', name: '观察窗', scenes: ['reserve'] },
  bamboo_ball: { id: 'bamboo_ball', name: '竹球', scenes: ['reserve'], enrichment: true },
  hollow_log: { id: 'hollow_log', name: '空心木', scenes: ['reserve'], enrichment: true },
  puzzle_feeder: { id: 'puzzle_feeder', name: '益智取食器', scenes: ['reserve'], enrichment: true },
  tundra_grass: { id: 'tundra_grass', name: '草本层', scenes: ['ice'] },
  rock_layer: { id: 'rock_layer', name: '岩层', scenes: ['ice'] },
  research_station: { id: 'research_station', name: '研究站', scenes: ['ice'] }
};

module.exports = { SCENES, FURNITURE };

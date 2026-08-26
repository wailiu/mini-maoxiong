const { PANDA_NOTICE, CARE_DISCLAIMER, EXOTIC_DISCLAIMER, EXTINCT_DISCLAIMER } = require('./copy');

const SPECIES = {
  cat: {
    id: 'cat',
    name: '家猫',
    scientificName: 'Felis catus',
    category: 'companion',
    relation: '虚拟领养',
    unlock: { type: 'starter' },
    sceneTags: ['home'],
    defaultScene: 'home',
    foods: {
      recommend: ['cat_kibble', 'wet_food', 'water'],
      occasional: ['cat_treat', 'cooked_chicken'],
      forbidden: ['chocolate', 'onion', 'grape', 'bamboo_culm', 'cricket', 'raw_meat']
    },
    wearables: true,
    intimacyLabel: '亲密度',
    openLabel: '领养',
    palette: { body: '#e2b37a', accent: '#6a4428', patch: '#f4ece0', eye: '#5f8f3a', inner: '#f0c4b0', stripe: '#c48a4a' },
    archive: {
      protection: '家养动物',
      range: '与人共居的伴生环境',
      diet: '以完整猫粮为主食，可辅以适量湿粮。巧克力、洋葱、葡萄等对猫有害。',
      behavior: '短时陪玩、观察和稳定投喂有助于建立熟悉感。',
      sources: [
        { title: '家猫照护为游戏简化模拟', org: '内部审核', date: '2026-08-26', url: '' }
      ]
    }
  },
  dog: {
    id: 'dog',
    name: '家犬',
    scientificName: 'Canis familiaris',
    category: 'companion',
    relation: '虚拟领养',
    unlock: { type: 'starter' },
    sceneTags: ['home'],
    defaultScene: 'home',
    foods: {
      recommend: ['dog_kibble', 'dog_wet', 'water'],
      occasional: ['dog_chew', 'cooked_chicken'],
      forbidden: ['chocolate', 'onion', 'grape', 'bamboo_culm', 'cricket']
    },
    wearables: true,
    intimacyLabel: '亲密度',
    openLabel: '领养',
    palette: { body: '#d39a5a', accent: '#4a3324', patch: '#f0e4d4', eye: '#3d2a1c' },
    archive: {
      protection: '家养动物',
      range: '与人共居的伴生环境',
      diet: '以完整犬粮为主食。巧克力、洋葱、葡萄等对犬有害。',
      behavior: '陪玩和规律作息帮助建立信任，不设计攻击或追逐玩法。',
      sources: [
        { title: '家犬照护为游戏简化模拟', org: '内部审核', date: '2026-08-26', url: '' }
      ]
    }
  },
  gecko: {
    id: 'gecko',
    name: '豹纹守宫',
    scientificName: 'Eublepharis macularius',
    category: 'exotic',
    relation: '合规饲养观察',
    unlock: { type: 'course_exchange', course: 'gecko_course', badges: 10, pool: 'exotic' },
    sceneTags: ['terrarium'],
    defaultScene: 'terrarium',
    foods: {
      recommend: ['cricket', 'gecko_calcium', 'water'],
      occasional: ['mealworm'],
      forbidden: ['cat_kibble', 'chocolate', 'raw_meat', 'bamboo_culm', 'milk']
    },
    wearables: false,
    intimacyLabel: '观察熟悉度',
    openLabel: '开启观察项目',
    disclaimer: EXOTIC_DISCLAIMER,
    palette: { body: '#d4b45c', accent: '#3b2a18', patch: '#ead7a4', eye: '#c45c2a' },
    archive: {
      protection: '须按学名核验贸易与饲养限制，不得诱导现实购买',
      range: '原生干旱岩漠环境，游戏仅提供恒温箱观察',
      diet: '以饲料昆虫为主，钙磷比需专业指导。本游戏不构成饲养配方。',
      behavior: '夜行性，需要温区和躲避屋。错误环境会被系统拦截。',
      sources: [
        { title: '按学名审查，不做私养教程', org: '内部合规', date: '2026-08-26', url: '' }
      ]
    }
  },
  panda: {
    id: 'panda',
    name: '大熊猫',
    scientificName: 'Ailuropoda melanoleuca',
    category: 'protected',
    relation: '云守护/保育观察',
    unlock: { type: 'course_exchange', course: 'panda_course', badges: 30, pool: 'protected' },
    sceneTags: ['reserve'],
    defaultScene: 'reserve',
    foods: {
      recommend: ['bamboo_culm', 'bamboo_leaf', 'water'],
      occasional: ['bamboo_shoot'],
      forbidden: ['cat_kibble', 'dog_kibble', 'chocolate', 'human_snack', 'raw_meat', 'cricket', 'cooked_chicken', 'milk']
    },
    wearables: false,
    intimacyLabel: '观察熟悉度',
    openLabel: '开启观察项目',
    notice: PANDA_NOTICE,
    disclaimer: CARE_DISCLAIMER,
    dietNote: '以竹子为主食。圈养食谱由专业人员制定，游戏不允许玩家自由配方。',
    palette: { body: '#f4f1ea', accent: '#161616', patch: '#1a1a1a', eye: '#111111' },
    archive: {
      protection: '国家一级重点保护野生动物',
      range: '游戏场景为虚构保护区，不复刻真实机构',
      diet: '以竹子为主食，占比会因个体、季节和环境变化；不使用“只能吃竹子”的绝对化表述。',
      behavior: '内八字步行、前掌抓握竹子、食后休息、可上树；不冬眠。玩家不得拥抱、牵引或带回家。',
      sources: [
        {
          title: '大熊猫食物与竹类科普',
          org: '国家林业和草原局',
          date: '2026-08-26',
          url: 'https://www.forestry.gov.cn/c/www/dzw/575582.jhtml'
        },
        {
          title: '行为特征科普',
          org: '国家林业和草原局',
          date: '2026-08-26',
          url: 'https://www.forestry.gov.cn/c/www/lcdt/582627.jhtml'
        }
      ]
    }
  },
  mammoth: {
    id: 'mammoth',
    name: '猛犸象',
    scientificName: 'Mammuthus primigenius',
    category: 'extinct',
    relation: '科学复原观察',
    unlock: { type: 'course_exchange', course: 'mammoth_course', badges: 50, pool: 'extinct' },
    sceneTags: ['ice'],
    defaultScene: 'ice',
    foods: {
      recommend: ['tundra_grass', 'water'],
      occasional: ['woody_browse'],
      forbidden: ['cat_kibble', 'bamboo_culm', 'chocolate', 'cricket']
    },
    wearables: false,
    restorationTag: '化石证据支持的轮廓 + 艺术复原的被毛色彩',
    intimacyLabel: '观察熟悉度',
    openLabel: '开启复原项目',
    disclaimer: EXTINCT_DISCLAIMER,
    palette: { body: '#8d5a38', accent: '#e8d4b0', patch: '#5c3a28', eye: '#2a1c14' },
    archive: {
      protection: '已灭绝，仅作科学复原观察',
      range: '更新世北半球草原与苔原（推断）',
      diet: '草本与灌木为主的食草模型，属主流推断。',
      behavior: '缓慢巡游和靠近研究站观察。不进入私人住宅。',
      sources: [
        { title: '复原分级：化石证据 / 主流推断 / 艺术复原', org: '内部科学审核', date: '2026-08-26', url: '' }
      ]
    }
  }
};

const SPECIES_ORDER = ['cat', 'dog', 'gecko', 'panda', 'mammoth'];

function getSpecies(id) {
  return SPECIES[id] || null;
}

module.exports = { SPECIES, SPECIES_ORDER, getSpecies };

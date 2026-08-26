const QUESTIONS = [
  {
    id: 'q_cat_food',
    species: 'cat',
    prompt: '下列哪项更适合作为家猫的日常主食？',
    options: ['完整猫粮', '巧克力', '葡萄', '生洋葱'],
    answer: 0,
    explain: '家猫应以完整猫粮为主食。巧克力、葡萄、洋葱等对猫有害，游戏中会在入口拦截。'
  },
  {
    id: 'q_dog_grape',
    species: 'dog',
    prompt: '家犬误食葡萄时，游戏会怎么处理？',
    options: ['播放生病动画并扣永久亲密度', '在入口拦截，不实际吞食', '允许吃下并进入战斗', '直接死亡惩罚'],
    answer: 1,
    explain: '错误食物一律在入口拦截，不出现生病或死亡惩罚。'
  },
  {
    id: 'q_gecko_env',
    species: 'gecko',
    prompt: '豹纹守宫的观察场景应该是？',
    options: ['公寓沙发', '恒温爬宠箱', '竹林保护区', '冰河平原'],
    answer: 1,
    explain: '异宠使用已审查的恒温饲养箱。不适配环境会被阻止。'
  },
  {
    id: 'q_panda_diet',
    species: 'panda',
    prompt: '关于大熊猫食性，哪句更准确？',
    options: ['只能吃竹子，绝无例外', '以竹子为主食，圈养食谱由专业人员制定', '和家猫一样吃猫粮', '玩家可自由配制任何食物'],
    answer: 1,
    explain: '应使用范围表述：以竹子为主食。游戏不允许自由配方。'
  },
  {
    id: 'q_panda_role',
    species: 'panda',
    prompt: '玩家与大熊猫的关系是？',
    options: ['私人领养并带回家', '购买后拥有所有权', '虚拟保育志愿者，进行云守护观察', '骑乘和牵引散步的伴侣'],
    answer: 2,
    explain: '玩家不是饲养所有人。按钮使用“开启观察项目”，不出现购买或私养。'
  },
  {
    id: 'q_panda_sleep',
    species: 'panda',
    prompt: '大熊猫会冬眠吗？',
    options: ['会，整季不进食', '不会冬眠', '只在树上冬眠', '由玩家命令决定'],
    answer: 1,
    explain: '档案提示大熊猫不冬眠。该知识点来自公开行为科普。'
  },
  {
    id: 'q_mammoth_tag',
    species: 'mammoth',
    prompt: '猛犸象在游戏中的外观应如何标注？',
    options: ['完全写实的照片复刻', '按化石证据 / 主流推断 / 艺术复原分级', '可当作现生动物私养', '不需要任何说明'],
    answer: 1,
    explain: '灭绝生物必须分级标注，避免把推测写成定论。'
  },
  {
    id: 'q_pay',
    species: 'meta',
    prompt: '本期如何获得研究券？',
    options: ['人民币充值', '看广告买次数', '周任务、章节首通和官方免费活动', '玩家间交易'],
    answer: 2,
    explain: '研究券不可购买、赠送或交易。本期不接支付。'
  }
];

const COURSES = {
  gecko_course: {
    id: 'gecko_course',
    title: '守宫习性课程',
    questionIds: ['q_gecko_env', 'q_pay']
  },
  panda_course: {
    id: 'panda_course',
    title: '保护课程',
    questionIds: ['q_panda_diet', 'q_panda_role', 'q_panda_sleep']
  },
  mammoth_course: {
    id: 'mammoth_course',
    title: '化石修复章节',
    questionIds: ['q_mammoth_tag', 'q_pay']
  }
};

function getQuestion(id) {
  return QUESTIONS.find((q) => q.id === id);
}

module.exports = { QUESTIONS, COURSES, getQuestion };

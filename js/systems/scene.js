const { getSpecies } = require('../config/species');
const { SCENES, FURNITURE } = require('../config/scenes');

function sceneOf(sceneId) {
  return SCENES[sceneId] || null;
}

function canPlaceAnimal(speciesId, sceneId) {
  const species = getSpecies(speciesId);
  const scene = sceneOf(sceneId);
  if (!species || !scene) {
    return { ok: false, code: 'unknown', message: '未知场景或物种' };
  }
  if (species.sceneTags.indexOf(scene.tag) >= 0) {
    return { ok: true };
  }
  if (species.category === 'protected' && scene.kind === 'private') {
    return {
      ok: false,
      code: 'redirect_reserve',
      redirect: species.defaultScene,
      message: '保护动物不能放入私人住宅。已为你打开云守护观察场景。'
    };
  }
  if (species.category === 'extinct') {
    return {
      ok: false,
      code: 'restore_mismatch',
      redirect: species.defaultScene,
      message: '当前复原模型不适配此环境。'
    };
  }
  return {
    ok: false,
    code: 'blocked',
    redirect: species.defaultScene,
    message: '该物种与当前环境标签不适配，已阻止放入并说明原因。'
  };
}

function canPlaceFurniture(furnitureId, sceneId) {
  const item = FURNITURE[furnitureId];
  const scene = sceneOf(sceneId);
  if (!item || !scene) {
    return { ok: false, code: 'unknown', message: '未知设施' };
  }
  if (item.scenes.indexOf(sceneId) >= 0) {
    return { ok: true, hint: false };
  }
  if (scene.kind === 'private') {
    return {
      ok: true,
      hint: true,
      message: '这件设施不太适合当前居家角落，可以继续编辑。'
    };
  }
  return {
    ok: false,
    code: 'blocked',
    message: '该设施不能放入此观察环境。'
  };
}

module.exports = { sceneOf, canPlaceAnimal, canPlaceFurniture };

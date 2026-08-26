const { getSpecies, SPECIES_ORDER } = require('../config/species');
const { getQuestion, COURSES } = require('../config/quiz');
const { evaluateFeed } = require('./food');
const { canPlaceAnimal, canPlaceFurniture } = require('./scene');
const { grantIntimacy, stageOf } = require('./intimacy');
const { publicRates, draw, canExchange } = require('./discovery');
const { canEnter, lookAllowed } = require('./panda');
const { createInitialState, refreshCalendars, ownedIds, clone, WEEKLY_TASKS } = require('./state');
const { addDays } = require('./clock');

function applyIntimacy(state, speciesId, amount) {
  const animal = state.animals[speciesId];
  const daily = state.daily.intimacyGained[speciesId] || 0;
  const result = grantIntimacy(animal.intimacy, daily, amount);
  animal.intimacy = result.next;
  state.daily.intimacyGained[speciesId] = result.dailyGained;
  return result;
}

function grantWeekly(state, taskId) {
  if (!WEEKLY_TASKS.find((t) => t.id === taskId)) return false;
  if (state.weekly.done[taskId]) return false;
  if (state.weekly.ticketsEarned >= 7) return false;
  state.weekly.done[taskId] = true;
  state.weekly.ticketsEarned += 1;
  state.resources.researchTickets += 1;
  return true;
}

function openProject(state, speciesId) {
  const spec = getSpecies(speciesId);
  const animal = state.animals[speciesId];
  animal.owned = true;
  if (state.encyclopedia.viewed.indexOf(speciesId) < 0) {
    state.encyclopedia.viewed.push(speciesId);
  }
  state.activeAnimalId = speciesId;
  state.activeSceneId = spec.defaultScene;
}

function pruneLog(state, now) {
  const cutoff = addDays(now, -180);
  state.discoveryLog = (state.discoveryLog || []).filter((row) => row.ts >= cutoff);
}

function maybeAdvanceTutorial(state, step) {
  if (state.tutorialStep === step) {
    const order = ['privacy', 'pick', 'feed', 'water', 'play', 'furniture', 'dex', 'quiz', 'done'];
    const i = order.indexOf(step);
    state.tutorialStep = order[Math.min(i + 1, order.length - 1)];
  }
}

function reduce(state, action, now) {
  const ts = now || Date.now();
  const next = clone(state || createInitialState(ts));
  refreshCalendars(next, ts);
  const events = [];

  function fail(message, extra) {
    events.push(Object.assign({ type: 'intercept', message }, extra || {}));
    return { state: next, events };
  }

  switch (action.type) {
    case 'ACCEPT_PRIVACY': {
      next.privacyAccepted = true;
      if (next.tutorialStep === 'privacy') next.tutorialStep = 'pick';
      events.push({ type: 'toast', message: '已记录同意，本地仅保存存档。' });
      break;
    }
    case 'CHOOSE_STARTER': {
      const id = action.speciesId;
      if (id !== 'cat' && id !== 'dog') return fail('请选择猫或狗作为第一位同伴。');
      if (next.starterId) return fail('已经完成领养。');
      next.starterId = id;
      next.animals[id].owned = true;
      next.activeAnimalId = id;
      next.activeSceneId = 'home';
      next.encyclopedia.viewed.push(id);
      maybeAdvanceTutorial(next, 'pick');
      events.push({ type: 'toast', message: '已完成虚拟领养。' });
      break;
    }
    case 'FEED': {
      const id = next.activeAnimalId;
      if (!id) return fail('请先选择同伴。');
      const result = evaluateFeed(id, action.foodId);
      if (!result.ok) {
        events.push({ type: 'intercept', code: result.code, message: result.message, swallowed: false });
        return { state: next, events };
      }
      const animal = next.animals[id];
      if (id === 'panda' && !canEnter(animal.pose, action.foodId === 'water' ? 'drink' : 'eat')) {
        return fail('当前动作互斥，请等待安全退出后再投喂。');
      }
      animal.pose = action.foodId === 'water' ? 'drink' : 'eat';
      const spec = getSpecies(id);
      let amount = result.intimacy;
      const acts = next.daily.actions[id];
      if (id === 'panda' && (action.foodId === 'bamboo_culm' || action.foodId === 'bamboo_leaf' || action.foodId === 'bamboo_shoot')) {
        if (acts.bamboo >= 1) amount = 0;
        else acts.bamboo += 1;
      } else if (action.foodId === 'water') {
        if (acts.water >= 1) amount = 0;
        else acts.water += 1;
        if (id === 'panda' && acts.env < 1) acts.env += 1;
      } else if (acts.feed >= 1 && spec.category === 'companion') {
        amount = 0;
      } else if (spec.category === 'companion') {
        acts.feed += 1;
      }
      const granted = applyIntimacy(next, id, amount);
      grantWeekly(next, 'care_week');
      maybeAdvanceTutorial(next, action.foodId === 'water' ? 'water' : 'feed');
      events.push({
        type: 'care',
        message: result.message + (granted.capped && amount > 0 ? ' 今日观察熟悉度已达上限。' : ''),
        swallowed: true,
        granted: granted.granted
      });
      break;
    }
    case 'PLAY': {
      const id = next.activeAnimalId;
      if (!id) return fail('请先选择同伴。');
      const spec = getSpecies(id);
      if (spec.category === 'protected') {
        return fail('保护动物不提供追逐或逗弄。请改用观察、丰容或行为记录。');
      }
      const animal = next.animals[id];
      animal.pose = 'play';
      const acts = next.daily.actions[id];
      let amount = 8;
      if (acts.play >= 1) amount = 0;
      else acts.play += 1;
      const granted = applyIntimacy(next, id, amount);
      grantWeekly(next, 'care_week');
      maybeAdvanceTutorial(next, 'play');
      events.push({ type: 'care', message: '完成陪玩。', granted: granted.granted });
      break;
    }
    case 'OBSERVE': {
      const id = next.activeAnimalId;
      if (!id) return fail('请先选择同伴。');
      const acts = next.daily.actions[id];
      let amount = 1;
      if (acts.observe >= 5) amount = 0;
      else acts.observe += 1;
      applyIntimacy(next, id, amount);
      grantWeekly(next, 'observe_week');
      events.push({ type: 'care', message: amount ? '记录到一次自然行为。' : '今日自由观察次数已满，仍可观看。' });
      break;
    }
    case 'TAP_ANIMAL': {
      const id = next.activeAnimalId;
      if (!id) break;
      const animal = next.animals[id];
      if (!lookAllowed(animal.lastLookAt, ts)) {
        events.push({ type: 'toast', message: '它需要一点空间，请稍后再看。' });
        break;
      }
      animal.lastLookAt = ts;
      animal.pose = 'look';
      events.push({ type: 'look' });
      break;
    }
    case 'PLACE_FURNITURE': {
      const sceneId = next.activeSceneId;
      const check = canPlaceFurniture(action.furnitureId, sceneId);
      if (!check.ok) return fail(check.message);
      const list = next.scenes[sceneId].furniture;
      if (list.indexOf(action.furnitureId) < 0) list.push(action.furnitureId);
      const id = next.activeAnimalId;
      if (id) {
        const spec = getSpecies(id);
        let amount = 6;
        if (spec.category === 'protected') {
          const acts = next.daily.actions[id];
          if (acts.enrich >= 2) amount = 0;
          else acts.enrich += 1;
          amount = amount ? 10 : 0;
        }
        applyIntimacy(next, id, amount);
      }
      grantWeekly(next, 'enrich_week');
      maybeAdvanceTutorial(next, 'furniture');
      events.push({
        type: check.hint ? 'hint' : 'care',
        message: check.hint ? check.message : '布置已更新。'
      });
      break;
    }
    case 'SWITCH_ANIMAL': {
      const id = action.speciesId;
      if (!next.animals[id] || !next.animals[id].owned) {
        return fail('尚未开启该观察项目。');
      }
      const spec = getSpecies(id);
      const place = canPlaceAnimal(id, next.activeSceneId);
      next.activeAnimalId = id;
      if (!place.ok) {
        next.activeSceneId = spec.defaultScene;
        events.push({ type: 'toast', message: '已切换到' + spec.name + '的适配场景。' });
      } else {
        events.push({ type: 'toast', message: '切换到' + spec.name });
      }
      break;
    }
    case 'SWITCH_SCENE': {
      const sceneId = action.sceneId;
      const id = next.activeAnimalId;
      if (id) {
        const place = canPlaceAnimal(id, sceneId);
        if (!place.ok) {
          next.activeSceneId = place.redirect || next.activeSceneId;
          return fail(place.message, { code: place.code, redirect: next.activeSceneId });
        }
      }
      next.activeSceneId = sceneId;
      events.push({ type: 'toast', message: '已进入新场景。' });
      break;
    }
    case 'MOVE_ANIMAL_TO_SCENE': {
      const place = canPlaceAnimal(action.speciesId, action.sceneId);
      if (!place.ok) {
        if (next.animals[action.speciesId] && next.animals[action.speciesId].owned) {
          next.activeAnimalId = action.speciesId;
          next.activeSceneId = place.redirect;
        }
        return fail(place.message, { code: place.code, redirect: place.redirect });
      }
      next.activeAnimalId = action.speciesId;
      next.activeSceneId = action.sceneId;
      break;
    }
    case 'VIEW_ARCHIVE': {
      const id = action.speciesId;
      if (next.encyclopedia.viewed.indexOf(id) < 0) next.encyclopedia.viewed.push(id);
      grantWeekly(next, 'dex_week');
      maybeAdvanceTutorial(next, 'dex');
      const other = next.starterId === 'cat' ? 'dog' : 'cat';
      if (next.starterId && next.animals[next.starterId].intimacy >= 100 && !next.animals[other].owned) {
        next.animals[other].owned = true;
        events.push({ type: 'unlock', message: '图鉴任务完成，第二只普通宠物已可领养观察。', speciesId: other });
      }
      events.push({ type: 'archive', speciesId: id });
      break;
    }
    case 'COMPLETE_QUIZ': {
      const q = getQuestion(action.questionId);
      if (!q) return fail('题目不存在。');
      const correct = action.choice === q.answer;
      const id = next.activeAnimalId || next.starterId;
      if (id && correct) {
        const acts = next.daily.actions[id];
        let amount = 5;
        if (acts.quiz >= 1) amount = 0;
        else acts.quiz += 1;
        applyIntimacy(next, id, amount);
      }
      if (correct) grantWeekly(next, 'quiz_week');
      maybeAdvanceTutorial(next, 'quiz');
      events.push({
        type: 'quiz',
        correct,
        explain: q.explain,
        message: correct ? '回答正确。科普答错不扣亲密度。' : '答错不扣亲密度。' + q.explain
      });
      break;
    }
    case 'GRANT_TUTORIAL_TICKET': {
      if (!next._tutorialTicket) {
        next._tutorialTicket = true;
        next.resources.researchTickets += 1;
        events.push({ type: 'toast', message: '获得第一张免费研究券。' });
      }
      next.tutorialStep = 'done';
      break;
    }
    case 'COMPLETE_COURSE': {
      const course = COURSES[action.courseId];
      if (!course) return fail('课程不存在。');
      if (next.encyclopedia.courses.indexOf(course.id) < 0) {
        next.encyclopedia.courses.push(course.id);
        next.resources.researchTickets += 1;
        SPECIES_ORDER.forEach((sid) => {
          const spec = getSpecies(sid);
          if (spec.unlock && spec.unlock.course === course.id) {
            next.animals[sid].courseDone = true;
          }
        });
        events.push({ type: 'toast', message: '章节首通，获得 1 张研究券。' });
      }
      break;
    }
    case 'DRAW': {
      if (next.resources.researchTickets < 1) return fail('研究券不足。研究券不可购买。');
      const owned = ownedIds(next);
      const shown = publicRates(action.poolId, owned);
      if (!shown) return fail('未知发现池。');
      const rng = action.rng || Math.random;
      const result = draw(action.poolId, owned, rng);
      next.resources.researchTickets -= 1;
      next.resources.observationBadges += 1;
      if (result.tier === 'fragment') {
        next.resources.fragments[result.item] = (next.resources.fragments[result.item] || 0) + 1;
      } else if (result.tier === 'decoration') {
        next.resources.decorations.push(result.item);
      } else if (result.tier === 'material') {
        next.resources.materials += 1;
      } else if (result.tier === 'species' && result.item) {
        openProject(next, result.item);
      }
      pruneLog(next, ts);
      next.discoveryLog.push({
        ts,
        poolId: action.poolId,
        version: result.version,
        tier: result.tier,
        item: result.item,
        badges: 1
      });
      events.push({ type: 'draw', result, rates: shown });
      break;
    }
    case 'EXCHANGE': {
      const specEntry = SPECIES_ORDER.map(getSpecies).find((s) => s.unlock && s.unlock.pool === action.poolId);
      if (specEntry && !next.animals[specEntry.id].courseDone) {
        return fail('请先完成对应习性/保护/化石课程。');
      }
      const check = canExchange(action.poolId, next.resources.observationBadges, ownedIds(next));
      if (!check.ok) return fail(check.message);
      next.resources.observationBadges -= check.cost;
      openProject(next, check.grant);
      events.push({ type: 'unlock', speciesId: check.grant, message: getSpecies(check.grant).openLabel + '已完成。' });
      break;
    }
    case 'BEHAVIOR_LOG': {
      const id = next.activeAnimalId;
      if (!id) return fail('请先选择观察对象。');
      if (getSpecies(id).category !== 'protected') {
        events.push({ type: 'toast', message: '行为记录小游戏目前用于保护区观察。' });
        break;
      }
      const animal = next.animals[id];
      if (animal.intimacy < 300) return fail('信任阶段后可进行行为记录。');
      const acts = next.daily.actions[id];
      let amount = 10;
      if (acts.log >= 1) amount = 0;
      else acts.log += 1;
      applyIntimacy(next, id, amount);
      events.push({
        type: 'care',
        message: action.tag ? '已标记行为：' + action.tag : '完成行为记录。',
        granted: amount
      });
      break;
    }
    case 'CLIMB': {
      const id = next.activeAnimalId;
      if (id !== 'panda') return fail('仅保护区提供攀爬观察。');
      const animal = next.animals[id];
      if (animal.intimacy < 300) return fail('信任阶段后可观察上树。');
      if (!canEnter(animal.pose, 'climb')) return fail('当前动作互斥，树上状态不能直接饮水或地面翻滚。');
      animal.pose = 'climb';
      events.push({ type: 'care', message: '大熊猫抱树攀至安全平台。' });
      break;
    }
    case 'SET_POSE': {
      const id = next.activeAnimalId;
      if (!id) break;
      const animal = next.animals[id];
      if (!canEnter(animal.pose, action.pose)) return fail('动作互斥，已保持当前安全状态。');
      animal.pose = action.pose;
      break;
    }
    case 'PHOTO': {
      grantWeekly(next, 'photo_week');
      events.push({ type: 'photo', message: '已生成游戏画面记录，不申请相机权限。' });
      break;
    }
    case 'CLEAN': {
      const id = next.activeAnimalId;
      if (id) {
        const acts = next.daily.actions[id];
        if (acts.clean < 1) acts.clean += 1;
      }
      grantWeekly(next, 'clean_week');
      events.push({ type: 'care', message: '环境已整理。不与动物同屏近距离接触。' });
      break;
    }
    case 'DELETE_ACCOUNT': {
      const blank = createInitialState(ts);
      blank.accountDeleted = true;
      blank.tutorialStep = 'privacy';
      events.push({ type: 'toast', message: '本地存档已注销清空。' });
      return { state: blank, events };
    }
    case 'DEBUG_GRANT': {
      if (!action.allow) return fail('正式环境不可使用调试补给。');
      next.resources.researchTickets += action.tickets || 0;
      next.resources.observationBadges += action.badges || 0;
      (action.own || []).forEach((id) => {
        next.animals[id].owned = true;
        next.animals[id].courseDone = true;
        if (action.intimacy) next.animals[id].intimacy = action.intimacy;
      });
      break;
    }
    default:
      events.push({ type: 'toast', message: '未知操作' });
  }
  return { state: next, events };
}

function publicDiscovery(state, poolId) {
  return publicRates(poolId, ownedIds(state));
}

function animalStage(state, speciesId) {
  return stageOf(state.animals[speciesId].intimacy);
}

module.exports = { reduce, publicDiscovery, animalStage };

const { createPlatform } = require('./platform');
const { THEME } = require('./theme');
const copy = require('./config/copy');
const { SPECIES, SPECIES_ORDER, getSpecies } = require('./config/species');
const { FOODS } = require('./config/foods');
const { SCENES, FURNITURE } = require('./config/scenes');
const { COURSES, getQuestion } = require('./config/quiz');
const { RATE_LABELS } = require('./config/discovery');
const { createInitialState } = require('./systems/state');
const { reduce, publicDiscovery, animalStage } = require('./systems/reducer');
const { loadSave, writeSave, clearSave } = require('./systems/save');
const gfx = require('./view/gfx');

function startGame(platform) {
  const plat = platform || createPlatform();
  const { ctx, width: W, height: H } = plat;
  let state = loadSave(plat) || createInitialState(plat.now());
  const ui = {
    screen: state.privacyAccepted ? (state.starterId ? 'home' : 'pick') : 'boot',
    modal: null,
    hits: [],
    toast: null,
    toastAt: 0,
    photo: false,
    quiz: null,
    course: null,
    pool: 'exotic',
    poseAt: 0
  };

  function dispatch(action) {
    const r = reduce(state, action, plat.now());
    state = r.state;
    r.events.forEach((ev) => {
      if (ev.type === 'care' || ev.type === 'look') ui.poseAt = plat.now();
      if (ev.type === 'intercept') openModal({ kind: 'intercept', title: '系统拦截', body: ev.message });
      else if (ev.type === 'hint' || ev.type === 'care' || ev.type === 'toast' || ev.type === 'unlock') toast(ev.message);
      else if (ev.type === 'quiz') openModal({ kind: 'quizResult', title: ev.correct ? '记录正确' : '先记下这个知识点', body: ev.message });
      else if (ev.type === 'draw') openModal({ kind: 'draw', title: '发现结果', body: ev.result.label, result: ev.result });
      else if (ev.type === 'photo') {
        plat.snapshot((file) => {
          plat.share({ title: copy.GAME_NAME + ' · 观察记录', imageUrl: file || '' });
          toast(ev.message);
        });
      }
    });
    if (action.type === 'DELETE_ACCOUNT') {
      clearSave(plat);
      ui.screen = 'boot';
      ui.modal = null;
    } else writeSave(plat, state);
    if (action.type === 'ACCEPT_PRIVACY') ui.screen = 'pick';
    if (action.type === 'CHOOSE_STARTER') ui.screen = 'home';
    if (action.type === 'GRANT_TUTORIAL_TICKET') ui.screen = 'home';
  }

  function toast(msg) {
    ui.toast = msg;
    ui.toastAt = plat.now();
  }
  function openModal(m) { ui.modal = m; }
  function closeModal() { ui.modal = null; }
  function hit(x, y, w, h, fn) { ui.hits.push({ x, y, w, h, fn }); }
  function btn(x, y, w, h, label, kind, fn) {
    gfx.drawButton(ctx, x, y, w, h, label, kind);
    hit(x, y, w, h, fn);
  }

  function foodsFor(id) {
    const spec = getSpecies(id);
    const ids = spec.foods.recommend.concat(spec.foods.occasional).concat(spec.foods.forbidden.slice(0, 2));
    const uniq = [];
    ids.forEach((fid) => { if (uniq.indexOf(fid) < 0) uniq.push(fid); });
    return uniq;
  }

  function furnitureFor(sceneId) {
    return Object.keys(FURNITURE).filter((id) => FURNITURE[id].scenes.indexOf(sceneId) >= 0 || SCENES[sceneId].kind === 'private');
  }

  function navY() { return H - 64; }

  function drawNav() {
    if (ui.photo) return;
    gfx.fillRound(ctx, 12, navY(), W - 24, 52, 18, THEME.peat);
    const items = [['home', '家园'], ['dex', '图鉴'], ['discover', '发现'], ['settings', '设置']];
    items.forEach((it, i) => {
      const x = 12 + i * ((W - 24) / 4);
      const on = ui.screen === it[0];
      gfx.text(ctx, it[1], x + (W - 24) / 8, navY() + 26, 14, on ? THEME.brass : THEME.pith, 'center');
      hit(x, navY(), (W - 24) / 4, 52, () => {
        ui.screen = it[0];
        ui.modal = null;
        if (it[0] === 'dex' && state.tutorialStep === 'dex') {
          dispatch({ type: 'VIEW_ARCHIVE', speciesId: state.starterId || 'cat' });
        }
        if (it[0] === 'dex' && state.tutorialStep === 'quiz') startQuiz('q_cat_food', true);
      });
    });
  }

  function drawBoot() {
    gfx.drawBootArt(ctx, W, H, plat.now());
    gfx.fillRound(ctx, 28, 36, W - 56, 70, 16, 'rgba(247, 241, 226, 0.93)');
    gfx.stamp(ctx, W - 54, 50, '8+');
    gfx.text(ctx, copy.GAME_NAME, W / 2, 62, 28, THEME.ink, 'center');
    gfx.text(ctx, copy.GAME_SUBTITLE, W / 2, 88, 12, THEME.slate, 'center');
    gfx.fillRound(ctx, 18, H * 0.8, W - 36, H * 0.155, 16, 'rgba(20, 32, 28, 0.78)');
    gfx.wrapText(ctx, copy.HEALTH_ADVICE[0] + '　适度游戏益脑，沉迷游戏伤身。', 32, H * 0.82, W - 64, 16, 12, THEME.pith);
    gfx.text(ctx, '适龄 ' + copy.AGE_TIP + ' · 轻触继续', W / 2, H * 0.91, 13, THEME.brass, 'center');
    hit(0, 0, W, H, () => { ui.screen = 'privacy'; });
  }

  function drawPrivacy() {
    gfx.paperBg(ctx, W, H, THEME.paper);
    gfx.stamp(ctx, W - 56, 48, '手记');
    gfx.text(ctx, '隐私与本地存档', 24, 64, 22, THEME.ink);
    gfx.wrapText(ctx, copy.PRIVACY_SUMMARY, 24, 92, W - 48, 20, 14, THEME.slate);
    gfx.wrapText(ctx, copy.PANDA_NOTICE, 24, 210, W - 48, 20, 13, THEME.ink);
    btn(24, H - 140, W - 48, 48, '同意并进入', 'primary', () => dispatch({ type: 'ACCEPT_PRIVACY' }));
  }

  function drawPick() {
    gfx.paperBg(ctx, W, H, THEME.pith);
    gfx.text(ctx, '选择第一位同伴', 24, 58, 22, THEME.ink);
    gfx.text(ctx, '普通宠物采用虚拟领养，可随时在公寓照料。', 24, 86, 13, THEME.slate);
    ['cat', 'dog'].forEach((id, i) => {
      const y = 114 + i * 220;
      const spec = SPECIES[id];
      gfx.drawSpeciesCard(ctx, 20, y, W - 40, 204, id, spec.palette, plat.now());
      gfx.text(ctx, spec.name, W / 2, y + 168, 16, THEME.ink, 'center');
      gfx.text(ctx, spec.scientificName, W / 2, y + 186, 11, THEME.slate, 'center');
      hit(20, y, W - 40, 204, () => dispatch({ type: 'CHOOSE_STARTER', speciesId: id }));
    });
  }

  function drawHome() {
    const sceneId = state.activeSceneId || 'home';
    const sceneH = H * 0.52;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, sceneH);
    ctx.clip();
    (gfx.DRAW_SCENE[sceneId] || gfx.DRAW_SCENE.home)(ctx, W, sceneH, plat.now());
    if (state.scenes[sceneId]) gfx.drawFurniture(ctx, W, sceneH, sceneId, state.scenes[sceneId].furniture);
    const id = state.activeAnimalId;
    if (id) {
      const spec = getSpecies(id);
      const scale = id === 'mammoth' ? 1.2 : id === 'gecko' ? 1.25 : 1.35;
      gfx.DRAW_ANIMAL[id](ctx, W / 2, sceneH * 0.78, scale, plat.now(), state.animals[id].pose, spec.palette);
      hit(W / 2 - 80, sceneH * 0.38, 160, 160, () => dispatch({ type: 'TAP_ANIMAL' }));
    }
    ctx.restore();
    gfx.fillRound(ctx, 0, sceneH - 18, W, H - sceneH + 18, 22, THEME.paper);
    const spec = id ? getSpecies(id) : null;
    if (spec) {
      gfx.specimenTag(ctx, 16, plat.statusBar + 8, spec.scientificName, spec.name);
      gfx.stamp(ctx, W - 52, plat.statusBar + 36, spec.category === 'protected' ? '云守护' : '手记');
      const stage = animalStage(state, id);
      gfx.text(ctx, spec.intimacyLabel + ' ' + state.animals[id].intimacy + ' · ' + stage.name, 24, sceneH + 18, 13, THEME.slate);
      gfx.fillRound(ctx, 24, sceneH + 32, W - 48, 8, 4, '#d5ddd0');
      gfx.fillRound(ctx, 24, sceneH + 32, (W - 48) * (state.animals[id].intimacy / 1000), 8, 4, THEME.moss);
      gfx.text(ctx, SCENES[sceneId].name + ' · ' + spec.relation, 24, sceneH + 54, 12, THEME.mist);
      if (spec.category === 'protected') gfx.wrapText(ctx, '虚拟保育观察，非私人领养', 24, sceneH + 66, W - 48, 16, 11, THEME.stamp);
      if (spec.restorationTag) gfx.wrapText(ctx, spec.restorationTag, 24, sceneH + 66, W - 48, 16, 11, THEME.slate);
    }
    homeActions(spec).forEach((a, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 16 + col * ((W - 20) / 4);
      const y = sceneH + 92 + row * 58;
      btn(x, y, (W - 36) / 4, 46, a.label, 'ghost', a.fn);
    });
    drawOwnedChips();
    if (spec && spec.sceneTags.indexOf('home') >= 0) {
      btn(W - 86, 86, 70, 28, state.activeSceneId === 'yard' ? '小院' : '公寓', 'ghost', () => {
        dispatch({ type: 'SWITCH_SCENE', sceneId: state.activeSceneId === 'yard' ? 'home' : 'yard' });
      });
    }
    drawTutorial();
  }

  function homeActions(spec) {
    if (!spec) return [];
    if (spec.category === 'protected') {
      return [
        { label: '补竹', fn: () => openModal({ kind: 'food', title: '系统推荐竹类' }) },
        { label: '环境', fn: () => dispatch({ type: 'FEED', foodId: 'water' }) },
        { label: '丰容', fn: () => openModal({ kind: 'furniture', title: '丰容设施' }) },
        { label: '记录', fn: () => openModal({ kind: 'log', title: '行为记录' }) },
        { label: '观察', fn: () => dispatch({ type: 'OBSERVE' }) },
        { label: '上树', fn: () => dispatch({ type: 'CLIMB' }) },
        { label: '整理', fn: () => dispatch({ type: 'CLEAN' }) },
        { label: '拍照', fn: () => {
          ui.photo = true;
          setTimeout(() => { dispatch({ type: 'PHOTO' }); ui.photo = false; }, 220);
        } }
      ];
    }
    if (spec.category === 'exotic') {
      return [
        { label: '投喂', fn: () => openModal({ kind: 'food', title: '选择食物' }) },
        { label: '饮水', fn: () => dispatch({ type: 'FEED', foodId: 'water' }) },
        { label: '观察', fn: () => dispatch({ type: 'OBSERVE' }) },
        { label: '布置', fn: () => openModal({ kind: 'furniture', title: '布置设施' }) }
      ];
    }
    return [
      { label: '投喂', fn: () => openModal({ kind: 'food', title: '选择食物' }) },
      { label: '饮水', fn: () => dispatch({ type: 'FEED', foodId: 'water' }) },
      { label: spec.category === 'extinct' ? '观察' : '陪玩', fn: () => spec.category === 'extinct' ? dispatch({ type: 'OBSERVE' }) : dispatch({ type: 'PLAY' }) },
      { label: '布置', fn: () => openModal({ kind: 'furniture', title: '布置设施' }) }
    ];
  }

  function drawOwnedChips() {
    SPECIES_ORDER.filter((id) => state.animals[id].owned).forEach((id, i) => {
      const x = 16 + i * 52;
      const y = 86;
      gfx.fillRound(ctx, x, y, 46, 36, 12, id === state.activeAnimalId ? THEME.moss : 'rgba(255,255,255,0.78)');
      ctx.save();
      ctx.beginPath();
      gfx.roundRect(ctx, x, y, 46, 36, 12);
      ctx.clip();
      gfx.DRAW_ANIMAL[id](ctx, x + 23, y + 28, 0.38, plat.now(), 'idle_stand', getSpecies(id).palette);
      ctx.restore();
      hit(x, y, 46, 36, () => dispatch({ type: 'SWITCH_ANIMAL', speciesId: id }));
    });
  }

  function drawTutorial() {
    const map = {
      feed: '先选一份推荐食物完成投喂。',
      water: '再补充一次清水。',
      play: '陪它玩一会儿。',
      furniture: '布置第一件家具。',
      dex: '打开图鉴，看看长期观察目标。',
      quiz: '完成一条科普问答，领取研究券。'
    };
    const msg = map[state.tutorialStep];
    if (!msg) return;
    gfx.fillRound(ctx, 20, H - 150, W - 40, 70, 14, THEME.peat);
    gfx.wrapText(ctx, msg, 36, H - 136, W - 72, 18, 13, THEME.paper);
    if (state.tutorialStep === 'quiz') {
      hit(20, H - 150, W - 40, 70, () => startQuiz('q_cat_food', true));
    }
  }

  function startQuiz(qid, tutorial) {
    ui.quiz = { id: qid, tutorial: !!tutorial };
    openModal({ kind: 'quiz', title: '科普问答' });
  }

  function startCourse(id) {
    ui.course = { id, index: 0 };
    closeModal();
    startQuiz(COURSES[id].questionIds[0], false);
  }

  function advanceCourse(ok) {
    if (!ok || !ui.course) { ui.course = null; return; }
    const c = COURSES[ui.course.id];
    ui.course.index += 1;
    if (ui.course.index >= c.questionIds.length) {
      dispatch({ type: 'COMPLETE_COURSE', courseId: ui.course.id });
      ui.course = null;
    } else startQuiz(c.questionIds[ui.course.index], false);
  }

  function drawDex() {
    gfx.paperBg(ctx, W, H, THEME.pith);
    gfx.text(ctx, '物种档案', 24, 54, 22, THEME.ink);
    gfx.text(ctx, '学名 · 保护级别 · 食性来源', 24, 78, 12, THEME.slate);
    SPECIES_ORDER.forEach((id, i) => {
      const spec = SPECIES[id];
      const y = 100 + i * 92;
      gfx.fillRound(ctx, 16, y, W - 32, 84, 16, '#f3efe2');
      gfx.DRAW_ANIMAL[id](ctx, W - 58, y + 52, 0.55, plat.now(), 'idle_stand', spec.palette);
      gfx.text(ctx, spec.name, 28, y + 24, 16, THEME.ink);
      gfx.text(ctx, spec.scientificName, 28, y + 44, 11, THEME.slate);
      gfx.text(ctx, spec.relation, 28, y + 64, 12, spec.category === 'protected' ? THEME.stamp : THEME.moss);
      hit(16, y, W - 32, 84, () => {
        dispatch({ type: 'VIEW_ARCHIVE', speciesId: id });
        openModal({ kind: 'archive', speciesId: id });
      });
    });
  }

  function drawDiscover() {
    gfx.paperBg(ctx, W, H, THEME.pith);
    gfx.text(ctx, '免费发现', 24, 54, 22, THEME.ink);
    gfx.text(ctx, '研究券 ' + state.resources.researchTickets + ' · 观察徽章 ' + state.resources.observationBadges, 24, 78, 13, THEME.slate);
    gfx.wrapText(ctx, '不可购买、赠送或交易。抽取前公示全部档位、概率版本与兑换规则。', 24, 98, W - 48, 18, 12, THEME.mist);
    ['exotic', 'protected', 'extinct'].forEach((id, i) => {
      const x = 16 + i * ((W - 24) / 3);
      btn(x, 150, (W - 36) / 3, 40, publicDiscovery(state, id).name, ui.pool === id ? 'primary' : 'ghost', () => { ui.pool = id; });
    });
    const shown = publicDiscovery(state, ui.pool);
    let y = 210;
    Object.keys(shown.rates).forEach((k) => {
      gfx.text(ctx, (RATE_LABELS[k] || k) + '  ' + Math.round(shown.rates[k] * 1000) / 10 + '%', 28, y, 14, THEME.ink);
      y += 24;
    });
    gfx.wrapText(ctx, '版本 ' + shown.version + ' · 启用 ' + shown.enabledAt.slice(0, 10) + ' · 兑换 ' + shown.exchangeBadges + ' 枚徽章', 24, y + 8, W - 48, 18, 12, THEME.slate);
    gfx.wrapText(ctx, shown.note, 24, y + 48, W - 48, 18, 12, THEME.mist);
    btn(24, H - 220, W - 48, 48, '使用 1 张研究券发现', 'primary', () => dispatch({ type: 'DRAW', poolId: ui.pool }));
    btn(24, H - 162, W - 48, 44, '直接兑换该项目', 'ghost', () => dispatch({ type: 'EXCHANGE', poolId: ui.pool }));
  }

  function drawSettings() {
    gfx.paperBg(ctx, W, H, THEME.pith);
    gfx.text(ctx, '设置与合规', 24, 54, 22, THEME.ink);
    const rows = [
      ['适龄提示', copy.AGE_TIP],
      ['运营主体', '待出版单位确认'],
      ['批准文号', '未取得前不向公众运营'],
      ['备案编号', '待小程序备案完成后展示'],
      ['著作权', '原创程序化形象']
    ];
    rows.forEach((r, i) => {
      gfx.text(ctx, r[0], 24, 96 + i * 36, 13, THEME.slate);
      gfx.text(ctx, r[1], W - 24, 96 + i * 36, 13, THEME.ink, 'right');
    });
    btn(24, 290, W - 48, 44, '健康游戏忠告', 'ghost', () => openModal({ kind: 'legal', title: '健康游戏忠告', body: copy.HEALTH_ADVICE.join('') }));
    btn(24, 342, W - 48, 44, '用户协议与隐私', 'ghost', () => openModal({ kind: 'legal', title: '隐私规则', body: copy.PRIVACY_SUMMARY + copy.PANDA_NOTICE }));
    btn(24, 394, W - 48, 44, '注销本地账号', 'danger', () => dispatch({ type: 'DELETE_ACCOUNT' }));
    if (plat.isDev()) {
      btn(24, 456, W - 48, 44, '开发：补给券与徽章', 'ghost', () => {
        dispatch({ type: 'DEBUG_GRANT', allow: true, tickets: 20, badges: 50 });
        toast('仅开发版可见。');
      });
      btn(24, 508, W - 48, 44, '开发：开启四类观察', 'ghost', () => {
        dispatch({ type: 'DEBUG_GRANT', allow: true, own: ['gecko', 'panda', 'mammoth'], intimacy: 320 });
        toast('已开启守宫 / 大熊猫 / 猛犸象观察。');
      });
    }
  }

  function drawModal() {
    const m = ui.modal;
    if (!m) return;
    ctx.fillStyle = 'rgba(20,32,28,0.45)';
    ctx.fillRect(0, 0, W, H);
    const boxY = 90;
    gfx.fillRound(ctx, 18, boxY, W - 36, H - 200, 18, THEME.paper);
    gfx.text(ctx, m.title || '提示', 36, boxY + 28, 18, THEME.ink);
    btn(W - 70, boxY + 12, 40, 32, '关闭', 'ghost', closeModal);
    if (m.kind === 'food') {
      foodsFor(state.activeAnimalId).forEach((fid, i) => {
        const y = boxY + 56 + i * 52;
        gfx.fillRound(ctx, 36, y, W - 72, 44, 12, THEME.pith);
        gfx.text(ctx, FOODS[fid].name, 52, y + 22, 14, THEME.ink);
        hit(36, y, W - 72, 44, () => { closeModal(); dispatch({ type: 'FEED', foodId: fid }); });
      });
    } else if (m.kind === 'furniture') {
      furnitureFor(state.activeSceneId).slice(0, 8).forEach((fid, i) => {
        const y = boxY + 56 + i * 48;
        gfx.fillRound(ctx, 36, y, W - 72, 40, 12, THEME.pith);
        gfx.text(ctx, FURNITURE[fid].name, 52, y + 20, 14, THEME.ink);
        hit(36, y, W - 72, 40, () => { closeModal(); dispatch({ type: 'PLACE_FURNITURE', furnitureId: fid }); });
      });
    } else if (m.kind === 'quiz') {
      const q = getQuestion(ui.quiz.id);
      gfx.wrapText(ctx, q.prompt, 36, boxY + 56, W - 72, 20, 14, THEME.ink);
      q.options.forEach((opt, i) => {
        const y = boxY + 140 + i * 52;
        btn(36, y, W - 72, 44, opt, 'ghost', () => {
          const tutorial = ui.quiz.tutorial;
          closeModal();
          dispatch({ type: 'COMPLETE_QUIZ', questionId: q.id, choice: i });
          if (tutorial && i === q.answer) dispatch({ type: 'GRANT_TUTORIAL_TICKET' });
          if (ui.course) advanceCourse(i === q.answer);
        });
      });
    } else if (m.kind === 'archive') {
      const spec = getSpecies(m.speciesId);
      gfx.wrapText(ctx, spec.archive.protection + '。' + spec.archive.diet, 36, boxY + 56, W - 72, 18, 13, THEME.ink);
      gfx.wrapText(ctx, spec.archive.behavior, 36, boxY + 150, W - 72, 18, 13, THEME.slate);
      if (spec.disclaimer) gfx.wrapText(ctx, spec.disclaimer, 36, boxY + 230, W - 72, 18, 12, THEME.stamp);
      const src = spec.archive.sources[0];
      gfx.wrapText(ctx, '来源：' + src.org + ' · ' + src.date + ' · ' + src.title, 36, boxY + 310, W - 72, 16, 11, THEME.mist);
      if (spec.unlock && spec.unlock.course && !state.animals[spec.id].courseDone) {
        btn(36, H - 250, W - 72, 44, COURSES[spec.unlock.course].title, 'primary', () => startCourse(spec.unlock.course));
      }
    } else if (m.kind === 'log') {
      ['进食', '休息', '移动', '丰容'].forEach((tag, i) => {
        btn(36, boxY + 60 + i * 52, W - 72, 44, tag, 'ghost', () => { closeModal(); dispatch({ type: 'BEHAVIOR_LOG', tag }); });
      });
    } else {
      gfx.wrapText(ctx, m.body || '', 36, boxY + 64, W - 72, 20, 14, THEME.ink);
      btn(36, H - 250, W - 72, 44, '知道了', 'primary', closeModal);
    }
  }

  function drawToast() {
    if (!ui.toast || plat.now() - ui.toastAt > 2400) return;
    gfx.fillRound(ctx, 24, 110, W - 48, 48, 14, THEME.peat);
    gfx.wrapText(ctx, ui.toast, 40, 122, W - 80, 16, 12, THEME.paper);
  }

  plat.onTap((x, y) => {
    const list = ui.hits.slice().reverse();
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      if (x >= b.x && y >= b.y && x <= b.x + b.w && y <= b.y + b.h) {
        b.fn();
        return;
      }
    }
  });

  function recoverPose() {
    const id = state.activeAnimalId;
    if (!id || !ui.poseAt) return;
    const p = state.animals[id].pose;
    if (['eat', 'drink', 'play', 'look'].indexOf(p) >= 0 && plat.now() - ui.poseAt > 1400) {
      state.animals[id].pose = 'idle_stand';
      ui.poseAt = 0;
    }
  }

  function loop() {
    ui.hits = [];
    ctx.imageSmoothingEnabled = true;
    if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = 'high';
    recoverPose();
    if (ui.screen === 'boot') drawBoot();
    else if (ui.screen === 'privacy') drawPrivacy();
    else if (ui.screen === 'pick') drawPick();
    else if (ui.screen === 'dex') drawDex();
    else if (ui.screen === 'discover') drawDiscover();
    else if (ui.screen === 'settings') drawSettings();
    else drawHome();
    if (!ui.photo && ui.screen !== 'boot' && ui.screen !== 'privacy' && ui.screen !== 'pick') drawNav();
    drawModal();
    drawToast();
    plat.requestFrame(loop);
  }
  loop();
}

module.exports = { startGame };

const ANIMAL_SRC = {
  cat: 'images/animal-cat.png',
  dog: 'images/animal-dog.png',
  gecko: 'images/animal-gecko.png',
  panda: 'images/animal-panda.png',
  mammoth: 'images/animal-mammoth.png'
};

const SCENE_SRC = {
  home: 'images/scene-home.jpg',
  yard: 'images/scene-yard.jpg',
  terrarium: 'images/scene-terrarium.jpg',
  reserve: 'images/scene-reserve.jpg',
  ice: 'images/scene-ice.jpg'
};

function isWx() {
  return typeof wx !== 'undefined' && typeof wx.createImage === 'function';
}

function srcPath(rel) {
  return isWx() ? rel : '/' + rel.replace(/^\//, '');
}

function load(rel) {
  let img;
  if (isWx()) img = wx.createImage();
  else if (typeof Image !== 'undefined') img = new Image();
  else return { width: 0, complete: false, __fail: true };
  img.__fail = false;
  img.onerror = function () { img.__fail = true; };
  img.src = srcPath(rel);
  return img;
}

const animals = {};
const scenes = {};
Object.keys(ANIMAL_SRC).forEach((id) => { animals[id] = load(ANIMAL_SRC[id]); });
Object.keys(SCENE_SRC).forEach((id) => { scenes[id] = load(SCENE_SRC[id]); });

function ready(img) {
  return img && !img.__fail && img.width > 0;
}

function failed(img) {
  return img && img.__fail;
}

function drawCover(ctx, img, w, h) {
  const ir = img.width / img.height;
  const r = w / h;
  let dw;
  let dh;
  let dx;
  let dy;
  if (ir > r) {
    dh = h;
    dw = h * ir;
    dx = (w - dw) / 2;
    dy = 0;
  } else {
    dw = w;
    dh = w / ir;
    dx = 0;
    dy = h - dh;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawScene(ctx, id, w, h) {
  const img = scenes[id];
  if (failed(img)) return false;
  if (!ready(img)) {
    ctx.fillStyle = '#d5decc';
    ctx.fillRect(0, 0, w, h);
    return true;
  }
  drawCover(ctx, img, w, h);
  return true;
}

function drawAnimal(ctx, id, x, y, s, t, pose) {
  const img = animals[id];
  if (failed(img)) return false;
  if (!ready(img)) return true;
  ctx.save();
  ctx.translate(x, y);
  const tilt = pose === 'look' ? -0.05 : pose === 'play' ? 0.06 : (pose === 'eat' || pose === 'drink') ? 0.08 : pose === 'climb' ? -0.04 : 0;
  ctx.rotate(tilt);
  const breath = 1 + Math.sin((t || 0) / 480) * 0.012;
  const size = 170 * s * breath;
  ctx.fillStyle = 'rgba(40, 24, 14, 0.16)';
  ctx.beginPath();
  ctx.ellipse(0, size * 0.4, size * 0.28, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.drawImage(img, -size / 2, -size * 0.62, size, size);
  ctx.restore();
  return true;
}

module.exports = {
  drawScene,
  drawAnimal
};

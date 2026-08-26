const { THEME, FONT } = require('../theme');
const sprites = require('./sprites');

const INK = 'rgba(52, 34, 22, 0.38)';
const INK_SOFT = 'rgba(52, 34, 22, 0.22)';

function roundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function fillRound(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
}

function oval(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function blob(ctx, x, y, rx, ry, color, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot || 0);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(rx, 0);
  for (let i = 1; i <= 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const k = 1 + Math.sin(i * 1.7) * 0.07;
    ctx.quadraticCurveTo(
      Math.cos(a - Math.PI / 8) * rx * k * 1.05,
      Math.sin(a - Math.PI / 8) * ry * k * 1.05,
      Math.cos(a) * rx * k,
      Math.sin(a) * ry * k
    );
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function inked(ctx, fill, stroke, width, draw) {
  ctx.beginPath();
  draw();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = stroke || INK;
  ctx.lineWidth = width || 1.6;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

function fillP(ctx, color, draw) {
  ctx.beginPath();
  draw();
  ctx.fillStyle = color;
  ctx.fill();
}

function blobFill(ctx, x, y, rx, ry, color, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot || 0);
  fillP(ctx, color, () => ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2));
  ctx.restore();
}

function shadeInside(ctx, draw) {
  ctx.save();
  ctx.beginPath();
  draw();
  ctx.clip();
  ctx.fillStyle = 'rgba(40, 24, 12, 0.14)';
  ctx.beginPath();
  ctx.ellipse(8, 14, 36, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 248, 236, 0.22)';
  ctx.beginPath();
  ctx.ellipse(-10, -8, 16, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function almondEye(ctx, x, y, w, h, color, highlight, closed) {
  if (closed) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - w, y);
    ctx.quadraticCurveTo(x, y + 2.2, x + w, y);
    ctx.stroke();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x - w, y);
  ctx.quadraticCurveTo(x, y - h, x + w, y);
  ctx.quadraticCurveTo(x, y + h * 0.8, x - w, y);
  ctx.closePath();
  ctx.fillStyle = '#f7f4ea';
  ctx.fill();
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 0.8;
  ctx.stroke();
  oval(ctx, x, y + 0.4, w * 0.4, h * 0.58, color);
  oval(ctx, x - w * 0.16, y - h * 0.22, w * 0.16, h * 0.18, highlight || '#fff');
}

function paperBg(ctx, w, h, color) {
  ctx.fillStyle = color || THEME.paper;
  ctx.fillRect(0, 0, w, h);
  paperGrain(ctx, w, h, 0.07);
}

function bambooLeaf(ctx, x, y, len, rot, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.48, -5, len, 0);
  ctx.quadraticCurveTo(len * 0.48, 5, 0, 0);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(28, 46, 26, 0.28)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();
}

function shadow(ctx, x, y, rx, ry) {
  oval(ctx, x, y, rx, ry, 'rgba(42, 28, 16, 0.16)');
  oval(ctx, x, y - 2, rx * 0.62, ry * 0.55, 'rgba(42, 28, 16, 0.10)');
}

function text(ctx, str, x, y, size, color, align) {
  ctx.font = (size >= 20 ? '600 ' : '') + size + 'px ' + FONT;
  ctx.fillStyle = color || THEME.ink;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function wrapText(ctx, str, x, y, maxW, lineH, size, color) {
  ctx.font = size + 'px ' + FONT;
  ctx.fillStyle = color || THEME.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const chars = String(str).split('');
  let line = '';
  let yy = y;
  chars.forEach((ch) => {
    const test = line + ch;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy);
      line = ch;
      yy += lineH;
    } else line = test;
  });
  if (line) ctx.fillText(line, x, yy);
  return yy + lineH;
}

function paperGrain(ctx, w, h, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha == null ? 0.055 : alpha;
  ctx.fillStyle = '#3a2a16';
  for (let i = 0; i < 90; i++) {
    const x = (i * 97 + 13) % w;
    const y = (i * 53 + 29) % h;
    ctx.fillRect(x, y, 1.2, (i % 3) ? 1.2 : 2.2);
  }
  ctx.restore();
}

function stamp(ctx, x, y, label) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.16);
  ctx.globalAlpha = 0.92;
  ctx.strokeStyle = THEME.stamp;
  ctx.lineWidth = 1.8;
  roundRect(ctx, -38, -14, 76, 28, 3);
  ctx.stroke();
  roundRect(ctx, -34, -10, 68, 20, 2);
  ctx.stroke();
  ctx.font = '600 11px ' + FONT;
  ctx.fillStyle = THEME.stamp;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label || '观察记录', 0, 0);
  ctx.restore();
}

function specimenTag(ctx, x, y, latin, cn) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.025);
  fillRound(ctx, 0, 0, 188, 50, 6, 'rgba(246, 241, 226, 0.94)');
  ctx.strokeStyle = 'rgba(90, 70, 40, 0.28)';
  ctx.lineWidth = 1;
  roundRect(ctx, 0, 0, 188, 50, 6);
  ctx.stroke();
  oval(ctx, 16, 25, 5.5, 5.5, '#efe6d2');
  ctx.strokeStyle = 'rgba(90, 70, 40, 0.4)';
  ctx.beginPath();
  ctx.arc(16, 25, 5.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = THEME.stamp;
  ctx.fillRect(28, 11, 3, 28);
  text(ctx, cn, 38, 19, 14, THEME.ink);
  text(ctx, latin, 38, 36, 10, THEME.slate);
  ctx.restore();
}

function drawButton(ctx, x, y, w, h, label, kind) {
  ctx.save();
  if (kind === 'primary') {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#6f9a6a');
    g.addColorStop(1, '#4e7a52');
    fillRound(ctx, x, y, w, h, 14, g);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1.2;
    roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 13);
    ctx.stroke();
  } else if (kind === 'danger') {
    fillRound(ctx, x, y, w, h, 14, '#c45b4a');
  } else if (kind === 'ghost') {
    fillRound(ctx, x, y, w, h, 14, 'rgba(255,255,255,0.62)');
    ctx.strokeStyle = 'rgba(40, 48, 40, 0.10)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, w, h, 14);
    ctx.stroke();
  } else {
    fillRound(ctx, x, y, w, h, 14, '#f4f0e4');
    ctx.strokeStyle = 'rgba(40, 48, 40, 0.08)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, w, h, 14);
    ctx.stroke();
  }
  const fg = kind === 'primary' || kind === 'danger' ? '#f7f3ea' : THEME.ink;
  text(ctx, label, x + w / 2, y + h / 2, w < 80 ? 13 : 14, fg, 'center');
  ctx.restore();
}

function sky(ctx, w, h, top, mid, bot) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(0.52, mid);
  g.addColorStop(1, bot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function cloud(ctx, x, y, s) {
  oval(ctx, x, y, 24 * s, 11 * s, 'rgba(255,255,255,0.78)');
  oval(ctx, x + 18 * s, y + 3 * s, 16 * s, 9 * s, 'rgba(255,255,255,0.7)');
  oval(ctx, x - 16 * s, y + 4 * s, 15 * s, 8 * s, 'rgba(255,255,255,0.64)');
  oval(ctx, x + 4 * s, y - 5 * s, 12 * s, 8 * s, 'rgba(255,255,255,0.55)');
}

function sun(ctx, x, y, r) {
  oval(ctx, x, y, r + 10, r + 10, 'rgba(255, 214, 140, 0.28)');
  oval(ctx, x, y, r, r, '#f3d27a');
  oval(ctx, x - r * 0.2, y - r * 0.2, r * 0.35, r * 0.35, 'rgba(255,255,255,0.45)');
}

function woodFloor(ctx, y, w, h, color) {
  ctx.fillStyle = color || '#d8c4a0';
  ctx.fillRect(0, y, w, h);
  const plank = 20;
  for (let i = 0; i < h / plank + 2; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(110, 74, 38, 0.07)' : 'rgba(255, 236, 204, 0.10)';
    ctx.fillRect(0, y + i * plank, w, plank - 1);
    ctx.strokeStyle = 'rgba(110, 80, 45, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + i * plank);
    ctx.lineTo(w, y + i * plank);
    ctx.stroke();
    oval(ctx, 28 + (i * 73) % (w - 40), y + i * plank + 8, 4, 2, 'rgba(110,80,45,0.12)');
  }
}

function leaf(ctx, x, y, rx, ry, color, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot || 0);
  inked(ctx, color, 'rgba(30, 48, 28, 0.35)', 0.8, () => {
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  });
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -ry * 0.7);
  ctx.lineTo(0, ry * 0.7);
  ctx.stroke();
  ctx.restore();
}

function plant(ctx, x, y, s) {
  ctx.fillStyle = '#c4a070';
  ctx.beginPath();
  ctx.moveTo(x - 11 * s, y);
  ctx.lineTo(x + 11 * s, y);
  ctx.lineTo(x + 8 * s, y + 16 * s);
  ctx.lineTo(x - 8 * s, y + 16 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 1;
  ctx.stroke();
  oval(ctx, x, y + 4 * s, 9 * s, 3 * s, '#6a8a48');
  leaf(ctx, x - 8 * s, y - 10 * s, 8 * s, 15 * s, '#5d8a52', -0.5);
  leaf(ctx, x + 8 * s, y - 12 * s, 7 * s, 14 * s, '#4e7a48', 0.45);
  leaf(ctx, x, y - 18 * s, 6 * s, 13 * s, '#6e9a5c', 0.05);
}

function grassTuft(ctx, x, y, s) {
  ctx.strokeStyle = '#4f7a3a';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  [-1, 0, 1, 0.5, -0.4].forEach((d, i) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + d * 6 * s, y - 10 * s, x + d * 8 * s, y - (14 + i) * s);
    ctx.stroke();
  });
}

function bamboo(ctx, x, baseY, height, radius, sway) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.rotate(sway || 0);
  const segs = 5;
  const segH = height / segs;
  for (let i = 0; i < segs; i++) {
    const yy = -height + i * segH;
    const g = ctx.createLinearGradient(-radius, 0, radius, 0);
    g.addColorStop(0, '#2f5530');
    g.addColorStop(0.35, '#7aaa62');
    g.addColorStop(0.7, '#5d8f4c');
    g.addColorStop(1, '#2a4a28');
    fillRound(ctx, -radius, yy, radius * 2, segH - 3, 2, g);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillRect(-radius + 2, yy + 3, 2.4, segH - 8);
    oval(ctx, 0, yy + segH - 3, radius + 1.6, 2.6, '#243e24');
    if (i < 2) {
      const colors = ['#3f6b38', '#5d8f4c', '#4a7a3c'];
      bambooLeaf(ctx, radius - 1, yy + 6, 22 + i * 4, -0.95, colors[i % 3]);
      bambooLeaf(ctx, radius, yy + 14, 18, -0.55, colors[(i + 1) % 3]);
      bambooLeaf(ctx, -radius + 1, yy + 10, 20, 3.9, colors[(i + 2) % 3]);
    }
  }
  ctx.restore();
}

function drawHome(ctx, w, h) {
  ctx.fillStyle = '#e9dcc4';
  ctx.fillRect(0, 0, w, h);
  const wg = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  wg.addColorStop(0, '#efe4cc');
  wg.addColorStop(1, '#e2d2b4');
  ctx.fillStyle = wg;
  ctx.fillRect(0, 0, w, h * 0.62);
  paperGrain(ctx, w, h, 0.04);

  const wx = w * 0.18;
  const wy = h * 0.08;
  const ww = w * 0.64;
  const wh = h * 0.38;
  fillRound(ctx, wx - 8, wy - 8, ww + 16, wh + 16, 8, '#d7c09a');
  ctx.save();
  roundRect(ctx, wx, wy, ww, wh, 4);
  ctx.clip();
  sky(ctx, w, h, '#8ebdd8', '#c5dce8', '#dfe9c8');
  cloud(ctx, wx + ww * 0.28, wy + 22, 0.7);
  cloud(ctx, wx + ww * 0.78, wy + 16, 0.5);
  ctx.fillStyle = '#9fbe7a';
  ctx.fillRect(wx, wy + wh * 0.72, ww, wh);
  ctx.restore();
  ctx.strokeStyle = '#efe6d4';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(wx + ww / 2, wy);
  ctx.lineTo(wx + ww / 2, wy + wh);
  ctx.moveTo(wx, wy + wh / 2);
  ctx.lineTo(wx + ww, wy + wh / 2);
  ctx.stroke();
  ctx.strokeStyle = '#c4a882';
  ctx.lineWidth = 8;
  roundRect(ctx, wx - 4, wy - 4, ww + 8, wh + 8, 6);
  ctx.stroke();
  ctx.fillStyle = 'rgba(244, 236, 214, 0.55)';
  ctx.beginPath();
  ctx.moveTo(wx, wy);
  ctx.quadraticCurveTo(wx + 22, wy + wh * 0.35, wx + 6, wy + wh);
  ctx.lineTo(wx, wy + wh);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d9c4a8';
  ctx.fillRect(wx - 2, wy + 8, 10, wh - 16);
  ctx.fillRect(wx + ww - 8, wy + 8, 10, wh - 16);
  plant(ctx, wx + ww - 36, wy + wh - 6, 0.95);
  ctx.fillStyle = 'rgba(232, 196, 168, 0.78)';
  ctx.beginPath();
  ctx.moveTo(wx - 2, wy - 2);
  ctx.quadraticCurveTo(wx + ww * 0.18, wy + 8, wx + 10, wy + wh);
  ctx.lineTo(wx - 2, wy + wh);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(wx + ww + 2, wy - 2);
  ctx.quadraticCurveTo(wx + ww * 0.82, wy + 8, wx + ww - 10, wy + wh);
  ctx.lineTo(wx + ww + 2, wy + wh);
  ctx.closePath();
  ctx.fill();

  fillRound(ctx, 18, h * 0.14, 44, 36, 4, '#f3ead8');
  ctx.strokeStyle = '#c4a882';
  ctx.lineWidth = 3;
  roundRect(ctx, 18, h * 0.14, 44, 36, 4);
  ctx.stroke();
  oval(ctx, 40, h * 0.22, 12, 8, '#8aa888');
  oval(ctx, 34, h * 0.24, 6, 8, '#c4a070');

  woodFloor(ctx, h * 0.58, w, h * 0.45, '#e2ccab');
  ctx.fillStyle = '#cbb48c';
  ctx.fillRect(0, h * 0.57, w, 7);
  ctx.fillStyle = '#b89a72';
  ctx.fillRect(0, h * 0.575, w, 2);

  ctx.fillStyle = '#c45b4a';
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.82, w * 0.28, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(120, 40, 32, 0.25)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.82, w * 0.22, 10, 0, 0, Math.PI * 2);
  ctx.stroke();

  fillRound(ctx, 16, h * 0.74, 58, 18, 10, '#ead2b0');
  oval(ctx, 36, h * 0.73, 16, 8, '#e0c49a');
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(36, h * 0.73, 16, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawYard(ctx, w, h) {
  sky(ctx, w, h, '#7eb3d6', '#c5dca8', '#8bb35e');
  sun(ctx, w * 0.82, h * 0.14, 16);
  cloud(ctx, 64, 40, 1.05);
  cloud(ctx, w - 90, 32, 0.7);
  ctx.fillStyle = '#8aa86a';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.46);
  ctx.quadraticCurveTo(w * 0.25, h * 0.34, w * 0.5, h * 0.44);
  ctx.quadraticCurveTo(w * 0.78, h * 0.54, w, h * 0.4);
  ctx.lineTo(w, h * 0.58);
  ctx.lineTo(0, h * 0.58);
  ctx.fill();
  ctx.fillStyle = '#7fa85a';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.54);
  ctx.quadraticCurveTo(w * 0.4, h * 0.48, w, h * 0.56);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();
  ctx.fillStyle = '#8fba64';
  ctx.fillRect(0, h * 0.62, w, h * 0.4);
  for (let i = 0; i < 9; i++) grassTuft(ctx, 18 + i * (w / 8.5), h * 0.66 + (i % 3) * 8, 0.9);
  ctx.fillStyle = '#d7c49a';
  for (let i = 0; i < 8; i++) {
    const x = 14 + i * ((w - 28) / 7);
    fillRound(ctx, x - 4, h * 0.48, 8, h * 0.32, 2, '#d7c49a');
    ctx.strokeStyle = 'rgba(120, 90, 50, 0.25)';
    ctx.lineWidth = 1;
    roundRect(ctx, x - 4, h * 0.48, 8, h * 0.32, 2);
    ctx.stroke();
  }
  ctx.strokeStyle = '#c4a878';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(14, h * 0.54);
  ctx.lineTo(w - 14, h * 0.54);
  ctx.moveTo(14, h * 0.68);
  ctx.lineTo(w - 14, h * 0.68);
  ctx.stroke();
  oval(ctx, w * 0.22, h * 0.78, 7, 7, '#e8c45a');
  leaf(ctx, w * 0.22, h * 0.84, 4, 10, '#5d8a4a', 0.2);
  oval(ctx, w * 0.78, h * 0.8, 6, 6, '#e07a7a');
}

function drawTerrarium(ctx, w, h) {
  ctx.fillStyle = '#1c1814';
  ctx.fillRect(0, 0, w, h);
  fillRound(ctx, 10, 20, w - 20, h - 32, 10, '#3a3228');
  fillRound(ctx, 18, 32, w - 36, h - 56, 12, '#1a221c');
  const g = ctx.createLinearGradient(28, 44, w - 28, 44);
  g.addColorStop(0, 'rgba(210, 110, 48, 0.42)');
  g.addColorStop(0.45, 'rgba(214, 176, 82, 0.22)');
  g.addColorStop(1, 'rgba(70, 110, 78, 0.32)');
  ctx.fillStyle = g;
  fillRound(ctx, 26, 42, w - 52, h - 78, 10, g);
  oval(ctx, w - 64, 58, 22, 10, 'rgba(255, 180, 80, 0.35)');
  ctx.fillStyle = '#c4a06a';
  ctx.beginPath();
  ctx.moveTo(32, h - 86);
  ctx.quadraticCurveTo(w * 0.5, h - 62, w - 32, h - 90);
  ctx.lineTo(w - 32, h - 48);
  ctx.lineTo(32, h - 48);
  ctx.fill();
  ctx.fillStyle = '#b08a58';
  for (let i = 0; i < 12; i++) {
    oval(ctx, 40 + i * 24, h - 70 + (i % 3) * 4, 6, 3, i % 2 ? '#a07a4c' : '#c4a06a');
  }
  ctx.fillStyle = '#6a5038';
  ctx.beginPath();
  ctx.ellipse(72, h - 96, 26, 14, -0.2, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  plant(ctx, w - 86, h - 92, 0.7);
  oval(ctx, w - 70, h - 78, 16, 6, '#4a88a0');
  oval(ctx, w - 70, h - 80, 10, 3, '#8ec4d4');
  ctx.strokeStyle = 'rgba(240, 244, 230, 0.5)';
  ctx.lineWidth = 3;
  roundRect(ctx, 20, 34, w - 40, h - 60, 12);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(36, 48);
  ctx.lineTo(92, 48);
  ctx.lineTo(70, h - 86);
  ctx.lineTo(32, h - 86);
  ctx.fill();
  fillRound(ctx, w - 48, 46, 10, 36, 3, '#2a4a3a');
  ctx.fillStyle = '#c45b4a';
  ctx.fillRect(w - 46, 50, 6, 10);
  ctx.fillStyle = '#e8c45a';
  ctx.fillRect(w - 46, 62, 6, 8);
  ctx.fillStyle = '#6f9a6a';
  ctx.fillRect(w - 46, 72, 6, 6);
}

function drawReserve(ctx, w, h, t) {
  sky(ctx, w, h, '#c5d4c4', '#8eae86', '#4d7348');
  ctx.fillStyle = '#7a9a78';
  oval(ctx, w * 0.18, h * 0.46, 100, 36, '#7a9a78');
  oval(ctx, w * 0.78, h * 0.42, 120, 44, '#658a64');
  const sway = Math.sin((t || 0) / 900) * 0.028;
  for (let i = 0; i < 6; i++) {
    bamboo(ctx, 10 + i * (w / 5.2), h * 0.78, 90 + (i % 3) * 18, 3.2, sway * 0.4 * (i % 2 ? 1 : -1));
  }
  ctx.fillStyle = 'rgba(210, 224, 200, 0.28)';
  ctx.fillRect(0, h * 0.5, w, 40);
  for (let i = 0; i < 8; i++) {
    bamboo(ctx, 8 + i * (w / 7.4), h * 0.94, 170 + (i % 4) * 26, 5 + (i % 2), sway * (i % 2 ? 1 : -1));
  }
  ctx.fillStyle = '#4a6e3e';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.8);
  ctx.quadraticCurveTo(w * 0.4, h * 0.72, w, h * 0.82);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();
  for (let i = 0; i < 5; i++) grassTuft(ctx, 24 + i * 70, h * 0.86, 1.1);
  oval(ctx, 64, h * 0.86, 36, 8, '#5a8aaa');
  ctx.strokeStyle = 'rgba(244, 240, 220, 0.55)';
  ctx.lineWidth = 14;
  roundRect(ctx, 10, 16, w - 20, h - 26, 18);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  roundRect(ctx, 18, 24, w - 36, h - 42, 14);
  ctx.stroke();
  fillRound(ctx, w / 2 - 82, 14, 164, 22, 8, 'rgba(30, 42, 32, 0.5)');
  text(ctx, '观察窗 · 保持安全距离', w / 2, 25, 11, '#f3efe2', 'center');
}

function drawIce(ctx, w, h) {
  sky(ctx, w, h, '#b7cde0', '#e4ecee', '#c5d2d0');
  sun(ctx, w * 0.18, h * 0.14, 12);
  ctx.fillStyle = '#9aadb4';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.48);
  ctx.lineTo(w * 0.2, h * 0.2);
  ctx.lineTo(w * 0.36, h * 0.44);
  ctx.lineTo(w * 0.58, h * 0.12);
  ctx.lineTo(w * 0.78, h * 0.4);
  ctx.lineTo(w, h * 0.26);
  ctx.lineTo(w, h * 0.56);
  ctx.lineTo(0, h * 0.56);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.moveTo(w * 0.2, h * 0.2);
  ctx.lineTo(w * 0.24, h * 0.28);
  ctx.lineTo(w * 0.16, h * 0.3);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w * 0.58, h * 0.12);
  ctx.lineTo(w * 0.64, h * 0.24);
  ctx.lineTo(w * 0.5, h * 0.26);
  ctx.fill();
  ctx.fillStyle = '#eef3f4';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.8, w * 0.72, 74, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(160, 184, 196, 0.35)';
  ctx.beginPath();
  ctx.ellipse(w * 0.42, h * 0.78, 40, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6d7c82';
  ctx.beginPath();
  ctx.moveTo(w * 0.62, h * 0.6);
  ctx.lineTo(w * 0.73, h * 0.38);
  ctx.lineTo(w * 0.86, h * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8b9aa0';
  ctx.fillRect(w * 0.67, h * 0.5, 30, 30);
  ctx.fillStyle = '#c5d0d4';
  ctx.beginPath();
  ctx.moveTo(w * 0.64, h * 0.5);
  ctx.lineTo(w * 0.82, h * 0.5);
  ctx.lineTo(w * 0.73, h * 0.38);
  ctx.fill();
  oval(ctx, w * 0.74, h * 0.56, 6, 7, '#f0d48a');
  ctx.fillStyle = '#5a3a2a';
  ctx.fillRect(w * 0.78, h * 0.32, 4, 20);
  text(ctx, '研究站', w * 0.74, h * 0.66, 11, '#3a4a4e', 'center');
  ctx.fillStyle = '#8a9a72';
  for (let i = 0; i < 7; i++) {
    ctx.fillRect(22 + i * 26, h * 0.74 + (i % 2) * 6, 3, 12);
  }
}

function breath(t) {
  return 1 + Math.sin((t || 0) / 480) * 0.02;
}

function blink(t) {
  return Math.sin((t || 0) / 1600) > 0.93;
}

function eye(ctx, x, y, rx, ry, color, highlight, closed) {
  if (closed) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - rx, y);
    ctx.quadraticCurveTo(x, y + 2.4, x + rx, y);
    ctx.stroke();
    return;
  }
  oval(ctx, x, y, rx, ry, '#f7f4ea');
  oval(ctx, x, y + 0.4, rx * 0.62, ry * 0.78, color);
  oval(ctx, x - rx * 0.28, y - ry * 0.28, rx * 0.22, ry * 0.22, highlight || '#fff');
}

function whisker(ctx, x, y, side) {
  ctx.strokeStyle = 'rgba(90, 70, 50, 0.45)';
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  [0, 1, 2].forEach((i) => {
    ctx.beginPath();
    ctx.moveTo(x, y + i * 3);
    ctx.quadraticCurveTo(x + side * 16, y + i * 3 + (i - 1) * 3, x + side * 32, y + (i - 1) * 6);
    ctx.stroke();
  });
}

function drawCat(ctx, x, y, s, t, pose, pal) {
  ctx.save();
  ctx.translate(x, y + ((pose === 'eat' || pose === 'drink') ? 6 : 0));
  const tilt = pose === 'look' ? -0.08 : pose === 'play' ? 0.06 : (pose === 'eat' || pose === 'drink') ? 0.12 : 0;
  ctx.scale(s * breath(t), s);
  ctx.rotate(tilt);
  shadow(ctx, 0, 42, 34, 8);
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(20, 8);
  ctx.quadraticCurveTo(pose === 'play' ? 48 : 40, pose === 'play' ? -10 : 18, 28, 32);
  ctx.stroke();
  const body = () => ctx.ellipse(0, 22, 30, 18, 0, 0, Math.PI * 2);
  fillP(ctx, pal.body, body);
  shadeInside(ctx, body);
  oval(ctx, 0, 24, 12, 10, pal.patch);
  ctx.strokeStyle = pal.stripe || pal.accent;
  ctx.lineWidth = 2.2;
  ctx.globalAlpha = 0.4;
  [[-16, 14, -8, 28], [16, 12, 8, 26]].forEach((l) => {
    ctx.beginPath();
    ctx.moveTo(l[0], l[1]);
    ctx.quadraticCurveTo((l[0] + l[2]) / 2, (l[1] + l[3]) / 2, l[2], l[3]);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  fillP(ctx, pal.body, () => {
    ctx.moveTo(-18, -6);
    ctx.quadraticCurveTo(-14, -28, -2, -8);
    ctx.quadraticCurveTo(-12, -4, -18, -6);
  });
  fillP(ctx, pal.body, () => {
    ctx.moveTo(4, -8);
    ctx.quadraticCurveTo(16, -30, 18, -4);
    ctx.quadraticCurveTo(10, -6, 4, -8);
  });
  oval(ctx, -11, -14, 2.6, 5, pal.inner || '#f0c2b0');
  oval(ctx, 13, -16, 2.6, 5, pal.inner || '#f0c2b0');
  const head = () => ctx.ellipse(0, -2, 18, 15, 0, 0, Math.PI * 2);
  fillP(ctx, pal.body, head);
  shadeInside(ctx, head);
  ctx.strokeStyle = pal.stripe || pal.accent;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-6, -12);
  ctx.lineTo(-2, -4);
  ctx.lineTo(0, -10);
  ctx.lineTo(2, -4);
  ctx.lineTo(6, -12);
  ctx.stroke();
  const closed = blink(t);
  almondEye(ctx, -7, -4, 5, 3.8, pal.eye, '#fff', closed);
  almondEye(ctx, 7, -4, 5, 3.8, pal.eye, '#fff', closed);
  oval(ctx, -8, 2, 3.5, 1.8, 'rgba(232, 140, 140, 0.35)');
  oval(ctx, 8, 2, 3.5, 1.8, 'rgba(232, 140, 140, 0.35)');
  ctx.fillStyle = '#e08a7a';
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.lineTo(-3, 7);
  ctx.lineTo(3, 7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(0, 7);
  ctx.lineTo(0, 10);
  ctx.moveTo(0, 9);
  ctx.quadraticCurveTo(-5, 12, -8, 10);
  ctx.moveTo(0, 9);
  ctx.quadraticCurveTo(5, 12, 8, 10);
  ctx.stroke();
  whisker(ctx, -10, 6, -1);
  whisker(ctx, 10, 6, 1);
  blobFill(ctx, -12, 36, 8, 5, pal.patch, 0.1);
  blobFill(ctx, 12, 36, 8, 5, pal.patch, -0.1);
  if (pose === 'play') blobFill(ctx, 26, 4, 6, 4.5, pal.patch, 0.35);
  ctx.restore();
}

function drawDog(ctx, x, y, s, t, pose, pal) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * breath(t), s);
  shadow(ctx, 2, 58, 34, 8);
  ctx.strokeStyle = pal.body;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  const wag = Math.sin((t || 0) / 180) * (pose === 'play' ? 18 : 7);
  ctx.beginPath();
  ctx.moveTo(-22, 14);
  ctx.quadraticCurveTo(-50, wag - 6, -30, 34);
  ctx.stroke();
  blobFill(ctx, -6, 36, 15, 18, pal.body, 0.18);
  blobFill(ctx, 16, 36, 13, 16, pal.body, -0.12);
  fillP(ctx, pal.body, () => {
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(30, 8, 28, 42, 4, 50);
    ctx.bezierCurveTo(-28, 44, -26, 6, 0, 4);
  });
  oval(ctx, 2, 24, 12, 13, pal.patch);
  blobFill(ctx, -10, 4, 8, 16, pal.accent, 0.55);
  blobFill(ctx, 20, 2, 8, 16, pal.accent, -0.42);
  fillP(ctx, pal.body, () => ctx.ellipse(6, -8, 18, 16, -0.08, 0, Math.PI * 2));
  blobFill(ctx, 22, 4, 13, 8, pal.patch, 0.28);
  blobFill(ctx, 34, 6, 7, 5, pal.body, 0.2);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.ellipse(6, -8, 18, 16, -0.08, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.bezierCurveTo(30, 8, 28, 42, 4, 50);
  ctx.bezierCurveTo(-28, 44, -26, 6, 0, 4);
  ctx.stroke();
  const closed = blink(t);
  almondEye(ctx, 4, -10, 4.4, 3.6, pal.eye, '#fff', closed);
  almondEye(ctx, 16, -9, 4.4, 3.6, pal.eye, '#fff', closed);
  oval(ctx, 36, 6, 3.4, 2.5, '#2a1c14');
  oval(ctx, 6, -2, 4, 2, 'rgba(232, 140, 140, 0.28)');
  if (pose === 'play') {
    ctx.fillStyle = '#e07a7a';
    ctx.beginPath();
    ctx.ellipse(26, 14, 4, 8, 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#5a7a9a';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.arc(6, 12, 14, 0.15, Math.PI - 0.15);
  ctx.stroke();
  oval(ctx, 6, 26, 4.2, 4.2, THEME.brass);
  blobFill(ctx, -8, 50, 8, 6, pal.patch, 0.1);
  blobFill(ctx, 16, 50, 8, 6, pal.patch, -0.1);
  ctx.restore();
}

function drawGecko(ctx, x, y, s, t, pose, pal) {
  ctx.save();
  ctx.translate(x, y + 10);
  ctx.scale(s, s);
  ctx.rotate(pose === 'look' ? -0.18 : -0.06);
  shadow(ctx, 8, 26, 40, 7);
  const tailLift = pose === 'look' ? -16 : 6;
  ctx.strokeStyle = pal.body;
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(10, 6);
  ctx.quadraticCurveTo(32, tailLift, 64, 12);
  ctx.stroke();
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 11;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.moveTo(20, 6);
  ctx.lineTo(28, 6);
  ctx.moveTo(38, 6);
  ctx.lineTo(46, 8);
  ctx.moveTo(54, 10);
  ctx.lineTo(60, 11);
  ctx.stroke();
  ctx.globalAlpha = 1;
  fillP(ctx, pal.body, () => ctx.ellipse(2, 6, 26, 11, 0.06, 0, Math.PI * 2));
  fillP(ctx, pal.body, () => ctx.ellipse(-24, 0, 15, 11, -0.2, 0, Math.PI * 2));
  oval(ctx, 2, 10, 14, 5, pal.patch);
  const spots = [[-8, 2], [4, 6], [16, 2], [28, 8], [40, 4], [10, -2], [22, 12], [-20, 4], [-12, -4]];
  spots.forEach((p) => blob(ctx, p[0], p[1], 3.4, 2.6, pal.accent, p[0] * 0.02));
  ctx.strokeStyle = pal.body;
  ctx.lineWidth = 4.4;
  ctx.lineCap = 'round';
  [[-12, 14, -20, 22], [2, 16, 8, 24], [16, 16, 10, 24], [28, 14, 36, 22]].forEach((l) => {
    ctx.beginPath();
    ctx.moveTo(l[0], l[1]);
    ctx.lineTo(l[2], l[3]);
    ctx.stroke();
    blobFill(ctx, l[2], l[3], 4.4, 2.2, pal.patch, 0);
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 1;
    [-2, 0, 2].forEach((dx) => {
      ctx.beginPath();
      ctx.moveTo(l[2] + dx, l[3] + 1);
      ctx.lineTo(l[2] + dx * 1.6, l[3] + 4);
      ctx.stroke();
    });
    ctx.strokeStyle = pal.body;
    ctx.lineWidth = 4.4;
  });
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(-24, 0, 15, 11, -0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(2, 6, 26, 11, 0.06, 0, Math.PI * 2);
  ctx.stroke();
  almondEye(ctx, -28, -4, 5, 4.5, pal.eye, '#f4e8c8', false);
  oval(ctx, -22, 4, 3.2, 2.2, '#c45c4a');
  ctx.restore();
}

function drawPanda(ctx, x, y, s, t, pose, pal) {
  ctx.save();
  ctx.translate(x, y + (pose === 'climb' ? -16 : 0));
  ctx.scale(s * breath(t), s);
  if (pose === 'look') ctx.rotate(-0.08);
  if (pose === 'climb') {
    fillRound(ctx, -20, -78, 24, 140, 8, '#6a4a32');
    bambooLeaf(ctx, 8, -76, 22, -0.7, '#3f6b38');
    bambooLeaf(ctx, 10, -68, 18, -0.3, '#4a7a3c');
  }
  shadow(ctx, 0, 46, 36, 9);
  blobFill(ctx, -18, 32, 11, 14, pal.accent, 0.1);
  blobFill(ctx, 18, 32, 11, 14, pal.accent, -0.1);
  const body = () => ctx.ellipse(0, 16, 30, 22, 0, 0, Math.PI * 2);
  fillP(ctx, pal.body, body);
  shadeInside(ctx, body);
  blobFill(ctx, -22, 10, 11, 14, pal.accent, 0.35);
  blobFill(ctx, 22, 12, 11, 14, pal.accent, -0.3);
  fillP(ctx, pal.body, () => ctx.arc(0, -14, 20, 0, Math.PI * 2));
  fillP(ctx, pal.accent, () => ctx.arc(-15, -30, 7.5, 0, Math.PI * 2));
  fillP(ctx, pal.accent, () => ctx.arc(15, -30, 7.5, 0, Math.PI * 2));
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.ellipse(-9, -16, 9, 7.2, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(9, -16, 9, 7.2, 0.4, 0, Math.PI * 2);
  ctx.fill();
  const closed = blink(t) || pose === 'eat';
  almondEye(ctx, -9, -16, 3.8, 3.2, '#111', '#fff', closed);
  almondEye(ctx, 9, -16, 3.8, 3.2, '#111', '#fff', closed);
  oval(ctx, 0, -8, 7, 5, pal.body);
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-2.6, -5);
  ctx.lineTo(2.6, -5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.quadraticCurveTo(-4, -1, -7, -2);
  ctx.moveTo(0, -5);
  ctx.quadraticCurveTo(4, -1, 7, -2);
  ctx.stroke();
  if (pose === 'eat') {
    ctx.strokeStyle = '#5d8a4a';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(8, 4);
    ctx.lineTo(6, 32);
    ctx.stroke();
    bambooLeaf(ctx, 16, 8, 16, 0.35, '#4a7a3c');
    blobFill(ctx, 10, 10, 8, 6, pal.body, 0);
  }
  ctx.restore();
}

function drawMammoth(ctx, x, y, s, t, pose, pal) {
  ctx.save();
  ctx.translate(x, y + 6);
  ctx.scale(s * breath(t), s);
  shadow(ctx, 0, 52, 46, 10);
  blobFill(ctx, -28, 36, 8, 18, pal.patch, 0.05);
  blobFill(ctx, 6, 36, 8, 18, pal.patch, 0);
  blobFill(ctx, 24, 34, 7, 16, pal.patch, 0);
  fillP(ctx, pal.body, () => {
    ctx.moveTo(-40, 8);
    ctx.bezierCurveTo(-48, -18, -10, -28, 8, -16);
    ctx.bezierCurveTo(28, -8, 48, -2, 44, 10);
    ctx.bezierCurveTo(40, 28, 20, 32, -8, 30);
    ctx.bezierCurveTo(-36, 28, -42, 20, -40, 8);
  });
  blob(ctx, -10, 4, 28, 16, pal.patch || '#6e442c', 0.08);
  ctx.strokeStyle = pal.patch;
  ctx.lineWidth = 2.4;
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 11; i++) {
    ctx.beginPath();
    ctx.moveTo(-38 + i * 7, 16);
    ctx.quadraticCurveTo(-34 + i * 7, 28, -36 + i * 7, 34);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  fillP(ctx, pal.body, () => ctx.ellipse(30, -6, 16, 14, 0.2, 0, Math.PI * 2));
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-40, 8);
  ctx.bezierCurveTo(-48, -18, -10, -28, 8, -16);
  ctx.bezierCurveTo(28, -8, 48, -2, 44, 10);
  ctx.bezierCurveTo(40, 28, 20, 32, -8, 30);
  ctx.bezierCurveTo(-36, 28, -42, 20, -40, 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(30, -6, 16, 14, 0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(40, 6);
  ctx.quadraticCurveTo(60, 30, 44, 48);
  ctx.stroke();
  oval(ctx, 44, 48, 5, 4, pal.accent);
  ctx.strokeStyle = '#efe4c8';
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.moveTo(36, 6);
  ctx.quadraticCurveTo(70, 10, 58, -8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(36, 10);
  ctx.quadraticCurveTo(66, 24, 52, 6);
  ctx.stroke();
  blobFill(ctx, 26, -10, 7, 9, pal.body, 0.45);
  almondEye(ctx, 36, -10, 4, 3.4, pal.eye, '#fff', blink(t));
  ctx.strokeStyle = pal.patch;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-42, 2);
  ctx.quadraticCurveTo(-56, -10, -48, 10);
  ctx.stroke();
  ctx.restore();
}

function drawFurniture(ctx, w, h, sceneId, list) {
  const items = list || [];
  items.forEach((id, i) => {
    const x = 24 + (i % 4) * (w / 5);
    const y = h * 0.84;
    if (id === 'cushion') {
      fillRound(ctx, x, y, 44, 16, 8, '#ead2b0');
      oval(ctx, x + 22, y + 4, 16, 6, '#e0c49a');
      ctx.strokeStyle = INK_SOFT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x + 22, y + 4, 16, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (id === 'bowl' || id === 'water_bowl' || id === 'water_dish') {
      const water = id.indexOf('water') >= 0;
      oval(ctx, x + 14, y + 6, 14, 6, '#d8b48a');
      oval(ctx, x + 14, y + 5, 10, 4, water ? '#7aa0c4' : '#c4a06a');
    } else if (id === 'toy') {
      oval(ctx, x + 12, y + 2, 9, 9, '#c45c4a');
      ctx.strokeStyle = '#f3efe2';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x + 12, y + 2, 5, 0, Math.PI * 1.4);
      ctx.stroke();
    } else if (id === 'bamboo_ball') {
      oval(ctx, x + 12, y + 2, 12, 12, '#7a9a58');
      ctx.strokeStyle = '#3f6b38';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + 12, y + 2, 12, 0, Math.PI * 2);
      ctx.stroke();
    } else if (id === 'lookout') {
      fillRound(ctx, x, y - 16, 40, 22, 6, 'rgba(244,240,220,0.4)');
      ctx.strokeStyle = 'rgba(244,240,220,0.7)';
      ctx.lineWidth = 2;
      roundRect(ctx, x + 4, y - 12, 32, 14, 4);
      ctx.stroke();
    }
  });
}

function drawBootArt(ctx, w, h, t) {
  if (sprites.drawScene(ctx, 'reserve', w, h)) {
    sprites.drawAnimal(ctx, 'panda', w / 2, h * 0.56, 1.55, t, 'idle_stand');
    return;
  }
  sky(ctx, w, h, '#c3d2b6', '#e4dcc0', '#cbb894');
  paperGrain(ctx, w, h, 0.08);
  ctx.fillStyle = '#7d9a78';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.44);
  ctx.quadraticCurveTo(w * 0.22, h * 0.32, w * 0.48, h * 0.42);
  ctx.quadraticCurveTo(w * 0.72, h * 0.5, w, h * 0.36);
  ctx.lineTo(w, h * 0.62);
  ctx.lineTo(0, h * 0.62);
  ctx.fill();
  const sway = Math.sin((t || 0) / 1100) * 0.03;
  bamboo(ctx, 28, h * 0.7, 220, 7, 0.05 + sway);
  bamboo(ctx, 64, h * 0.74, 170, 5, 0.02);
  bamboo(ctx, w - 28, h * 0.72, 200, 6, -0.04 - sway);
  bamboo(ctx, w - 70, h * 0.76, 150, 4.5, -0.02);
  ctx.fillStyle = '#5a7a48';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.62);
  ctx.quadraticCurveTo(w * 0.5, h * 0.54, w, h * 0.64);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();
  for (let i = 0; i < 6; i++) grassTuft(ctx, 20 + i * 62, h * 0.66, 1.15);
  drawPanda(ctx, w / 2, h * 0.58, 1.42, t, 'idle_stand', {
    body: '#f4f1ea',
    accent: '#1a1a1a',
    patch: '#1a1a1a',
    eye: '#111'
  });
}

function drawSpeciesCard(ctx, x, y, w, h, speciesId, pal, t) {
  fillRound(ctx, x, y, w, h, 22, '#f6f0e4');
  ctx.strokeStyle = 'rgba(90, 70, 40, 0.12)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 22);
  ctx.stroke();
  ctx.save();
  roundRect(ctx, x + 10, y + 10, w - 20, h - 62, 16);
  ctx.clip();
  ctx.translate(x + 10, y + 10);
  const sceneId = speciesId === 'dog' ? 'yard' : 'home';
  if (!sprites.drawScene(ctx, sceneId, w - 20, h - 62)) {
    if (speciesId === 'dog') drawYard(ctx, w - 20, h - 62, t);
    else drawHome(ctx, w - 20, h - 62, t);
  }
  ctx.restore();
  DRAW_ANIMAL[speciesId](ctx, x + w / 2, y + (h - 54) * 0.68, 1.05, t, 'idle_stand', pal);
}

function withSpriteAnimal(id, fallback) {
  return function (ctx, x, y, s, t, pose, pal) {
    if (sprites.drawAnimal(ctx, id, x, y, s, t, pose)) return;
    fallback(ctx, x, y, s, t, pose, pal);
  };
}

function withSpriteScene(id, fallback) {
  return function (ctx, w, h, t) {
    if (sprites.drawScene(ctx, id, w, h)) {
      if (id === 'reserve') {
        fillRound(ctx, w / 2 - 82, 14, 164, 22, 8, 'rgba(30, 42, 32, 0.5)');
        text(ctx, '观察窗 · 保持安全距离', w / 2, 25, 11, '#f3efe2', 'center');
      }
      return;
    }
    fallback(ctx, w, h, t);
  };
}

const DRAW_ANIMAL = {
  cat: withSpriteAnimal('cat', drawCat),
  dog: withSpriteAnimal('dog', drawDog),
  gecko: withSpriteAnimal('gecko', drawGecko),
  panda: withSpriteAnimal('panda', drawPanda),
  mammoth: withSpriteAnimal('mammoth', drawMammoth)
};

const DRAW_SCENE = {
  home: withSpriteScene('home', drawHome),
  yard: withSpriteScene('yard', drawYard),
  terrarium: withSpriteScene('terrarium', drawTerrarium),
  reserve: withSpriteScene('reserve', drawReserve),
  ice: withSpriteScene('ice', drawIce)
};

module.exports = {
  roundRect,
  fillRound,
  text,
  wrapText,
  stamp,
  specimenTag,
  drawButton,
  drawFurniture,
  drawBootArt,
  drawSpeciesCard,
  paperBg,
  DRAW_ANIMAL,
  DRAW_SCENE
};

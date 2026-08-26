const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DENY = [
  'requestMidasPayment',
  'wx.requestPayment',
  'requestPayment',
  'midasBuyGoods',
  '虚拟币充值',
  'rmbPrice',
  'skuId',
  'paySku'
];

function walk(dir, acc) {
  fs.readdirSync(dir).forEach((name) => {
    if (name === 'node_modules' || name === '.git' || name === 'tests') return;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(js|json)$/.test(name)) acc.push(p);
  });
  return acc;
}

test('shipping js has no payment interface or sku fields', () => {
  const files = walk(path.join(ROOT, 'js'), []);
  const game = path.join(ROOT, 'game.js');
  if (fs.existsSync(game)) files.push(game);
  files.forEach((file) => {
    const text = fs.readFileSync(file, 'utf8');
    DENY.forEach((token) => {
      assert.equal(text.indexOf(token), -1, file + ' contains ' + token);
    });
  });
});

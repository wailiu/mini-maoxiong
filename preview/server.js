const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = 8765;

function resolveFrom(from, req) {
  let p = path.normalize(path.join(path.dirname(from), req));
  if (!p.endsWith('.js')) p += '.js';
  return p;
}

function bundle(entry) {
  const modules = new Map();
  function load(file) {
    if (modules.has(file)) return;
    const src = fs.readFileSync(file, 'utf8');
    modules.set(file, src);
    const re = /require\(['"](\.[^'"]+)['"]\)/g;
    let m;
    while ((m = re.exec(src))) load(resolveFrom(file, m[1]));
  }
  load(entry);
  let out = 'const __mods={};function require(id){const m=__mods[id];if(!m)throw new Error("mod "+id);if(!m.l){m.l=1;m.f(require,m,m.exports);}return m.exports;}\n';
  modules.forEach((src, file) => {
    const rewritten = src.replace(/require\(['"](\.[^'"]+)['"]\)/g, (_, r) => {
      return 'require(' + JSON.stringify(resolveFrom(file, r)) + ')';
    });
    out += '__mods[' + JSON.stringify(file) + ']={exports:{},l:0,f:function(require,module,exports){\n' + rewritten + '\n}};\n';
  });
  out += 'require(' + JSON.stringify(entry) + ');\n';
  return out;
}

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <title>云畔手记</title>
  <style>
    html,body{margin:0;height:100%;background:#14201c;display:flex;align-items:center;justify-content:center;}
    canvas{touch-action:none;background:#14201c;border-radius:24px;box-shadow:0 20px 60px rgba(0,0,0,.35);}
  </style>
</head>
<body>
  <canvas id="game"></canvas>
  <script>window.__YUNPAN_CANVAS__=document.getElementById('game');</script>
  <script src="/bundle.js"></script>
</body>
</html>`;

const TYPES = {
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/bundle.js') {
    try {
      const js = bundle(path.join(ROOT, 'game.js'));
      res.writeHead(200, { 'Content-Type': TYPES['.js'], 'Cache-Control': 'no-store' });
      res.end(js);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(String(e && e.stack || e));
    }
    return;
  }
  if (url.startsWith('/images/')) {
    const file = path.normalize(path.join(ROOT, url.replace(/^\/+/, '')));
    if (file.indexOf(ROOT + path.sep) !== 0 || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404);
      res.end('missing');
      return;
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

server.listen(PORT, () => {
  console.log('preview http://127.0.0.1:' + PORT);
});

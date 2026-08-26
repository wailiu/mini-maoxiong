function bindCanvasSize(canvas, width, height, dpr) {
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function createWxPlatform() {
  const canvas = wx.createCanvas();
  const sys = wx.getSystemInfoSync();
  const dpr = sys.pixelRatio || 1;
  const width = sys.windowWidth;
  const height = sys.windowHeight;
  const ctx = bindCanvasSize(canvas, width, height, dpr);
  return {
    kind: 'wx',
    canvas,
    ctx,
    width,
    height,
    dpr,
    statusBar: sys.statusBarHeight || 20,
    now: () => Date.now(),
    onTap(fn) {
      wx.onTouchStart((e) => {
        const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
        if (t) fn(t.clientX, t.clientY);
      });
    },
    requestFrame(cb) {
      const raf = (typeof requestAnimationFrame === 'function' && requestAnimationFrame)
        || (canvas.requestAnimationFrame && canvas.requestAnimationFrame.bind(canvas));
      return raf(cb);
    },
    getStorage(k) {
      return wx.getStorageSync(k);
    },
    setStorage(k, v) {
      wx.setStorageSync(k, v);
    },
    removeStorage(k) {
      wx.removeStorageSync(k);
    },
    share(opts) {
      if (typeof wx.shareAppMessage === 'function') wx.shareAppMessage(opts || {});
    },
    isDev() {
      try {
        return wx.getAccountInfoSync().miniProgram.envVersion !== 'release';
      } catch (e) {
        return true;
      }
    },
    snapshot(cb) {
      if (!canvas.toTempFilePath) {
        cb(null);
        return;
      }
      canvas.toTempFilePath({
        success: (r) => cb(r.tempFilePath),
        fail: () => cb(null)
      });
    }
  };
}

function createBrowserPlatform(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const maxW = Math.min(430, window.innerWidth);
  const width = maxW;
  const height = Math.min(window.innerHeight, Math.round(maxW * 2.05));
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const ctx = bindCanvasSize(canvas, width, height, dpr);
  const store = window.localStorage;
  return {
    kind: 'browser',
    canvas,
    ctx,
    width,
    height,
    dpr,
    statusBar: 18,
    now: () => Date.now(),
    onTap(fn) {
      canvas.addEventListener('pointerdown', (e) => {
        const rect = canvas.getBoundingClientRect();
        fn(e.clientX - rect.left, e.clientY - rect.top);
      });
    },
    requestFrame(cb) {
      return window.requestAnimationFrame(cb);
    },
    getStorage(k) {
      return store.getItem(k);
    },
    setStorage(k, v) {
      store.setItem(k, v);
    },
    removeStorage(k) {
      store.removeItem(k);
    },
    share() {},
    isDev() {
      return true;
    },
    snapshot(cb) {
      cb(canvas.toDataURL('image/png'));
    }
  };
}

function createPlatform() {
  if (typeof wx !== 'undefined' && typeof wx.createCanvas === 'function') {
    return createWxPlatform();
  }
  if (typeof window !== 'undefined') {
    const el = window.__YUNPAN_CANVAS__ || document.getElementById('game');
    if (!el) throw new Error('missing canvas');
    return createBrowserPlatform(el);
  }
  return null;
}

module.exports = { createPlatform };

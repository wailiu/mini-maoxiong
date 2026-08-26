const KEY = 'yunpan-save';

function loadSave(platform) {
  try {
    const raw = platform.getStorage(KEY);
    if (!raw) return null;
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!data || data.version !== 1) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function writeSave(platform, state) {
  try {
    platform.setStorage(KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    return false;
  }
}

function clearSave(platform) {
  try {
    platform.removeStorage(KEY);
  } catch (e) {}
}

module.exports = { KEY, loadSave, writeSave, clearSave };

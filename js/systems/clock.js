function pad(n) {
  return n < 10 ? '0' + n : String(n);
}

function dateKey(ts) {
  const d = new Date(ts);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function weekKey(ts) {
  const d = new Date(ts);
  const utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const day = new Date(utc).getUTCDay() || 7;
  const thursday = new Date(utc);
  thursday.setUTCDate(thursday.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7);
  return thursday.getUTCFullYear() + '-W' + pad(week);
}

function addDays(ts, days) {
  return ts + days * 86400000;
}

module.exports = { dateKey, weekKey, addDays };

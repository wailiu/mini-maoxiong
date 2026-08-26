const path = require('path');
const { spawnSync } = require('child_process');
const r = spawnSync(process.execPath, ['--test', path.join(__dirname, '../tests/payment-scan.test.js')], { stdio: 'inherit' });
process.exit(r.status || 0);

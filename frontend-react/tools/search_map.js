const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'build_local', 'static', 'js', 'main.12350cf5.js.map');
const pattern = process.argv[2] || 'useAuth';

if (!fs.existsSync(file)) {
  console.error('map not found:', file);
  process.exit(1);
}

const data = fs.readFileSync(file, 'utf8');
let idx = data.indexOf(pattern);
let printed = 0;
while (idx !== -1 && printed < 20) {
  const start = Math.max(0, idx - 80);
  const end = Math.min(data.length, idx + 80);
  console.log('--- MATCH ---');
  console.log(data.slice(start, end));
  idx = data.indexOf(pattern, idx + 1);
  printed++;
}
if (printed === 0) console.log('No matches');

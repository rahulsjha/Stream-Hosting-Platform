const fs = require('fs');
const path = require('path');
const file = process.argv[2];
const line = parseInt(process.argv[3], 10) || 1;
const ctx = parseInt(process.argv[4], 10) || 4;
if (!file) { console.error('Usage: node show_lines.js <file> <line> [ctx]'); process.exit(2); }
const full = path.resolve(__dirname, '..', file);
if (!fs.existsSync(full)) { console.error('File not found:', full); process.exit(1); }
const data = fs.readFileSync(full, 'utf8').split('\n');
const start = Math.max(0, line - ctx - 1);
const end = Math.min(data.length, line + ctx);
for (let i = start; i < end; i++) {
  const prefix = (i+1 === line) ? '>>' : '  ';
  console.log(prefix + ' ' + String(i+1).padStart(4) + ': ' + data[i]);
}

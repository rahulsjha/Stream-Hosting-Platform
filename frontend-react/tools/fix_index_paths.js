const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'build');
const dest = path.resolve(__dirname, '..', 'build_local');

function copyRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    console.error('Source build directory missing:', srcDir);
    process.exit(1);
  }
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
  }
  fs.mkdirSync(destDir);
  const items = fs.readdirSync(srcDir);
  for (const item of items) {
    const s = path.join(srcDir, item);
    const d = path.join(destDir, item);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

copyRecursive(src, dest);

const indexPath = path.join(dest, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/src=\"\//g, 'src="./');
html = html.replace(/href=\"\//g, 'href="./');
html = html.replace(/href=\'\//g, "href='./");
html = html.replace(/src=\'\//g, "src='./");
fs.writeFileSync(indexPath, html, 'utf8');
console.log('Copied build to build_local and fixed index.html');

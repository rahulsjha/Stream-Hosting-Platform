const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  page.on('console', (msg) => {
    console.log('PAGE LOG:', msg.type(), msg.text());
  });

  page.on('pageerror', (err) => {
    console.error('PAGE ERROR:', err.stack || err.toString());
  });

  const target = process.env.TARGET_URL || 'http://localhost:3003';
  try {
    await page.goto(target, { waitUntil: 'networkidle2', timeout: 30000 });
    // Wait a bit for runtime errors to appear
    await new Promise((r) => setTimeout(r, 5000));
  } catch (err) {
    console.error('Navigation failed:', err && err.message);
  } finally {
    await browser.close();
  }

  process.exit(0);
})();

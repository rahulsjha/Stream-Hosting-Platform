const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // If provided, set auth tokens before any script runs so the app
  // initializes as an authenticated session.
  const injectedToken = process.env.SIL_TOKEN;
  const injectedUsername = process.env.SIL_USERNAME;
  if (injectedToken || injectedUsername) {
    await page.evaluateOnNewDocument((token, username) => {
      try {
        if (token) localStorage.setItem('sil_token', token);
        if (username) localStorage.setItem('sil_username', username);
      } catch (e) {
        // ignore
      }
    }, injectedToken, injectedUsername);
  }

  page.on('console', (msg) => {
    console.log('PAGE LOG:', msg.type(), msg.text());
  });

  page.on('pageerror', (err) => {
    console.error('PAGE ERROR:', err.stack || err.toString());
  });

  const target = process.env.TARGET_URL || 'https://sil-frontend-308720634926.us-central1.run.app';
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

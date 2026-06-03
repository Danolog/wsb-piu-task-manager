import { chromium } from '@playwright/test';

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error('Usage: node verify-load.mjs <url> [url...]');
  process.exit(2);
}

let anyFail = false;

for (const url of targets) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  console.log(`\n=== ${url} ===`);
  const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('HTTP status:', resp ? resp.status() : 'no-response');

  // Daj appce chwilę na hydrację/render po networkidle.
  await page.waitForTimeout(1500);

  // Vite error overlay to custom element <vite-error-overlay> w shadow DOM.
  const overlayCount = await page.locator('vite-error-overlay').count();
  console.log('Vite error overlay obecne:', overlayCount > 0 ? 'TAK (BŁĄD)' : 'nie');

  const rootHtmlLen = await page.evaluate(() => {
    const r = document.getElementById('root');
    return r ? r.innerHTML.length : -1;
  });
  console.log('#root innerHTML length:', rootHtmlLen);

  const bodyText = (await page.evaluate(() => document.body.innerText || '')).trim();
  console.log('Widoczny tekst (pierwsze 200 zn.):', JSON.stringify(bodyText.slice(0, 200)));

  const title = await page.title();
  console.log('document.title:', JSON.stringify(title));

  if (consoleErrors.length) console.log('Console errors:', consoleErrors);
  else console.log('Console errors: brak');
  if (pageErrors.length) console.log('Page errors:', pageErrors);
  else console.log('Page errors: brak');

  const ok =
    (resp ? resp.status() === 200 : false) &&
    overlayCount === 0 &&
    rootHtmlLen > 50 &&
    pageErrors.length === 0;
  console.log('WYNIK:', ok ? 'PASS' : 'FAIL');
  if (!ok) anyFail = true;

  await browser.close();
}

process.exit(anyFail ? 1 : 0);

// Jednorazowy runner Lighthouse. Seeduje localStorage na stronie puppeteer,
// a następnie audytuje przez lighthouse `navigation(page, {...})` z wyłączonym
// resetem storage — inaczej /dzis i /wszystkie redirectują na /onboarding
// (brak imienia po wyczyszczeniu storage). Wymaga preview na :4173. Nie-CI.
import puppeteer from 'puppeteer-core';
import { navigation } from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';

const ORIGIN = 'http://localhost:4173';
const STORAGE_KEY = 'wsb-piu-task-manager:state';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const SEED = {
  schemaVersion: 2,
  tasks: {
    t1: {
      id: 't1',
      title: 'Zadanie na dziś',
      priority: 'high',
      status: 'todo',
      dueDate: new Date().toISOString().slice(0, 10),
      categoryId: 'cat-studia',
      createdAt: '2026-06-01T08:00:00.000Z',
      updatedAt: '2026-06-01T08:00:00.000Z',
    },
    t2: {
      id: 't2',
      title: 'Zadanie pilne',
      priority: 'urgent',
      status: 'todo',
      categoryId: 'cat-praca',
      createdAt: '2026-06-01T09:00:00.000Z',
      updatedAt: '2026-06-01T09:00:00.000Z',
    },
  },
  categories: {
    'cat-studia': { id: 'cat-studia', name: 'Studia', color: 'category-green' },
    'cat-praca': { id: 'cat-praca', name: 'Praca', color: 'category-blue' },
  },
  user: { name: 'Ania' },
  ui: { theme: 'light' },
};

const targets = [
  ['/dzis', 'desktop'],
  ['/dzis', 'mobile'],
  ['/wszystkie', 'desktop'],
  ['/wszystkie', 'mobile'],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox'],
});

const out = [];
try {
  for (const [path, preset] of targets) {
    const page = await browser.newPage();
    // Init-script (re-odpalany przy KAŻDYM nowym dokumencie) wstrzykuje seed do
    // localStorage zanim wczyta się appka — przeżywa resety storage Lighthouse,
    // więc /dzis i /wszystkie nie redirectują na /onboarding.
    await page.evaluateOnNewDocument(
      (k, v) => {
        try {
          window.localStorage.setItem(k, v);
        } catch {
          /* origin jeszcze nie gotowy — kolejny dokument ustawi */
        }
      },
      STORAGE_KEY,
      JSON.stringify(SEED),
    );
    // Rozgrzewka origin (ustawia storage i potwierdza, że seed siedzi).
    await page.goto(`${ORIGIN}${path}`, { waitUntil: 'networkidle2' });

    // Audyt bieżącej strony bez resetu storage (requestor = undefined → audytuje
    // aktualnie załadowany URL bez ponownej zimnej nawigacji kasującej sesję).
    const result = await navigation(
      page,
      `${ORIGIN}${path}`,
      {
        config: preset === 'desktop' ? desktopConfig : undefined,
        flags: {
          disableStorageReset: true,
          onlyCategories: [
            'performance',
            'accessibility',
            'best-practices',
            'seo',
          ],
        },
      },
    );

    const lhr = result.lhr;
    const c = lhr.categories;
    if (process.env.LH_DEBUG_A11Y) {
      console.error('   finalUrl:', lhr.finalDisplayedUrl);
      const aud = lhr.audits;
      for (const ref of c.accessibility.auditRefs) {
        const a = aud[ref.id];
        if (a.score !== null && a.score < 1) {
          console.error(`A11Y FAIL [${preset} ${path}]: ${ref.id} — ${a.title}`);
          for (const item of a.details?.items ?? []) {
            console.error('   sel :', item.node?.selector);
            if (ref.id === 'color-contrast') {
              console.error('   exp :', item.node?.explanation);
            }
          }
        }
      }
    }
    out.push({
      url: path,
      preset,
      performance: Math.round(c.performance.score * 100),
      accessibility: Math.round(c.accessibility.score * 100),
      bestPractices: Math.round(c['best-practices'].score * 100),
      seo: Math.round(c.seo.score * 100),
    });
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify(out, null, 2));

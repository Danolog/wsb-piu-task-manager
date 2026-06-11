import { test, expect, type Page } from '@playwright/test';

/**
 * Audyt dostępności (a11y) przez axe-core na WSZYSTKICH 9 ekranach w obu
 * motywach (jasny + ciemny). Bramka jakości: 0 naruszeń 'serious'/'critical'.
 *
 * Wymaga @axe-core/playwright (devDependency). Brak pakietu → test.skip
 * z czytelnym komunikatem zamiast wysadzania kolekcji.
 */

type AxeBuilderCtor = new (args: { page: Page }) => {
  withTags(tags: string[]): {
    analyze(): Promise<{
      violations: Array<{ id: string; impact?: string | null; help: string }>;
    }>;
  };
};

async function loadAxeBuilder(): Promise<AxeBuilderCtor | null> {
  try {
    const mod = await import('@axe-core/playwright');
    return (mod.default ?? mod) as unknown as AxeBuilderCtor;
  } catch {
    return null;
  }
}

const SERIOUS = new Set(['serious', 'critical']);

async function expectNoSeriousViolations(page: Page) {
  const AxeBuilder = await loadAxeBuilder();
  if (!AxeBuilder) {
    test.skip(
      true,
      'Brak @axe-core/playwright — uruchom npm install -D @axe-core/playwright',
    );
    return;
  }
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const serious = results.violations.filter(
    (v) => v.impact && SERIOUS.has(v.impact),
  );
  expect(
    serious,
    serious.map((v) => `${v.id} [${v.impact}]: ${v.help}`).join('\n'),
  ).toEqual([]);
}

const STORAGE_KEY = 'wsb-piu-task-manager:state';

/**
 * Zaszczepia stan localStorage: ukończony onboarding (imię), 3 zadania (różne
 * priorytety/kategorie, jedno z terminem dziś, jedno ukończone) i wybrany motyw.
 * Daje deterministyczne, ZAPEŁNIONE ekrany niezależnie od UI.
 */
async function seed(page: Page, theme: 'light' | 'dark') {
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  await page.addInitScript(
    ({ key, isoDate, themeValue }) => {
      window.localStorage.clear();
      const state = {
        schemaVersion: 2,
        tasks: {
          t1: {
            id: 't1',
            title: 'Zadanie na dziś',
            priority: 'high',
            status: 'todo',
            dueDate: isoDate,
            categoryId: 'cat-studia',
            createdAt: '2026-06-01T08:00:00.000Z',
            updatedAt: '2026-06-01T08:00:00.000Z',
          },
          t2: {
            id: 't2',
            title: 'Zadanie ukończone',
            priority: 'low',
            status: 'done',
            categoryId: 'cat-praca',
            createdAt: '2026-06-01T09:00:00.000Z',
            updatedAt: '2026-06-01T09:00:00.000Z',
            completedAt: '2026-06-01T10:00:00.000Z',
          },
          t3: {
            id: 't3',
            title: 'Zadanie pilne',
            priority: 'urgent',
            status: 'todo',
            categoryId: 'cat-prywatne',
            createdAt: '2026-06-01T11:00:00.000Z',
            updatedAt: '2026-06-01T11:00:00.000Z',
          },
        },
        categories: {
          'cat-studia': {
            id: 'cat-studia',
            name: 'Studia',
            color: 'category-green',
          },
          'cat-praca': {
            id: 'cat-praca',
            name: 'Praca',
            color: 'category-blue',
          },
          'cat-prywatne': {
            id: 'cat-prywatne',
            name: 'Prywatne',
            color: 'category-purple',
          },
        },
        user: { name: 'Ania' },
        ui: { theme: themeValue },
      };
      window.localStorage.setItem(key, JSON.stringify(state));
    },
    { key: STORAGE_KEY, isoDate: iso, themeValue: theme },
  );
}

/** Ekrany aplikacji + opis stanu, audytowane w obu motywach. */
const SCREENS: Array<{
  name: string;
  path: string;
  ready: (p: Page) => Promise<void>;
}> = [
  {
    name: 'kokpit Dziś',
    path: '/dzis',
    ready: async (p) =>
      void (await p.getByRole('heading', { name: /Cześć/ }).waitFor()),
  },
  {
    name: 'Wszystkie (tabela/kartki)',
    path: '/wszystkie',
    ready: async (p) =>
      void (await p
        .getByRole('heading', { name: 'Wszystkie zadania' })
        .waitFor()),
  },
  {
    name: 'Ten tydzień',
    path: '/tydzien',
    ready: async (p) =>
      void (await p.getByRole('heading', { name: 'Ten tydzień' }).waitFor()),
  },
  {
    name: 'Zrobione',
    path: '/zrobione',
    ready: async (p) =>
      void (await p.getByRole('heading', { name: 'Zrobione' }).waitFor()),
  },
  {
    name: 'Nowe zadanie',
    path: '/nowe',
    ready: async (p) =>
      void (await p.getByPlaceholder('Wpisz tytuł zadania...').waitFor()),
  },
  {
    name: 'Edycja zadania',
    path: '/zadanie/t1',
    // TaskEditPage renderuje formularz w dwóch kontenerach (mobile/desktop) —
    // czekamy na widoczny (drugi w DOM jest ukryty breakpointem).
    ready: async (p) =>
      void (await p
        .getByPlaceholder('Wpisz tytuł zadania...')
        .locator('visible=true')
        .waitFor()),
  },
  {
    name: 'Szukaj',
    path: '/szukaj',
    ready: async (p) =>
      void (await p.getByRole('searchbox', { name: 'Szukaj zadań' }).waitFor()),
  },
  {
    name: 'Kategorie',
    path: '/kategorie',
    ready: async (p) =>
      void (await p.getByRole('heading', { name: 'Kategorie' }).waitFor()),
  },
  {
    name: 'Ustawienia/Ja',
    path: '/ustawienia',
    ready: async (p) =>
      void (await p.getByRole('heading', { name: 'Ustawienia' }).waitFor()),
  },
];

for (const theme of ['light', 'dark'] as const) {
  test.describe(`a11y · motyw ${theme}`, () => {
    // Wymuszamy preferencję OS zgodną z motywem (dla seeda i kontrastu).
    test.use({ colorScheme: theme });

    for (const screen of SCREENS) {
      test(`${screen.name} — 0 naruszeń serious/critical`, async ({ page }) => {
        await seed(page, theme);
        await page.goto(screen.path);
        await screen.ready(page);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expectNoSeriousViolations(page);
      });
    }

    test(`onboarding — 0 naruszeń serious/critical`, async ({ page }) => {
      // Onboarding wymaga PUSTEGO imienia → czyścimy storage i ustawiamy tylko motyw.
      await page.addInitScript(
        ({ key, themeValue }) => {
          window.localStorage.clear();
          window.localStorage.setItem(
            key,
            JSON.stringify({
              schemaVersion: 2,
              tasks: {},
              categories: {
                'cat-studia': {
                  id: 'cat-studia',
                  name: 'Studia',
                  color: 'category-green',
                },
              },
              user: { name: '' },
              ui: { theme: themeValue },
            }),
          );
        },
        { key: STORAGE_KEY, themeValue: theme },
      );
      await page.goto('/onboarding');
      await page.getByLabel('Twoje imię').waitFor();
      await expectNoSeriousViolations(page);
    });

    test(`Wszystkie — stan pusty (empty) — 0 naruszeń`, async ({ page }) => {
      // Czysty stan (0 zadań) po onboardingu → pusty stan listy.
      await page.addInitScript(
        ({ key, themeValue }) => {
          window.localStorage.clear();
          window.localStorage.setItem(
            key,
            JSON.stringify({
              schemaVersion: 2,
              tasks: {},
              categories: {},
              user: { name: 'Pusty' },
              ui: { theme: themeValue },
            }),
          );
        },
        { key: STORAGE_KEY, themeValue: theme },
      );
      await page.goto('/wszystkie');
      await page
        .getByText(/Brak zadań/)
        .first()
        .waitFor();
      await expectNoSeriousViolations(page);
    });

    test(`Wszystkie — panel filtrów otwarty — 0 naruszeń`, async ({ page }) => {
      await seed(page, theme);
      await page.goto('/wszystkie');
      await page.getByRole('heading', { name: 'Wszystkie zadania' }).waitFor();
      await page.getByRole('button', { name: /Filtruj/ }).click();
      // Panel widoczny (legenda Priorytet w popoverze).
      await page.getByText('Filtry').first().waitFor();
      await expectNoSeriousViolations(page);
    });
  });
}

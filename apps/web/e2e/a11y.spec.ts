import { test, expect, type Page } from '@playwright/test';

/**
 * Audyt dostępności (a11y) przez axe-core na głównych widokach.
 *
 * Wymaga pakietu `@axe-core/playwright` (devDependency). Jeśli pakiet nie jest
 * zainstalowany (np. środowisko bez dostępu do rejestru npm), testy SKIPują się
 * z czytelnym komunikatem zamiast wywalać cały przebieg — instalacja:
 *   npm install -D @axe-core/playwright
 *
 * Bramka jakości: 0 naruszeń o wadze 'serious' lub 'critical'.
 */

// Dynamiczny import — brak pakietu nie ma wysadzać kolekcji testów.
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
  // Czytelny raport w razie porażki: lista id + opis.
  expect(
    serious,
    serious.map((v) => `${v.id} [${v.impact}]: ${v.help}`).join('\n'),
  ).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
});

test('a11y: widok listy zadań — 0 naruszeń serious/critical', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('heading', { name: 'Lista zadań' }).waitFor();
  await expectNoSeriousViolations(page);
});

test('a11y: modal formularza — 0 naruszeń serious/critical', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: /Dodaj zadanie/ })
    .first()
    .click();
  await page.getByRole('dialog').waitFor();
  // Rozwiń „Więcej opcji", by axe ocenił też priorytet/kategorię/notatkę.
  await page.getByRole('button', { name: 'Więcej opcji' }).click();
  await expectNoSeriousViolations(page);
});

test('a11y: ustawienia — 0 naruszeń serious/critical', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('heading', { name: 'Ustawienia' }).waitFor();
  await expectNoSeriousViolations(page);
});

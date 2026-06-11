import { test, expect } from '@playwright/test';
import {
  clearStorage,
  completeOnboarding,
  addTask,
  pickTodayDate,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await clearStorage(page);
});

test('onboarding: pierwsze uruchomienie → imię → /dzis z powitaniem', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/onboarding$/);
  await completeOnboarding(page, 'Ola');
  await expect(page.getByRole('heading', { name: /Cześć, Ola/ })).toBeVisible();
});

test('dodawanie: tytuł + priorytet + termin + godzina → zadanie widoczne', async ({
  page,
}) => {
  await completeOnboarding(page);
  await page.goto('/dzis');
  await page.getByRole('button', { name: /Nowe zadanie/ }).click();
  await expect(page).toHaveURL(/\/nowe$/);

  await page
    .getByPlaceholder('Wpisz tytuł zadania...')
    .fill('Przygotować prezentację');
  await page.getByRole('radio', { name: 'Wysoki' }).click();

  // Termin = dziś; po wybraniu daty pole Godzina staje się aktywne.
  await pickTodayDate(page);
  const timeInput = page.getByLabel('Godzina');
  await expect(timeInput).toBeEnabled();
  await timeInput.fill('14:30');

  await page.getByRole('button', { name: 'Dodaj zadanie' }).click();
  await expect(page).toHaveURL(/\/wszystkie$/);
  // Desktop (projekt e2e = Desktop Chrome): lista to <table>. Kartki mobilne też
  // są w DOM (ukryte breakpointem), więc scope’ujemy do tabeli, by uniknąć
  // strict-mode (dwa dopasowania tej samej nazwy).
  await expect(
    page.getByRole('table').getByText('Przygotować prezentację', {
      exact: true,
    }),
  ).toBeVisible();

  // Termin „dziś” → zadanie pojawia się też na kokpicie.
  await page.goto('/dzis');
  await expect(
    page.getByText('Przygotować prezentację', { exact: true }),
  ).toBeVisible();
});

test('toggle + undo: odhacz na kokpicie → toast „Zadanie ukończone” → Cofnij', async ({
  page,
}) => {
  await completeOnboarding(page, 'Tester');
  // Zadanie z terminem dziś → trafia na kokpit /dzis.
  await page.goto('/nowe');
  await page.getByPlaceholder('Wpisz tytuł zadania...').fill('Odhaczyć dziś');
  await pickTodayDate(page);
  await page.getByRole('button', { name: 'Dodaj zadanie' }).click();
  await page.goto('/dzis');

  await expect(page.getByText('Odhaczyć dziś', { exact: true })).toBeVisible();
  await page
    .getByRole('checkbox', { name: /Oznacz jako wykonane/ })
    .first()
    .click();

  // Toast z akcją Cofnij (sonner).
  await expect(page.getByText('Zadanie ukończone')).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: /Oznacz jako niewykonane/ }).first(),
  ).toBeChecked();

  await page.getByRole('button', { name: 'Cofnij' }).click();
  await expect(
    page.getByRole('checkbox', { name: /Oznacz jako wykonane/ }).first(),
  ).not.toBeChecked();
});

test('edycja + usuwanie: zmień → Zapisz; potem Usuń → modal → znika', async ({
  page,
}) => {
  await completeOnboarding(page);
  await addTask(page, 'Do edycji');

  // Wejdź w edycję klikając tytuł zadania w tabeli (desktop).
  await page.getByRole('table').getByText('Do edycji', { exact: true }).click();
  await expect(page).toHaveURL(/\/zadanie\//);

  // Formularz jest w dwóch kontenerach (mobile/desktop) — bierzemy widoczny.
  const titleField = page
    .getByPlaceholder('Wpisz tytuł zadania...')
    .locator('visible=true');
  await titleField.fill('Po edycji');
  await page
    .getByRole('button', { name: 'Zapisz zmiany' })
    .locator('visible=true')
    .click();
  await expect(page).toHaveURL(/\/wszystkie$/);
  await expect(
    page.getByRole('table').getByText('Po edycji', { exact: true }),
  ).toBeVisible();

  // Usuń: wejdź ponownie → „Usuń zadanie” → modal potwierdzenia → potwierdź.
  await page.getByRole('table').getByText('Po edycji', { exact: true }).click();
  await page
    .getByRole('button', { name: 'Usuń zadanie' })
    .locator('visible=true')
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/Usunąć zadanie\?/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Usuń zadanie' }).click();
  await expect(page).toHaveURL(/\/wszystkie$/);
  await expect(
    page.getByRole('table').getByText('Po edycji', { exact: true }),
  ).toBeHidden();
});

test('kosz w wierszu tabeli (desktop): modal potwierdzenia → Usuń → toast → Cofnij przywraca', async ({
  page,
}) => {
  await completeOnboarding(page);
  await addTask(page, 'Szybkie usuwanie');

  const table = page.getByRole('table');
  await expect(
    table.getByText('Szybkie usuwanie', { exact: true }),
  ).toBeVisible();

  // Kosz po prawej w wierszu — otwiera modal potwierdzenia (spójnie z edycją),
  // dopiero „Usuń zadanie" w modalu kasuje. Undo przez toast jako bonus.
  await table
    .getByRole('button', { name: 'Usuń zadanie: Szybkie usuwanie' })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Usunąć zadanie?')).toBeVisible();
  await dialog.getByRole('button', { name: 'Usuń zadanie' }).click();
  await expect(
    page.getByRole('table').getByText('Szybkie usuwanie', { exact: true }),
  ).toBeHidden();

  // Toast „Cofnij" przywraca zadanie do listy.
  await page.getByRole('button', { name: 'Cofnij' }).click();
  await expect(
    page.getByRole('table').getByText('Szybkie usuwanie', { exact: true }),
  ).toBeVisible();
});

test('klik kosza w wierszu nie otwiera edycji (zostaje na /wszystkie)', async ({
  page,
}) => {
  await completeOnboarding(page);
  await addTask(page, 'Bez edycji');

  await page
    .getByRole('table')
    .getByRole('button', { name: 'Usuń zadanie: Bez edycji' })
    .click();

  // Klik kosza usuwa, ale NIE nawiguje na /zadanie/:id.
  await expect(page).toHaveURL(/\/wszystkie$/);
});

test('filtry: panel → filtr priorytetu → lista zawężona', async ({ page }) => {
  await completeOnboarding(page);

  await page.goto('/nowe');
  await page.getByPlaceholder('Wpisz tytuł zadania...').fill('Zadanie pilne');
  await page.getByRole('radio', { name: 'Pilny' }).click();
  await page.getByRole('button', { name: 'Dodaj zadanie' }).click();

  await page.goto('/nowe');
  await page.getByPlaceholder('Wpisz tytuł zadania...').fill('Zadanie niskie');
  await page.getByRole('radio', { name: 'Niski' }).click();
  await page.getByRole('button', { name: 'Dodaj zadanie' }).click();

  await page.goto('/wszystkie');
  const table = page.getByRole('table');
  await expect(table.getByText('Zadanie pilne')).toBeVisible();
  await expect(table.getByText('Zadanie niskie')).toBeVisible();

  // Desktop: Popover „Filtruj” → chip „pilne” (exact, by nie złapać checkboxa
  // zadania „Oznacz jako wykonane: Zadanie pilne”) → „Pokaż N”.
  await page.getByRole('button', { name: /Filtruj/ }).click();
  await page.getByRole('checkbox', { name: 'pilne', exact: true }).click();
  await page.getByRole('button', { name: /Pokaż/ }).click();

  await expect(table.getByText('Zadanie pilne')).toBeVisible();
  await expect(table.getByText('Zadanie niskie')).toBeHidden();
});

test('szukaj: /szukaj zawęża wyniki do frazy', async ({ page }) => {
  await completeOnboarding(page);
  await addTask(page, 'Kupić mleko');
  await addTask(page, 'Oddać książkę');

  await page.goto('/szukaj');
  await page.getByRole('searchbox', { name: 'Szukaj zadań' }).fill('mleko');
  await expect(page.getByText('Wyniki · 1')).toBeVisible();
  await expect(page.getByText('Kupić mleko')).toBeVisible();
  await expect(page.getByText('Oddać książkę')).toBeHidden();
});

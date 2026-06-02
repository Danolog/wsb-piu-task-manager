import { test, expect } from '@playwright/test';
import { clearStorage, completeOnboarding, addTask } from './helpers';

test.beforeEach(async ({ page }) => {
  await clearStorage(page);
});

test('przepływ klawiaturą: /nowe → autofocus tytułu → Enter zapisuje', async ({
  page,
}) => {
  await completeOnboarding(page);
  await page.goto('/nowe');

  // Pole tytułu ma autoFocus — fokus trafia do niego po wejściu na stronę.
  const titleInput = page.getByPlaceholder('Wpisz tytuł zadania...');
  await expect(titleInput).toBeFocused();

  // Wpisz tytuł i zapisz Enterem (submit formularza z pola tekstowego).
  await page.keyboard.type('Zadanie z klawiatury');
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/wszystkie$/);
  await expect(
    page.getByRole('table').getByText('Zadanie z klawiatury'),
  ).toBeVisible();
});

test('checkbox zadania przełączalny klawiaturą (Space)', async ({ page }) => {
  await completeOnboarding(page);
  await addTask(page, 'Do odhaczenia');

  // Fokus na checkbox + Space → zaznaczony.
  const checkbox = page
    .getByRole('checkbox', { name: /Oznacz jako wykonane/ })
    .first();
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(
    page.getByRole('checkbox', { name: /Oznacz jako niewykonane/ }).first(),
  ).toBeChecked();
});

test('modal potwierdzenia: Escape zamyka bez usuwania', async ({ page }) => {
  await completeOnboarding(page);
  await addTask(page, 'Zostaje');

  await page.getByRole('table').getByText('Zostaje', { exact: true }).click();
  await page
    .getByRole('button', { name: 'Usuń zadanie' })
    .locator('visible=true')
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Escape zamyka modal (Radix Dialog) — zadanie NIE jest usuwane.
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
});

test('przepływ klawiaturą: otwórz modal, wpisz tytuł, zapisz, Esc zamyka', async ({
  page,
}) => {
  await page.goto('/');

  // Otwórz modal klawiaturą: fokus na przycisk „Dodaj zadanie" + Enter.
  const addBtn = page.getByRole('button', { name: /Dodaj zadanie/ }).first();
  await addBtn.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Pole tytułu ma autoFocus — fokus trafia do niego po otwarciu (focus trap Radix).
  const titleInput = dialog.getByPlaceholder('Wpisz tytuł zadania...');
  await expect(titleInput).toBeFocused();

  // Wpisz tytuł i zapisz Enterem (submit formularza).
  await page.keyboard.type('Zadanie z klawiatury');
  await page.keyboard.press('Enter');

  await expect(dialog).toBeHidden();
  await expect(page.getByText('Zadanie z klawiatury')).toBeVisible();

  // Otwórz ponownie i zamknij Escapem (Radix Dialog obsługuje Esc gratis).
  await addBtn.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('checkbox zadania przełączalny klawiaturą (Space)', async ({ page }) => {
  await page.goto('/');

  // Dodaj zadanie (myszką dla zwięzłości — flow klawiatury pokrywa test wyżej).
  await page
    .getByRole('button', { name: /Dodaj zadanie/ })
    .first()
    .click();
  const dialog = page.getByRole('dialog');
  await dialog.getByPlaceholder('Wpisz tytuł zadania...').fill('Do odhaczenia');
  await dialog.getByRole('button', { name: 'Dodaj zadanie' }).click();
  await expect(dialog).toBeHidden();

  // Fokus na checkbox + Space → zaznaczony.
  const checkbox = page.getByRole('checkbox', { name: /Oznacz jako wykonane/ });
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(
    page.getByRole('checkbox', { name: /Oznacz jako niewykonane/ }),
  ).toBeChecked();
});

import { test, expect, type Page } from '@playwright/test';

// Czyścimy localStorage przed każdym testem — start od deterministycznego, pustego stanu.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
});

/** Dodaje zadanie przez modal (tytuł wystarcza — reszta pól opcjonalna). */
async function addTask(page: Page, title: string) {
  await page
    .getByRole('button', { name: /Dodaj zadanie/ })
    .first()
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByPlaceholder('Wpisz tytuł zadania...').fill(title);
  await dialog.getByRole('button', { name: 'Dodaj zadanie' }).click();
  await expect(dialog).toBeHidden();
}

test('happy path: dodaj -> wykonane (przekreślone) -> usuń -> cofnij', async ({
  page,
}) => {
  await page.goto('/');
  await addTask(page, 'Zadanie e2e');

  // Widoczne na liście.
  const title = page.getByText('Zadanie e2e', { exact: true });
  await expect(title).toBeVisible();

  // Oznacz wykonane → checkbox zaznaczony + tytuł przekreślony (line-through).
  await page.getByRole('checkbox', { name: /Oznacz jako wykonane/ }).click();
  await expect(
    page.getByRole('checkbox', { name: /Oznacz jako niewykonane/ }),
  ).toBeChecked();
  await expect(title).toHaveClass(/line-through/);

  // Usuń → znika, pojawia się toast „Cofnij".
  await page.getByRole('button', { name: /Usuń zadanie/ }).click();
  await expect(title).toBeHidden();

  // Cofnij → wraca z zachowanym statusem done.
  await page.getByRole('button', { name: 'Cofnij' }).click();
  await expect(title).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: /Oznacz jako niewykonane/ }),
  ).toBeChecked();
});

test('wyszukiwarka zawęża listę', async ({ page }) => {
  await page.goto('/');
  await addTask(page, 'Kupić mleko');
  await addTask(page, 'Oddać książkę');

  await expect(page.getByText('Kupić mleko')).toBeVisible();
  await expect(page.getByText('Oddać książkę')).toBeVisible();

  await page.getByRole('searchbox', { name: 'Szukaj zadań' }).fill('mleko');

  await expect(page.getByText('Kupić mleko')).toBeVisible();
  await expect(page.getByText('Oddać książkę')).toBeHidden();
});

test('filtr statusu (zakładka Zrobione) pokazuje tylko wykonane', async ({
  page,
}) => {
  await page.goto('/');
  await addTask(page, 'Niewykonane zadanie');

  await page.getByRole('tab', { name: 'Zrobione' }).click();
  await expect(page.getByText('Niewykonane zadanie')).toBeHidden();
  await expect(page.getByText('Brak wyników')).toBeVisible();
});

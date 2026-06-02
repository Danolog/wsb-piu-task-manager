import { test, expect } from '@playwright/test';

// Smoke: aplikacja startuje i pokazuje listę zadań.
// Pełny happy-path (dodaj → wykonaj → usuń) dochodzi w paczce P9.
test('strona główna renderuje nagłówek listy zadań', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Zadania' })).toBeVisible();
});

import { test, expect } from '@playwright/test';
import { clearStorage, completeOnboarding } from './helpers';

test.beforeEach(async ({ page }) => {
  await clearStorage(page);
});

test('desktop: sidebar (Widoki) — aktywny stan i przejścia', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await completeOnboarding(page);

  const nav = page.getByRole('navigation', { name: 'Widoki' });
  await expect(nav).toBeVisible();

  // Wejście domyślne = /dzis; link „Dziś” aktywny (aria-current).
  await expect(nav.getByRole('link', { name: /Dziś/ })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await nav.getByRole('link', { name: /Wszystkie/ }).click();
  await expect(page).toHaveURL(/\/wszystkie$/);
  await expect(nav.getByRole('link', { name: /Wszystkie/ })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await nav.getByRole('link', { name: /Ten tydzień/ }).click();
  await expect(page).toHaveURL(/\/tydzien$/);

  await nav.getByRole('link', { name: /Zrobione/ }).click();
  await expect(page).toHaveURL(/\/zrobione$/);
});

test('mobile: tab-bar (Dziś/Lista/Szukaj/Ja) — aktywny stan i przejścia', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await completeOnboarding(page);

  const tabbar = page.getByRole('navigation', { name: 'Nawigacja główna' });
  await expect(tabbar).toBeVisible();
  // Sidebar (Widoki) ukryty na mobile.
  await expect(page.getByRole('navigation', { name: 'Widoki' })).toBeHidden();

  await expect(tabbar.getByRole('link', { name: /Dziś/ })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await tabbar.getByRole('link', { name: /Lista/ }).click();
  await expect(page).toHaveURL(/\/wszystkie$/);

  await tabbar.getByRole('link', { name: /Szukaj/ }).click();
  await expect(page).toHaveURL(/\/szukaj$/);

  await tabbar.getByRole('link', { name: /Ja/ }).click();
  await expect(page).toHaveURL(/\/ustawienia$/);
  await expect(tabbar.getByRole('link', { name: /Ja/ })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

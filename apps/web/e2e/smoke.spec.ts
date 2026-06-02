import { test, expect } from '@playwright/test';
import { clearStorage, completeOnboarding } from './helpers';

test.beforeEach(async ({ page }) => {
  await clearStorage(page);
});

// Smoke: czysty start kieruje na onboarding, a po podaniu imienia ląduje na kokpicie.
test('czysty start → onboarding → kokpit Dziś', async ({ page }) => {
  await page.goto('/');
  // Bramka RequireOnboarding: brak imienia → /onboarding.
  await expect(page).toHaveURL(/\/onboarding$/);

  await completeOnboarding(page, 'Smoke');
  await expect(page).toHaveURL(/\/dzis$/);
  await expect(
    page.getByRole('heading', { name: /Cześć, Smoke/ }),
  ).toBeVisible();
});

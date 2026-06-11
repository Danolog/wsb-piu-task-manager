import { test, expect } from '@playwright/test';
import { completeOnboarding } from './helpers';

// Wymuszamy preferencję OS = jasny, by seed 'system' rozwiązywał się deterministycznie do light.
test.use({ colorScheme: 'light' });

test('dark mode: włącz w Ustawieniach → reload → utrwalone', async ({
  page,
}) => {
  // Czyścimy storage RAZ (nie addInitScript — ten kasowałby też zapisany motyw przy reload).
  await page.goto('/onboarding');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  // Onboarding zapisuje imię w localStorage (bez tego reload wraca na onboarding).
  await completeOnboarding(page, 'Nocny');

  await page.goto('/ustawienia');
  const html = page.locator('html');
  // Seed 'system' + OS=light → efektywny data-theme = light.
  await expect(html).toHaveAttribute('data-theme', 'light');

  // Binarny przełącznik „Tryb ciemny” (switch w sekcji Wygląd).
  const darkSwitch = page
    .getByRole('main')
    .getByRole('switch', { name: 'Tryb ciemny' });
  await darkSwitch.click();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  // Reload → motyw odtworzony z localStorage, nadal ciemny.
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(
    page.getByRole('main').getByRole('switch', { name: 'Tryb ciemny' }),
  ).toBeChecked();
});

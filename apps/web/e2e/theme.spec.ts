import { test, expect } from '@playwright/test';

// Wymuszamy preferencję OS = jasny, by seed 'system' rozwiązywał się deterministycznie do light.
test.use({ colorScheme: 'light' });

test('tryb ciemny utrwala się po reloadzie (localStorage)', async ({
  page,
}) => {
  // Czyścimy storage RAZ na starcie (nie przez addInitScript — ten odpalałby się też
  // przy reload i kasował zapisany motyw, fałszując test persystencji).
  await page.goto('/settings');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  const html = page.locator('html');
  // Seed motywu = 'system'; przy preferencji OS=light efektywny data-theme to "light".
  await expect(html).toHaveAttribute('data-theme', 'light');

  // Na /settings są dwa przełączniki motywu (sidebar + sekcja Motyw) — bierzemy ten
  // w treści głównej, by uniknąć strict-mode violation.
  const main = page.getByRole('main');

  // Przełącznik cykliczny: system → light → dark. Z seeda 'system' pierwsze
  // kliknięcie ustawia jasny, drugie ciemny.
  await main.getByRole('button', { name: /przełączyć na jasny/ }).click();
  await expect(html).toHaveAttribute('data-theme', 'light');

  await main.getByRole('button', { name: /przełączyć na ciemny/ }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  // Reload → motyw odtworzony z localStorage, nadal ciemny.
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
});

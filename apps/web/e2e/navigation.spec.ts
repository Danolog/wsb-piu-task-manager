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

test('desktop: pozycje KATEGORIE w sidebarze filtrują listę + aktywny stan + deep-link', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  // Seed: po jednym zadaniu w Studiach i w Pracy (seedowe kategorie cat-*).
  const STORAGE_KEY = 'wsb-piu-task-manager:state';
  await page.addInitScript((key) => {
    const raw = window.localStorage.getItem(key);
    const state = raw ? JSON.parse(raw) : {};
    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...state,
        schemaVersion: 2,
        user: { name: 'Kasia' },
        categories: {
          'cat-studia': {
            id: 'cat-studia',
            name: 'Studia',
            color: 'category-green',
          },
          'cat-praca': {
            id: 'cat-praca',
            name: 'Praca',
            color: 'category-blue',
          },
        },
        tasks: {
          s1: {
            id: 's1',
            title: 'Projekt zaliczeniowy',
            priority: 'high',
            status: 'todo',
            categoryId: 'cat-studia',
            createdAt: '2026-06-01T08:00:00.000Z',
            updatedAt: '2026-06-01T08:00:00.000Z',
          },
          p1: {
            id: 'p1',
            title: 'Raport kwartalny',
            priority: 'medium',
            status: 'todo',
            categoryId: 'cat-praca',
            createdAt: '2026-06-01T09:00:00.000Z',
            updatedAt: '2026-06-01T09:00:00.000Z',
          },
        },
        ui: { theme: 'light' },
      }),
    );
  }, STORAGE_KEY);

  await page.goto('/dzis');

  // Sekcja KATEGORIE — „Studia" jest linkiem (klikalna pozycja, nie tekst).
  const studia = page.getByRole('link', { name: /Kategoria Studia/ });
  await expect(studia).toBeVisible();
  await studia.click();

  // Nawigacja na /wszystkie?kat=studia, lista zawężona do Studiów.
  await expect(page).toHaveURL(/\/wszystkie\?kat=studia$/);
  const table = page.getByRole('table');
  await expect(table.getByText('Projekt zaliczeniowy')).toBeVisible();
  await expect(table.getByText('Raport kwartalny')).toBeHidden();

  // Aktywny stan w sidebarze (aria-current) + zdejmowalny chip nad listą.
  await expect(studia).toHaveAttribute('aria-current', 'page');
  const chip = page.getByRole('button', {
    name: /Usuń filtr kategorii: Studia/,
  });
  await expect(chip).toBeVisible();

  // Zdjęcie chipa → pełna lista wraca.
  await chip.click();
  await expect(
    page.getByRole('table').getByText('Raport kwartalny'),
  ).toBeVisible();
  await expect(studia).not.toHaveAttribute('aria-current', 'page');

  // Deep-link / odświeżenie bezpośrednio na ?kat= działa (filtr z URL).
  await page.goto('/wszystkie?kat=praca');
  await expect(
    page.getByRole('table').getByText('Raport kwartalny'),
  ).toBeVisible();
  await expect(
    page.getByRole('table').getByText('Projekt zaliczeniowy'),
  ).toBeHidden();
  await expect(
    page.getByRole('link', { name: /Kategoria Praca/ }),
  ).toHaveAttribute('aria-current', 'page');
});

test('desktop: karta usera w sidebarze prowadzi do Ustawień', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await completeOnboarding(page);

  // Karta usera (link „Ustawienia”) na dole sidebara — jedyna droga do Ustawień
  // na desktopie (tab-bar „Ja” jest ukryty ≥ md).
  await page.getByRole('link', { name: /Ustawienia/ }).click();
  await expect(page).toHaveURL(/\/ustawienia$/);
  await expect(page.getByRole('heading', { name: 'Ustawienia' })).toBeVisible();
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

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
});

const VIEWPORTS = [
  { name: 'mobile 375', width: 375, height: 812, mobile: true },
  { name: 'tablet 768', width: 768, height: 1024, mobile: false },
  { name: 'desktop 1280', width: 1280, height: 800, mobile: false },
];

for (const vp of VIEWPORTS) {
  test(`layout nie pęka na ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');

    // Nagłówek listy widoczny na każdym viewporcie.
    await expect(
      page.getByRole('heading', { name: 'Lista zadań' }),
    ).toBeVisible();

    // Brak poziomego przewijania (layout nie wylewa się poza viewport).
    const scrollW = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientW = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    expect(scrollW).toBeLessThanOrEqual(clientW + 1);

    if (vp.mobile) {
      // Mobile: sidebar ukryty, dostępny przycisk „Otwórz menu" (hamburger).
      const burger = page.getByRole('button', { name: 'Otwórz menu' });
      await expect(burger).toBeVisible();

      // Otwarcie drawera → nawigacja w dialogu.
      await burger.click();
      const drawer = page.getByRole('dialog');
      await expect(drawer).toBeVisible();
      await expect(
        drawer.getByRole('link', { name: 'Ustawienia' }),
      ).toBeVisible();
    } else {
      // Tablet/desktop: stały sidebar (nawigacja widoczna bez akcji), brak hamburgera.
      await expect(
        page.getByRole('navigation', { name: 'Główna nawigacja' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Otwórz menu' }),
      ).toBeHidden();
    }
  });

  test(`modal formularza mieści się na ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');

    await page
      .getByRole('button', { name: /Dodaj zadanie/ })
      .first()
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Modal nie wystaje poza szerokość viewportu.
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(vp.width);
      expect(box.x).toBeGreaterThanOrEqual(0);
    }
  });
}

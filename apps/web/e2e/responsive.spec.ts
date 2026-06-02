import { test, expect, type Page } from '@playwright/test';
import { clearStorage, completeOnboarding } from './helpers';

/**
 * Responsywność na 4 viewportach. Sprawdzamy:
 * - brak poziomego overflow (layout nie wylewa się poza viewport),
 * - sidebar (desktop ≥768) ↔ tab-bar (mobile <768),
 * - tabela (desktop) ↔ kartki (mobile) na /wszystkie,
 * - panel filtrów i modale mieszczą się w viewporcie.
 */

const VIEWPORTS = [
  { name: 'mobile 375', width: 375, height: 812, desktop: false },
  { name: 'tablet 768', width: 768, height: 1024, desktop: true },
  { name: 'laptop 1024', width: 1024, height: 768, desktop: true },
  { name: 'desktop 1920', width: 1920, height: 1080, desktop: true },
];

const SCREENS = ['/dzis', '/wszystkie', '/szukaj', '/kategorie', '/ustawienia'];

async function expectNoHorizontalOverflow(page: Page) {
  const scrollW = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  const clientW = await page.evaluate(
    () => document.documentElement.clientWidth,
  );
  expect(scrollW).toBeLessThanOrEqual(clientW + 1);
}

for (const vp of VIEWPORTS) {
  test.describe(`viewport ${vp.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await clearStorage(page);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await completeOnboarding(page);
    });

    for (const path of SCREENS) {
      test(`${path} — brak poziomego overflow`, async ({ page }) => {
        await page.goto(path);
        await expectNoHorizontalOverflow(page);
      });
    }

    test('nawigacja: sidebar ↔ tab-bar wg breakpointu', async ({ page }) => {
      await page.goto('/dzis');
      if (vp.desktop) {
        await expect(
          page.getByRole('navigation', { name: 'Widoki' }),
        ).toBeVisible();
        await expect(
          page.getByRole('navigation', { name: 'Nawigacja główna' }),
        ).toBeHidden();
      } else {
        await expect(
          page.getByRole('navigation', { name: 'Nawigacja główna' }),
        ).toBeVisible();
        await expect(
          page.getByRole('navigation', { name: 'Widoki' }),
        ).toBeHidden();
      }
    });

    test('tabela ↔ kartki na /wszystkie wg breakpointu', async ({ page }) => {
      await page.goto('/nowe');
      await page.getByPlaceholder('Wpisz tytuł zadania...').fill('Widoczne');
      await page.getByRole('button', { name: 'Dodaj zadanie' }).click();
      await expect(page).toHaveURL(/\/wszystkie$/);

      if (vp.desktop) {
        await expect(page.locator('table')).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: 'Zadanie' }),
        ).toBeVisible();
      } else {
        await expect(page.locator('table')).toBeHidden();
        await expect(
          page.getByRole('checkbox', { name: /Oznacz jako wykonane/ }),
        ).toBeVisible();
      }
      await expectNoHorizontalOverflow(page);
    });

    test('panel filtrów mieści się (popover desktop / sheet mobile)', async ({
      page,
    }) => {
      await page.goto('/wszystkie');
      await page.getByRole('button', { name: /Filtruj/ }).click();
      await expect(page.getByText('Filtry').first()).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });

    test('modal potwierdzenia usunięcia mieści się w viewporcie', async ({
      page,
    }) => {
      await page.goto('/nowe');
      await page
        .getByPlaceholder('Wpisz tytuł zadania...')
        .fill('Do usunięcia');
      await page.getByRole('button', { name: 'Dodaj zadanie' }).click();
      // Lista jest tabelą (desktop) lub kartkami (mobile); klikamy widoczny tytuł.
      await page
        .getByText('Do usunięcia', { exact: true })
        .locator('visible=true')
        .click();
      await page
        .getByRole('button', { name: 'Usuń zadanie' })
        .locator('visible=true')
        .click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      const box = await dialog.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(vp.width);
        expect(box.x).toBeGreaterThanOrEqual(-1);
      }
    });
  });
}

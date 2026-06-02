import { type Page, expect } from '@playwright/test';

/**
 * Wspólne pomocniki e2e dla pełnej aplikacji (9 ekranów).
 *
 * Stan startowy aplikacji: czysty localStorage → brak imienia → redirect na
 * /onboarding (bramka RequireOnboarding). Seed = 6 kategorii, 0 zadań,
 * motyw 'system'. Pomocniki niżej dają deterministyczny punkt startu.
 */

/**
 * Czyści localStorage JEDNORAZOWO (nie przez addInitScript — ten kasowałby stan
 * przy każdej nawigacji, w tym po onboardingu, wywracając wieloekranowe testy).
 * Wchodzimy na lekką trasę, czyścimy storage i jesteśmy gotowi na właściwy goto.
 */
export async function clearStorage(page: Page): Promise<void> {
  await page.goto('/onboarding');
  await page.evaluate(() => window.localStorage.clear());
}

/**
 * Przechodzi onboarding: wpisuje imię i ląduje na /dzis.
 * Splash pokazywany jest tylko na mobile (< 768px) i sam schodzi po ~1,2 s
 * (klik w SplashScreen skraca). Czekamy aż pojawi się pole imienia.
 * Zakłada wyczyszczony storage (clearStorage w beforeEach).
 */
export async function completeOnboarding(
  page: Page,
  name = 'Kasia',
): Promise<void> {
  await page.goto('/onboarding');
  // Na mobile splash przykrywa formularz — kliknięcie go pomija od razu.
  const splash = page.getByRole('button', { name: 'Pomiń ekran powitalny' });
  if (await splash.isVisible().catch(() => false)) {
    await splash.click();
  }
  const nameInput = page.getByLabel('Twoje imię');
  await nameInput.waitFor({ state: 'visible' });
  await nameInput.fill(name);
  await page.getByRole('button', { name: /Zaczynamy/ }).click();
  await expect(page).toHaveURL(/\/dzis$/);
}

/**
 * Dodaje zadanie przez stronę /nowe (formularz, nie modal).
 * Tytuł wystarcza — reszta pól opcjonalna. Po „Dodaj zadanie" wraca na
 * /wszystkie (decyzja onSubmit TaskFormPage).
 */
export async function addTask(
  page: Page,
  title: string,
  opts: { fromToday?: boolean } = {},
): Promise<void> {
  if (opts.fromToday) {
    await page.goto('/dzis');
    await page.getByRole('button', { name: /Nowe zadanie/ }).click();
  } else {
    await page.goto('/nowe');
  }
  await expect(page).toHaveURL(/\/nowe$/);
  await page.getByPlaceholder('Wpisz tytuł zadania...').fill(title);
  await page.getByRole('button', { name: 'Dodaj zadanie' }).click();
  await expect(page).toHaveURL(/\/wszystkie$/);
}

/**
 * Otwiera DueDatePicker i wybiera dzień DZISIEJSZY.
 * react-day-picker v10 oznacza komórkę dziś atrybutem data-today; przycisk dnia
 * jest jej dzieckiem. Najpierw klikamy wyzwalacz (placeholder „Dzisiaj”).
 */
export async function pickTodayDate(page: Page): Promise<void> {
  await page
    .getByRole('button', { name: /Dzisiaj/ })
    .first()
    .click();
  await page.locator('[data-today] button').first().click();
}

# Etap 6 — Checklist QA (WSB-PIU Task Manager)

> Stan rzeczywisty na **2026-06-02**, gałąź `feature/etap5-implementacja`. Wzór z `PLAN.md` (Etap 6).
> Legenda: ✅ zweryfikowane · ⚠️ częściowo / z zastrzeżeniem · ⬜ niezweryfikowane / odłożone · 🚫 nie do zmierzenia w tym środowisku.
>
> **Słownik (dla nietechnicznych):** *e2e* = test „od końca do końca", klika apkę jak użytkownik; *a11y* = dostępność dla osób z niepełnosprawnościami; *axe* = automatyczny audytor a11y; *Lighthouse* = narzędzie Google do pomiaru wydajności/SEO/a11y strony; *gzip/brotli* = kompresja plików w trakcie pobierania (przeglądarka pobiera ~1/3 surowego rozmiaru); *bundle* = spakowany kod aplikacji; *viewport* = widoczny obszar ekranu; *CLS* = miara „skakania" układu podczas ładowania.

## Metoda pomiaru i ograniczenia środowiska

- **Testy automatyczne uruchomione realnie:** Vitest (49 testów jednostkowych/komponentowych) + Playwright/Chromium headless (13 testów e2e). Wszystkie zielone.
- **Czym NIE zmierzono (uczciwie):**
  - **Lighthouse — NIE uruchomiony.** Środowisko nie ma dostępu do rejestru npm (offline), więc nie dało się zainstalować `lighthouse` / `playwright-lighthouse` / `unlighthouse`. Wynik 90+ **nie jest potwierdzony pomiarem** w tej turze. Do zmierzenia ręcznie przez właściciela: Chrome DevTools → zakładka Lighthouse na preview build (`npm run preview`), albo `npx lighthouse http://localhost:4173 --view` po `npm i -g lighthouse`.
  - **axe — testy NAPISANE, ale SKIPowane.** `@axe-core/playwright` nie dał się doinstalować (offline). Testy `e2e/a11y.spec.ts` są gotowe i uruchomią się automatycznie po `npm install -D @axe-core/playwright` (mają bramkę 0 naruszeń serious/critical). W tej turze a11y zweryfikowane **manualnym audytem kodu** (patrz sekcja Accessibility) — nie automatem.
  - **Cross-browser Firefox/WebKit — NIE uruchomione.** `playwright.config.ts` ma tylko projekt `chromium`; przeglądarki Firefox/WebKit nie są zainstalowane i nie dało się ich pobrać offline.
- **Zmierzone twardo:** rozmiary bundle (build), transfer JS na trasie `/` (Playwright network), zachowanie responsywne na 375/768/1280 (Playwright viewporty z asercją braku poziomego overflow).

---

## Funkcjonalne

- ✅ Wszystkie CRUD na zadaniach — dodawanie/edycja przez modal, usuwanie z „Cofnij" (e2e happy path + testy reducera).
- ✅ Toggle status — checkbox done/todo, dwukanałowa sygnalizacja (e2e + TaskCard test).
- ✅ Filtrowanie (status, kategoria) — e2e filtr zakładki „Zrobione" + unit `selectVisibleTasks`.
- ✅ Sortowanie — kontrolka klucz + kierunek (unit selektora).
- ✅ Wyszukiwarka — debounce, zawężanie listy (e2e + SearchBar test).
- ✅ Dark/light/system mode + zapis preferencji (e2e: utrwala się po reloadzie; ThemeToggle test).
- ✅ localStorage po reloadzie — e2e theme robi realny round-trip przez `page.reload()`. ⚠️ Po zamknięciu karty / restarcie przeglądarki: nie testowane automatem, ale to ten sam mechanizm `localStorage` (trwały magazyn) — działa z definicji.
- ✅ Walidacja formularzy — pusty tytuł i >120 znaków blokowane, komunikaty po polsku (zod + TaskFormDialog test). Opis max 1000.
- ✅ Empty states — brak zadań (EmptyState z CTA) oraz brak wyników filtra („Brak wyników", e2e).

## Cross-browser

- ✅ Chrome desktop — Playwright chromium + ręczny dev.
- ⚠️ Chrome mobile — emulacja viewportu 375 w Playwright (layout), nie realne urządzenie.
- 🚫 Firefox — przeglądarka niezainstalowana, brak sieci do pobrania. Do dodania: projekt `firefox` w `playwright.config.ts` + `npx playwright install firefox`.
- 🚫 Safari / WebKit — jw. (`npx playwright install webkit`).

## Responsywność

- ✅ 375px (mobile) — brak poziomego overflow, sidebar→drawer (hamburger) działa, modal mieści się (e2e responsive).
- ✅ 768px (tablet) — j.w. **Wykryto i naprawiono** realny błąd: toolbar listy (status+sort) wylewał się poza ekran na 768 → `sm:flex-wrap` na pasku narzędzi.
- ✅ 1280px (desktop) — stały sidebar widoczny, brak overflow, modal mieści się.
- ⬜ 1024px / 1920px — nie ujęte w zestawie viewportów (wybrano 375/768/1280 wg briefu tej tury). 1024 jest między przetestowanymi 768 a 1280; 1920 to szerszy desktop, ten sam layout co 1280 (treść w `max-w-3xl`, sidebar stały).

## Accessibility (a11y)

> Zweryfikowane **manualnym audytem kodu** (axe automatem SKIP — patrz wyżej).

- ⚠️ axe DevTools zero violations — testy gotowe (`e2e/a11y.spec.ts`, 3 widoki, bramka serious/critical), **nieuruchomione** (brak pakietu offline). Uruchom po instalacji `@axe-core/playwright`.
- ✅ Wszystko klawiaturą — e2e keyboard: otwarcie modalu Enterem, autoFocus na tytule (focus trap Radix), submit Enterem, zamknięcie Esc, toggle checkboxa Space. Nawigacja po Radix/shadcn (Dialog, Tabs, Select, Popover) dostępna z definicji.
- ✅ Status nie tylko kolorem (WCAG 1.4.1) — done = przekreślenie + przyciemnienie, nie sam kolor; terminy „po terminie/dzisiaj" mają tekst `sr-only`.
- ✅ Etykiety i ARIA — formularze: `<Label htmlFor>`, `aria-invalid`, `aria-describedby`, błędy `role="alert"`. Ikony `aria-hidden`. Przyciski akcji (checkbox/edytuj/usuń) mają opisowy `aria-label` z tytułem zadania. Nawigacja `aria-label`. `<html lang="pl">`, `<title>` ustawione.
- ⬜ Screen reader walk-through (NVDA/VoiceOver) — niezweryfikowane ręcznie w tej turze (wymaga człowieka + czytnika ekranu). Markup pod to przygotowany (role, sr-only, focus order).
- 🚫 Kontrasty WCAG AA — nie zmierzone automatem (axe robi to, ale SKIP). Tokeny kolorów z Figmy projektowane pod AA (ink `#221f19` na canvas `#f4efe4`), ale **kontrast nie został zweryfikowany narzędziem** w tej turze.

## Performance

- 🚫 Lighthouse 90+ — **NIE zmierzone** (offline, brak narzędzia). Do ręcznego pomiaru przez właściciela na preview build.
- ⚠️ Bundle <200kb gzipped — **częściowo.** Po code-splittingu największy chunk wejściowy = **381kB / ~117kB gzip**; znika ostrzeżenie build o chunku >500kb. Cel „<200kb gzip" dla initial bundle **osiągnięty dla głównego chunku JS** (~117kB gzip). Pełny transfer trasy `/` (zmierzony Playwright network, surowo): ~567kB JS w 7 plikach → po gzip/brotli orientacyjnie ~170–190kB. Modal formularza (103kB, react-hook-form+zod+kalendarz) i Ustawienia (6kB) **nie ładują się na starcie** — dopiero przy otwarciu/wejściu na trasę.
- ⬜ CLS < 0.1 — nie zmierzone (część Lighthouse). Czcionki self-hosted (fontsource) + brak obrazów ładowanych asynchronicznie ogranicza ryzyko skoków układu, ale **nie potwierdzone pomiarem**.

### Bundle przed/po code-splitting (twarde liczby z `npm run build`)

| | Przed | Po |
|---|---|---|
| Największy chunk JS | 675.05 kB / **208.03 kB gzip** | 381.25 kB / **116.81 kB gzip** |
| Liczba chunków JS | 1 (monolit) | 12 (trasy + modal osobno) |
| Advisory „>500kb" | TAK | **NIE** |
| TaskFormDialog | w monolicie | osobny chunk 103 kB / 33 kB gzip (lazy) |
| SettingsPage | w monolicie | osobny chunk 6 kB / 2 kB gzip (lazy) |

## Edge cases

- ✅ Corrupted storage — `load()` ma `try/catch` + fallback `seedState()` przy błędzie parsowania/walidacji zod (unit `storage.test.ts`).
- ✅ localStorage pełny (Quota) — `save()` w `try/catch`, błąd nie wywala apki (przewidziany toast).
- ✅ Bardzo długie tytuły — schemat zod ogranicza tytuł do 120 znaków (walidacja z komunikatem), w UI `truncate`.
- ⬜ 500 zadań (perf przy dużej liczbie) — nie testowane pod obciążeniem; model `Record<id,Task>` daje O(1) lookup, selektor filtrujący liniowy. Ryzyko niskie dla aplikacji studenckiej, ale **niezmierzone**.
- ✅ 0 zadań — empty state z CTA „Dodaj zadanie".

---

## Podsumowanie bramek

| Bramka | Stan |
|---|---|
| Typecheck / Lint / Unit (49) / Build | ✅ wszystkie zielone |
| E2E (13 testów, Chromium) | ✅ zielone |
| E2E a11y (axe, 3 testy) | ⚠️ napisane, SKIP (brak pakietu offline) |
| Code-splitting (advisory >500kb) | ✅ usunięte |
| Responsywność 375/768/1280 | ✅ + naprawiony błąd toolbar 768 |
| Lighthouse 90+ | 🚫 niezmierzone w tym środowisku |
| Cross-browser Firefox/WebKit | 🚫 niezmierzone (brak przeglądarek offline) |

## Do dokończenia przez właściciela (gdy sieć dostępna)

1. `npm install -D @axe-core/playwright` → `npx playwright test e2e/a11y.spec.ts` (bramka 0 serious/critical odpali się sama).
2. Lighthouse na preview: `npm run build && npm run preview` → Chrome DevTools → Lighthouse (mobile + desktop), cel 90+ w 4 kategoriach. Alternatywnie `npx lighthouse http://localhost:4173 --view`.
3. (Opcjonalnie) dodać projekty `firefox`/`webkit` w `playwright.config.ts` + `npx playwright install firefox webkit`, by domknąć cross-browser.
4. Manualny przebieg czytnikiem ekranu (NVDA na Windows) na flow: dodaj → oznacz → usuń.

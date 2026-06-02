# Etap 6 — Checklist QA (WSB-PIU Task Manager)

> Stan rzeczywisty na **2026-06-02**, gałąź `feature/etap5-implementacja`. Wzór z `PLAN.md` (Etap 6).
> Legenda: ✅ zweryfikowane · ⚠️ częściowo / z zastrzeżeniem · ⬜ niezweryfikowane / odłożone · 🚫 nie do zmierzenia w tym środowisku.
>
> **Słownik (dla nietechnicznych):** *e2e* = test „od końca do końca", klika apkę jak użytkownik; *a11y* = dostępność dla osób z niepełnosprawnościami; *axe* = automatyczny audytor a11y; *Lighthouse* = narzędzie Google do pomiaru wydajności/SEO/a11y strony; *gzip/brotli* = kompresja plików w trakcie pobierania (przeglądarka pobiera ~1/3 surowego rozmiaru); *bundle* = spakowany kod aplikacji; *viewport* = widoczny obszar ekranu; *CLS* = miara „skakania" układu podczas ładowania.

## Metoda pomiaru i ograniczenia środowiska

> **Aktualizacja 2026-06-02 (sieć dostępna).** W tej turze rejestr npm był dostępny — doinstalowano `@axe-core/playwright` i `lighthouse`, a oba audyty uruchomiono **realnie na preview build** (`http://localhost:4173`). Sekcje a11y i Performance zawierają teraz zmierzone liczby, nie tylko audyt kodu.

- **Testy automatyczne uruchomione realnie:** Vitest (49 testów jednostkowych/komponentowych) + Playwright/Chromium headless (16 testów e2e, w tym 3 axe a11y). Wszystkie zielone.
- **axe (a11y) — uruchomiony realnie.** `@axe-core/playwright` doinstalowany; `e2e/a11y.spec.ts` (3 widoki, bramka 0 naruszeń serious/critical) odpalony. Wynik przed→po niżej w sekcji Accessibility.
- **Lighthouse — uruchomiony realnie** (lighthouse v13.3.0, headless Chrome, preview build na :4173). Cztery kategorie zmierzone, liczby niżej w sekcji Performance.
- **Czym NIE zmierzono (uczciwie):**
  - **Cross-browser Firefox/WebKit — NIE uruchomione.** `playwright.config.ts` ma tylko projekt `chromium`; przeglądarki Firefox/WebKit nie zainstalowane. Lighthouse i axe mierzą tylko silnik Chromium.
  - **Lighthouse mobile + screen reader** — pomiar Lighthouse zrobiony w profilu domyślnym (desktop-ish, headless). Mobilny throttling i przebieg czytnikiem ekranu (NVDA/VoiceOver) zostają do ręcznej weryfikacji człowieka.
- **Zmierzone twardo:** axe (przed/po), Lighthouse (4 kategorie), rozmiary bundle (build), transfer JS na trasie `/` (Playwright network), responsywność 375/768/1280 (Playwright viewporty z asercją braku poziomego overflow).

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

> Zweryfikowane **realnie axe-core** (3 widoki) + audyt kodu. Lighthouse Accessibility = **100/100**.

- ✅ **axe zero naruszeń serious/critical — ZMIERZONE.** `e2e/a11y.spec.ts` (lista zadań, modal formularza, ustawienia) uruchomione realnie. **Przed: 2 naruszenia → Po: 0.**
  - **aria-valid-attr-value (critical)** — filtr statusu (Radix Tabs) nadawał triggerom `aria-controls` wskazujące na panele treści, których nie było w DOM (filtr sterował listą poza komponentem). Naprawa: dodane `TabsContent` z `forceMount` dla każdej zakładki (`StatusTabs.tsx`), panele `sr-only` — `aria-controls` wskazuje teraz realny element.
  - **color-contrast (serious)** — nieaktywna zakładka filtra miała `text-foreground/60` = `#747067` na `#efe9db` = **4.07:1** (< AA 4.5:1). Naprawa: `text-foreground/70` = `#605c53` = **5.5:1** (`ui/tabs.tsx`). Wariant dark nietknięty (używa `muted-foreground` = 4.94:1, OK).
- ✅ Kontrasty WCAG AA — pozostałe pary z tokenów Figmy zweryfikowane przez axe (Lighthouse a11y 100), policzone też ręcznie: ink `#221f19`/canvas `#f4efe4` = 14.3:1, ink-muted `#6e6757`/surface-alt `#efe9db` = 4.64:1, ink-soft `#5f5849`/canvas = 6.15:1. Dark: ink-muted `#a39c8a`/canvas `#1c1a15` = 6.36:1. Wszystkie ≥ 4.5:1.
- ✅ Wszystko klawiaturą — e2e keyboard: otwarcie modalu Enterem, autoFocus na tytule (focus trap Radix), submit Enterem, zamknięcie Esc, toggle checkboxa Space. Nawigacja po Radix/shadcn (Dialog, Tabs, Select, Popover) dostępna z definicji.
- ✅ Status nie tylko kolorem (WCAG 1.4.1) — done = przekreślenie + przyciemnienie, nie sam kolor; terminy „po terminie/dzisiaj" mają tekst `sr-only`.
- ✅ Etykiety i ARIA — formularze: `<Label htmlFor>`, `aria-invalid`, `aria-describedby`, błędy `role="alert"`. Ikony `aria-hidden`. Przyciski akcji (checkbox/edytuj/usuń) mają opisowy `aria-label` z tytułem zadania. Nawigacja `aria-label`. `<html lang="pl">`, `<title>` ustawione.
- ⬜ Screen reader walk-through (NVDA/VoiceOver) — niezweryfikowane ręcznie w tej turze (wymaga człowieka + czytnika ekranu). Markup pod to przygotowany (role, sr-only, focus order).

## Performance

- ✅ **Lighthouse — ZMIERZONE realnie** (v13.3.0, headless Chrome, preview build `:4173`):

  | Kategoria | Wynik | Cel 90+ |
  |---|---|---|
  | Performance | **86** | ⚠️ poniżej |
  | Accessibility | **100** | ✅ |
  | Best Practices | **100** | ✅ |
  | SEO | **100** | ✅ (było 82 przed naprawą) |

  - **SEO 82 → 100.** Naprawione: brak `<meta name="description">` (dodany w `index.html`) + nieprawidłowy robots.txt (SPA serwowała HTML zamiast pliku — dodany `public/robots.txt`).
  - **Performance 86 (poniżej 90).** Uczciwie: ciągnie w dół **tylko FCP 2.4s (score 69) i LCP 3.7s (score 57)** — pojedynczy bundle wejściowy + ładowanie fontów na zimnym preview. Reszta wzorowa: TBT 40ms (100), CLS 0.001 (100), Speed Index 2.4s (98). Domknięcie do 90+ wymaga preload fontów / dalszego code-splittingu wejściowego chunku — osobne zadanie optymalizacyjne (ryzyko regresji na działającym buildzie), **nie robione w tej turze QA**. Pomiar lokalny waha się ±1–2 pkt między przebiegami.

### Przebieg optymalizacji Performance „P9" (2026-06-02) — wynik: bez poprawy, zmiany cofnięte

> Osobny, celowany przebieg pod podniesienie Performance do 90+ *bez* regresji wizualnej i bez psucia testów. **Wniosek: żadna z bezpiecznych technik nie podniosła wyniku na tej maszynie — wynik jest zdominowany przez czas wykonania JS (render React) pod throttlingiem CPU, nie przez fonty. Wszystkie zmiany cofnięto, repo zostaje w stanie baseline (Performance 86).**

- **Metoda:** preset *mobile* Lighthouse (odtwarza warunki z briefu: 4x throttling CPU + wolna sieć), build → `vite preview` na `:4173` → Lighthouse. Pojedyncze przebiegi okazały się mocno zaszumione (Performance skakał 84–94 między przebiegami) → porównania robione na **medianie z 7 przebiegów** w identycznych warunkach.
- **Co testowano (i z jakim skutkiem):**
  - **Subset fontów latin/latin-ext + usunięcie nieużywanego Space Mono** (token `--font-mono` nie jest renderowany przez żaden komponent). Poprawiło FCP (2.4→2.1s), ale **pogorszyło LCP** (3.72→4.0s) — per-wagowe rozbicie na osobne pliki latin/latin-ext dokłada pobranie pliku latin-ext (polskie znaki ą/ę/ł) na ścieżce do elementu LCP. Mediana 7 przebiegów: **85** (baseline **86**). Netto -1.
  - **Preload krytycznych woff2 Inter 400 + modulepreload chunku trasy startowej** (plugin Vite wstrzykujący realne, zhashowane nazwy do `index.html`). Ustabilizowało FCP/TBT, ale **nie ruszyło LCP** — potwierdza, że LCP nie czeka na font.
  - **`manualChunks` (vendor React/router osobno) + eager-import trasy `/`.** LCP lekko w dół (~3.2s w dobrych przebiegach), ale TBT w górę (40→130 ms) i większa wariancja FCP. Netto bez zysku w score.
- **Diagnoza LCP (Lighthouse 13 „lcp-breakdown-insight”):** element LCP = `<p>` pustego stanu „Nie masz jeszcze żadnych zadań…”; TTFB ~8 ms, *render delay* ~480 ms. Dominującym kosztem jest dojście do wyrenderowania drzewa React na throttlowanym CPU (pusty `#root` → cała treść renderuje się dopiero po wykonaniu JS), a nie pobranie fontu czy chunku. **Domknięcie do 90+ wymagałoby prerenderingu/SSR treści startowej** — zmiana architektury poza zakresem „tylko sposób ładowania fontów”, z realnym ryzykiem regresji testów e2e i wyglądu, więc świadomie niewykonana.
- **Stan po przebiegu:** working tree przywrócone do baseline (`main.tsx`, `vite.config.ts`, `router.tsx` bez zmian). Bramki nadal zielone: typecheck/lint/49 unit/16 e2e/build.
- ⚠️ Bundle <200kb gzipped — **częściowo.** Po code-splittingu największy chunk wejściowy = **381kB / ~117kB gzip**; znika ostrzeżenie build o chunku >500kb. Cel „<200kb gzip" dla initial bundle **osiągnięty dla głównego chunku JS** (~117kB gzip). Pełny transfer trasy `/` (zmierzony Playwright network, surowo): ~567kB JS w 7 plikach → po gzip/brotli orientacyjnie ~170–190kB. Modal formularza (103kB, react-hook-form+zod+kalendarz) i Ustawienia (6kB) **nie ładują się na starcie** — dopiero przy otwarciu/wejściu na trasę.
- ✅ CLS < 0.1 — **zmierzone Lighthouse: 0.001** (praktycznie zero skoków układu). Czcionki self-hosted (fontsource) + brak obrazów asynchronicznych.

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
| E2E (16 testów, Chromium) | ✅ zielone |
| E2E a11y (axe, 3 testy) | ✅ uruchomione realnie — 2 naruszenia → **0** serious/critical |
| Code-splitting (advisory >500kb) | ✅ usunięte |
| Responsywność 375/768/1280 | ✅ + naprawiony błąd toolbar 768 |
| Lighthouse Accessibility / Best Practices / SEO | ✅ **100 / 100 / 100** |
| Lighthouse Performance 90+ | ⚠️ **86** (FCP/LCP; reszta metryk 98–100) |
| Cross-browser Firefox/WebKit | 🚫 niezmierzone (przeglądarki niezainstalowane) |

## Do dokończenia przez właściciela

1. **Performance 86 → 90+** (opcjonalne, jakość): **próbowane w przebiegu „P9" 2026-06-02 — bezskutecznie** (subset fontów, preload woff2, modulepreload, vendor split, eager trasy — żadna nie podniosła mediany; szczegóły w sekcji Performance). Bottleneck to render React pod throttlingiem CPU (pusty `#root`, treść renderowana w pełni po JS), nie fonty. Realne domknięcie do 90+ wymaga **prerenderingu/SSR treści startowej** (np. prerender trasy `/` do statycznego HTML) — zmiana architektury, osobny projekt z własnym testem regresji wizualnej.
2. (Opcjonalnie) dodać projekty `firefox`/`webkit` w `playwright.config.ts` + `npx playwright install firefox webkit`, by domknąć cross-browser.
3. Manualny przebieg czytnikiem ekranu (NVDA na Windows) na flow: dodaj → oznacz → usuń.

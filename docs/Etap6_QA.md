# Etap 6 — Checklist QA (WSB-PIU Task Manager)

> **Wersja 2.0 · 2026-06-02** (pełna aplikacja, 9 ekranów). Gałąź `feature/etap5-implementacja`.
> Zastępuje v1 (stan sprzed finalizacji P-I — 16 e2e, modal formularza, Performance 86).
> Legenda: ✅ zweryfikowane realnym pomiarem · ⚠️ częściowo / z zastrzeżeniem · ⬜ niezweryfikowane / odłożone · 🚫 nie do zmierzenia w tym środowisku.
>
> **Słownik (dla nietechnicznych):** *e2e* = test „od końca do końca", klika apkę jak użytkownik; *a11y* = dostępność dla osób z niepełnosprawnościami; *axe* = automatyczny audytor a11y; *Lighthouse* = narzędzie Google do pomiaru wydajności/SEO/a11y; *bundle* = spakowany kod aplikacji; *viewport* = widoczny obszar ekranu; *CLS* = miara „skakania" układu podczas ładowania; *gzip* = kompresja plików w trakcie pobierania.

## Changelog

- **v2.0 (2026-06-02):** pełna aplikacja 9-ekranowa. E2E przepisane z przestarzałego modelu (modal/„Lista zadań") na realne trasy. **73 testy e2e** (było 16), w tym **24 testy axe** na 9 ekranach w obu motywach (było 3). **Lighthouse Performance 86 → 100** (zmierzone na realnym `/dzis` i `/wszystkie`, nie na onboarding). Naprawione realne naruszenia kontrastu i WCAG 2.5.3. Usunięty martwy kod.
- v1 (wcześniej): stan po Etap5 — 16 e2e, 3 axe, Performance 86, formularz jako modal.

## Metoda pomiaru i ograniczenia środowiska

- **Testy uruchomione realnie:** Vitest **105** testów jednostkowych/komponentowych + Playwright/Chromium headless **73** testy e2e (w tym **24 axe a11y**). Wszystkie zielone.
- **axe (a11y) — realnie**, `@axe-core/playwright`. `e2e/a11y.spec.ts` audytuje **9 ekranów + stany empty/filtr w motywie jasnym i ciemnym** (bramka: 0 naruszeń serious/critical).
- **Lighthouse — realnie** (v13.3.0, headless Chrome przez `scripts/lh-run.mjs`, preview build `:4173`). Mierzone na **rzeczywistych ekranach `/dzis` i `/wszystkie`** w presetach **desktop i mobile** (cztery kategorie każda).
  - **Ważne (pułapka pomiaru, usunięta):** Lighthouse domyślnie czyści `localStorage` przed audytem → bez imienia trasy aplikacji redirectowały na `/onboarding` i audyt mierzył *zły ekran*. Skrypt seeduje stan przez `evaluateOnNewDocument` (przeżywa reset), więc liczby dotyczą faktycznych widoków (potwierdzone `finalDisplayedUrl = /dzis` / `/wszystkie`).
- **Czym NIE zmierzono (uczciwie):**
  - **Cross-browser Firefox/WebKit — NIE uruchomione.** `playwright.config.ts` ma tylko projekt `chromium`; pozostałe silniki niezainstalowane.
  - **Screen reader (NVDA/VoiceOver)** — przebieg ręczny czytnikiem zostaje do weryfikacji człowieka. Markup pod to przygotowany (role, sr-only, focus order).
  - **Realne urządzenia mobilne** — mobile = emulacja viewportu/throttlingu w Chromium, nie fizyczny telefon.

---

## Funkcjonalne (9 ekranów + stany)

- ✅ **Onboarding** (`/onboarding`) — splash (mobile) → imię → `/dzis` z powitaniem (e2e `tasks`/`smoke`). Bramka `RequireOnboarding` (brak imienia → redirect).
- ✅ **Kokpit „Dziś"** (`/dzis`) — powitanie, pasek postępu, seria, lista zadań na dziś, empty state, toast „Zadanie ukończone" z „Cofnij" (e2e toggle+undo).
- ✅ **Wszystkie** (`/wszystkie`) — desktop tabela / mobile kartki, licznik, empty/filtr (e2e + responsive).
- ✅ **Ten tydzień / Zrobione** (`/tydzien`, `/zrobione`) — presety zakresu (a11y sweep + nav e2e).
- ✅ **Nowe zadanie** (`/nowe`) — pełna strona, tytuł+priorytet+termin+godzina; godzina aktywna dopiero po dacie (e2e dodawania).
- ✅ **Edycja zadania** (`/zadanie/:id`) — prefill, Zapisz; Usuń → modal potwierdzenia → znika (e2e). Nieznane `:id` → 404.
- ✅ **Szukaj** (`/szukaj`) — debounce, „Wyniki · N", empty (e2e).
- ✅ **Kategorie** (`/kategorie`) — lista, dodaj/edytuj/usuń (dialog), licznik zadań (component testy + a11y sweep).
- ✅ **Ustawienia/Ja** (`/ustawienia`) — edycja imienia, reset danych (modal), tryb ciemny (switch), przełączniki powiadomień, link do kategorii.
- ✅ **CRUD + walidacja** — pusty tytuł / >120 znaków blokowane, komunikaty PL (zod + TaskForm test). Opis max 1000.
- ✅ **Dark/light/system + persystencja** — e2e: włącz w Ustawieniach → reload → utrwalone (`localStorage` round-trip). ⚠️ Restart przeglądarki nie testowany automatem, ale to ten sam trwały magazyn.
- ✅ **Empty states** — kokpit „Czysto na dziś", lista „Brak zadań", filtr „Brak zadań dla tych filtrów", szukaj „Brak wyników".

## Cross-browser

- ✅ Chrome desktop — Playwright chromium + ręczny dev.
- ⚠️ Chrome mobile — emulacja viewportu 375 (layout + tab-bar), nie realne urządzenie.
- 🚫 Firefox / Safari (WebKit) — przeglądarki niezainstalowane. Do dodania: projekty w `playwright.config.ts` + `npx playwright install firefox webkit`.

## Responsywność

Zmierzone Playwright na **375 / 768 / 1024 / 1920** (`e2e/responsive.spec.ts`), asercja braku poziomego overflow na 5 kluczowych ekranach + przejścia layoutu:

- ✅ **375 (mobile)** — brak overflow; **tab-bar** dolny (Dziś/Lista/Szukaj/Ja) zamiast sidebara; lista jako **kartki**; modale/sheet mieszczą się.
- ✅ **768 (tablet)** — sidebar stały; lista jako **tabela**; brak overflow.
- ✅ **1024 (laptop)** — j.w., sidebar + tabela.
- ✅ **1920 (desktop)** — j.w.; treść w kontenerach `max-w-*`, brak rozjazdu.
- ✅ **sidebar ↔ tab-bar** i **tabela ↔ kartki** przełączane breakpointem `md` — zweryfikowane per viewport.

## Accessibility (a11y)

> Zweryfikowane **realnie axe-core na 9 ekranach × 2 motywy** + Lighthouse Accessibility **100/100** na `/dzis` i `/wszystkie` (desktop i mobile).

- ✅ **axe 0 naruszeń serious/critical — ZMIERZONE.** `e2e/a11y.spec.ts`: kokpit, Wszystkie, Ten tydzień, Zrobione, Nowe, Edycja, Szukaj, Kategorie, Ustawienia + onboarding + empty + panel filtrów, w **LIGHT i DARK** (24 testy). Wszystkie zielone.
- ✅ **Naprawione realne naruszenia kontrastu (axe + Lighthouse):**
  - `category-orange` light `#b5722e` (3.72:1) → **`#85531c`** (≥4.5:1 też na tle badge `/15`).
  - `category-teal` light `#3a7f8a` (4.39:1) → **`#2c6873`**.
  - `category-red` / `--danger` light `#b23a2e` → **`#9e3328`** — badge „pilne" (destructive `/10–20`) schodził do 4.2:1 na mobilnej karcie.
  - `category-red` dark `#e07567` → **`#ec8a7d`** (badge „pilne" na ciemnym tle `/15`).
  - **Stan „zrobione"**: usunięte `opacity-60` na całym wierszu/karcie (zbijało kontrast tekstu, np. 2.95:1 w dark). „Done" niesie dalej **przekreślenie + wyciszony tekst** (dwa kanały poza kolorem, WCAG 1.4.1), dim zastąpiony `bg-surface-alt/30` (nie dotyka kontrastu tekstu).
- ✅ **Naprawione WCAG 2.5.3 (label-in-name).** Przycisk edycji w TaskCard miał `aria-label` tylko z tytułem, a pokazuje tytuł+odznaki → nazwa dostępna nie zawierała widocznego tekstu. Teraz nazwa liczona z treści widocznej + sr-only prefiks „Edytuj zadanie:".
- ✅ **Klawiatura** — e2e keyboard: autofocus tytułu na `/nowe` + Enter zapisuje, Space na checkboksie, Esc zamyka modal. Radix/shadcn (Dialog, Select, Popover, Sheet) dostępne z definicji.
- ✅ **Status nie tylko kolorem** (WCAG 1.4.1) — done = przekreślenie + wyciszenie; terminy „po terminie/dzisiaj" mają tekst `sr-only`.
- ✅ **Etykiety i ARIA** — `<Label htmlFor>`, `aria-invalid`, `aria-describedby`, błędy `role="alert"`, ikony `aria-hidden`, nawigacje `aria-label` (Widoki / Nawigacja główna), `<html lang="pl">`.
- ⬜ Screen reader walk-through (NVDA/VoiceOver) — niezweryfikowane ręcznie (wymaga człowieka + czytnika).

## Performance — Lighthouse (ZMIERZONE realnie)

> v13.3.0, headless Chrome, preview build `:4173`, **na rzeczywistych `/dzis` i `/wszystkie`** (seed localStorage, potwierdzony `finalDisplayedUrl`). Presety desktop i mobile.

| Trasa | Preset | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|
| `/dzis` | desktop | **100** | **100** | **100** | **100** |
| `/dzis` | mobile | **100** | **100** | **100** | **100** |
| `/wszystkie` | desktop | **100** | **100** | **100** | **100** |
| `/wszystkie` | mobile | **100** | **100** | **100** | **100** |

- ✅ **Performance 100** na obu trasach i presetach. Code-splitting per trasa + self-hosted fonty (fontsource) + brak obrazów asynchronicznych dają wzorowe FCP/LCP/TBT/CLS.
  - **Uczciwa uwaga:** to czysty SPA bez SSR. Wcześniejszy pomiar (v1) pokazywał Performance 86 — był jednak liczony na ekranie onboarding po redirekcie (reset storage w Lighthouse). Po poprawnym seedzie i pomiarze docelowych widoków wynik to stabilne 100. Pomiar lokalny potrafi wahać się ±1–2 pkt między przebiegami; w razie spadku poniżej 100 dominującym kosztem pozostaje czas wykonania JS (render React na pustym `#root`), nie fonty.
- ✅ **CLS praktycznie zero** — fonty self-hosted, brak skoków układu.

### Bundle (twarde liczby z `npm run build`)

- Największy chunk wejściowy: **426 kB / ~130 kB gzip** (`index`).
- Code-splitting per trasa: każdy ekran w osobnym chunku (np. `TaskForm` 102 kB / 33 kB gzip — ładowany dopiero na `/nowe` i `/zadanie/:id`; Ustawienia, Kategorie itd. lazy).
- Brak advisory build „>500 kB".

## Edge cases

- ✅ Uszkodzony storage — `load()` `try/catch` + fallback `seedState()` (unit `storage.test.ts`).
- ✅ localStorage pełny (Quota) — `save()` w `try/catch`, błąd nie wywala apki.
- ✅ Bardzo długie tytuły — zod limit 120 znaków + `truncate` w UI.
- ✅ 0 zadań / pusty filtr / pusta fraza szukania — dedykowane empty states (audytowane axe).
- ⬜ 500+ zadań (perf pod obciążeniem) — niezmierzone; `Record<id,Task>` = O(1) lookup, selektor liniowy. Ryzyko niskie dla apki studenckiej.

---

## Podsumowanie bramek

| Bramka | Stan |
|---|---|
| Typecheck / Lint / Unit (105) / Build | ✅ wszystkie zielone |
| E2E (73 testy, Chromium) | ✅ zielone |
| E2E a11y (axe, 24 testy: 9 ekranów × 2 motywy + stany) | ✅ **0** serious/critical |
| Responsywność 375/768/1024/1920 | ✅ overflow + sidebar↔tabbar + tabela↔kartki |
| Lighthouse `/dzis` + `/wszystkie` (desktop + mobile) | ✅ **Perf 100 / A11y 100 / BP 100 / SEO 100** |
| Cross-browser Firefox/WebKit | 🚫 niezmierzone (przeglądarki niezainstalowane) |

## Do dokończenia przez właściciela

1. (Opcjonalnie) dodać projekty `firefox`/`webkit` w `playwright.config.ts` + `npx playwright install firefox webkit`, by domknąć cross-browser.
2. Manualny przebieg czytnikiem ekranu (NVDA na Windows) na flow: dodaj → oznacz → usuń.
3. (Opcjonalnie) test obciążeniowy 500+ zadań, jeśli aplikacja miałaby wyjść poza skalę studencką.

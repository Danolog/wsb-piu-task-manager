# Etap 5 — Plan implementacji frontendu v2 (WSB-PIU Task Manager)

> Rewizja planu v1 po ustaleniu pełnego zakresu Figmy: **9 ekranów logicznych × (desktop + mobile) = 26 ramek**. Kluczowe zmiany vs v1: (1) dodawanie/edycja jako **pełne strony/panele**, nie modal; (2) dwie odrębne nawigacje (desktop sidebar + mobile tab-bar); (3) onboarding gate na pierwsze uruchomienie; (4) rozszerzenie modelu danych (godzina, imię usera, seria/streak, widoki „Ten tydzień"/„Zrobione") + migracja `schemaVersion 1→2`; (5) globalny dark-mode na wszystkich widokach.
>
> **Autor:** Ethan (CTO). **Decyzje produktowe: Oliver (COO), Poziom 2, 2026-06-02 — sekcja 11.** Bazuje na v1 i istniejącym kodzie w `apps/web/src/`. Screenshoty wszystkich 26 ramek: `C:\Users\D\figma_shots\`.
>
> **Słownik:** *routing* = adres URL → widok; *gate* = bramka przepuszczająca po spełnieniu warunku (tu: po podaniu imienia); *token* = nazwana zmienna koloru/rozmiaru podmieniana hurtowo dla trybu ciemnego; *migracja* = automatyczne przerobienie zapisanych danych ze starego formatu na nowy; *streak/seria* = liczba kolejnych dni z aktywnością; *bottom-sheet* = panel wysuwany od dołu (mobile); *popover* = dymek przy przycisku (desktop).

## 0. Stan wejściowy
Fundament z v1 zbudowany i zdrowy — rozszerzamy, nie przepisujemy: `model.ts`/`storage.ts`/`store.ts` (reducer, zod, migracje, `selectVisibleTasks`, `schemaVersion=1`), `AppProvider` (auto-save + `data-theme` na `<html>` — dark mode już globalny), `globals.css` (paleta light + dark swap), `AppShell` (sidebar+drawer, 2 pozycje), `router.tsx` (3 trasy), `TaskFormDialog` (modal — do refaktoru na stronę), strony + komponenty UI.

**Rozjazdy Figma↔kod:** brak kokpitu „Dziś" (powitanie+postęp+streak); edycja w Figmie = układ 3-kolumnowy, nie modal; pola mają GODZINĘ (model ma tylko datę); brak `userName`+`streak`; nawigacja desktop = Dziś/Wszystkie/Ten tydzień/Zrobione + kategorie z licznikami.

## 1. Analiza luk
| # | Ekran | Ramki (D/M) | Stan w kodzie | Do dobudowania |
|---|---|---|---|---|
| 1 | Onboarding | 24:2 / 8:7 (+Splash 8:2) | Brak | `OnboardingPage` + gate, splash mobile, zapis imienia+kategorii |
| 2 | Dziś / kokpit | 20:2 / 11:2; empty 24:23/8:22; done 43:2/41:2; dark 17:2 | Brak (płaska lista na `/`) | `TodayPage`: powitanie, `ProgressBar`, `StreakBadge`, lista dnia, empty, toast undo |
| 3 | Wszystkie | 20:110 / 11:80; filtr 43:114/41:85 | Częściowo (kartki) | `TaskTable` desktop (kolumny), responsywne tabela↔kartki, aktywny filtr |
| 4 | Nowe zadanie (strona) | 133:2 / 13:2 | Modal | `TaskFormPage` `/nowe`, reuse RHF/zod, pole GODZINA |
| 5 | Edycja/szczegóły | 22:2 (3-kol) / 13:59 | Modal | `TaskEditPage` `/zadanie/:id`, desktop 3-kol, „Usuń"→modal potwierdzenia |
| 6 | Szukaj | — / 15:2 | Częściowo | `SearchPage` mobile; desktop = search w topbarze |
| 7 | Filtry | 26:2 (popover) / 15:108 (sheet) | Częściowo | `FilterPanel`: desktop Popover, mobile Sheet |
| 8 | Ustawienia/Ja | 22:147 / 15:60; dark 17:80 | Częściowo | Sekcje KONTO/WYGLĄD/POWIADOMIENIA/APLIKACJA, edycja imienia, mobile „Ja" |
| 9 | Kategorie | 24:90 / (Ja→Kategorie) | Częściowo | `CategoriesPage` `/kategorie` z licznikami |

Fundament ~70% reuse. Brak: warstwa widoków/nawigacji + 4 pola modelu.

## 2. Routing
Onboarding gate przed aplikacją; dodawanie/edycja = pełne strony.
| Trasa | Widok | Forma |
|---|---|---|
| `/onboarding` | OnboardingPage | bez AppShell (BareLayout) |
| `/` → `/dzis` | TodayPage (kokpit) | AppShell |
| `/wszystkie` | AllTasksPage (tabela/kartki) | AppShell |
| `/tydzien` | AllTasksPage preset „ten tydzień" | AppShell |
| `/zrobione` | AllTasksPage preset done | AppShell |
| `/nowe` | TaskFormPage (create) | pełna strona |
| `/zadanie/:id` | TaskEditPage (edit) | pełna strona / 3-kol desktop |
| `/szukaj` | SearchPage | AppShell (mobile) |
| `/kategorie` | CategoriesPage | AppShell |
| `/ustawienia` | SettingsPage / „Ja" | AppShell |
| `*` | NotFoundPage | — |

Gate: `RequireOnboarding` — `state.user.name===''` → `<Navigate to="/onboarding">`. `TaskFormDialog`: wyciągamy `<TaskForm>` (logika RHF+zod) do reużywalnego komponentu; strony montują ten sam formularz. Na pełnej stronie wszystkie pola widoczne (bez „Więcej opcji").

## 3. Layouty responsywne
**AppShell** — jeden komponent, dwie nawigacje przez breakpoint `md` (bez JS detekcji): desktop = lewy Sidebar (logo, WIDOKI Dziś/Wszystkie/Ten tydzień/Zrobione z licznikami, KATEGORIE z kropkami+licznikami, karta usera „Imię · seria N dni"); mobile = dolny TabBar (Dziś/Lista/Szukaj/Ja, fixed bottom). Jedna tablica `NAV_ITEMS`. Onboarding/splash poza AppShell (`BareLayout`).
**Wszystkie:** desktop `TaskTable` (`<table>` semantyczny, kolumny Zadanie/Termin/Priorytet/Kategoria) `hidden md:block`; mobile `TaskList`→`TaskCard` `md:hidden`. Obie z `selectVisibleTasks`.

## 4. Zmiany modelu + migracja 1→2 (`SCHEMA_VERSION=2`)
- `Task.dueTime?: 'HH:mm'` (24h, opcjonalne; zod regex + reguła „godzina tylko z datą"; `presentation.ts` formatuje „do 18:00"). Pole UI = natywny `<input type="time">`.
- `AppState.user: { name: string }` (`''` przed onboardingiem) + akcja `user/setName`; `appStateSchema` dostaje `user`.
- `selectStreak(state, today)` + `selectTodayProgress(state, today)` jako czyste selektory **derived** (bez nowych pól stanu; memoizowane).
- Presety Dziś/Ten tydzień/Zrobione jako `datePreset` nad `selectVisibleTasks` (bez zmian danych).
- `migrate()` case 1→2: dokłada `user:{name:''}`, podbija wersję, bezstratnie dla zadań; defensywny fallback do `seedState`. `seedState`: `user:{name:''}`, `schemaVersion:2`, seed kategorii **6 szt.** (Studia/Praca/Prywatne/Dom/Zdrowie/Finanse).

## 5. Dark mode globalny
Mechanika już globalna (`data-theme` + token-swap w `globals.css`). Każdy widok na klasach tokenowych (`bg-canvas`,`text-ink`,`border-line`,`bg-surface`) dziedziczy dark. **Zasada dla nowych widoków:** zero hardcoded hexów / `bg-[#...]` — tylko tokeny (pilnuje lint/review). Dostroić tokeny ciemne wg M 17:2 / 17:80 + sekcji DESIGN SYSTEM (tło kokpitu, obwódki kart, pasek postępu, chipy). DoD: P-I — przegląd 9 ekranów w obu motywach + axe kontrast + e2e dark utrwalony po reloadzie.

## 6. Onboarding
Gate → `/onboarding`. Splash mobile (M 8:2, logo „Task", ~1.2 s / do interakcji; desktop pomija). Formularz (D 24:2/M 8:7): pole „TWOJE IMIĘ" + kafle kategorii (domyślnie zaznaczone Studia/Praca/Prywatne; dostępne Dom/Zdrowie/Finanse). „Zaczynamy →" → `user/setName` → `/dzis`. Odznaczone kategorie zostają dostępne (nie kasujemy). Render w `BareLayout`.

## 7. Stany
Empty (`EmptyState`), Done+toast „✓ Zadanie ukończone · Cofnij" (reuse `Sonner` + `task/restore` 5 s), filtr aktywny (chip+licznik), filtry desktop Popover / mobile Sheet, **usuwanie = modal potwierdzenia** (destrukcyjne — modal właściwy). `task/restore` już w reducerze.

## 8. Work breakdown (sekwencyjnie, jedno drzewo robocze)
- **P-A** Model+migracja v2 (dueTime, user.name, v2, migrate 1→2, selectStreak/Progress, presety, zod). Unit: migracja bezstratna, streak/progress, walidacja godziny.
- **P-B** Routing + AppShell v2 + gate (trasy, RequireOnboarding, BareLayout, Sidebar desktop + TabBar mobile z licznikami+kartą usera). Drawer v1 znika.
- **P-C** Onboarding + splash (D 24:2/M 8:7/8:2).
- **P-D** Kokpit „Dziś" (powitanie, ProgressBar, StreakBadge, lista dnia, empty, toast undo; D 20:2/M 11:2, empty 24:23/8:22, done 43:2/41:2, dark 17:2).
- **P-E** Wszystkie: TaskTable desktop + kartki mobile + presety tydzień/zrobione + filtr kategorii (D 20:110/M 11:80, 43:114/41:85).
- **P-F** TaskForm jako strona: wyciągnięcie `TaskForm.tsx`, `/nowe` + `/zadanie/:id` (desktop 3-kol), pole Godzina, „Usuń"+modal (D 133:2/M 13:2, D 22:2/M 13:59).
- **P-G** Filtry (Popover desktop + Sheet mobile) + Szukaj (SearchPage mobile „WYNIKI · N" + desktop topbar search) (D 26:2/M 15:108, M 15:2).
- **P-H** Ustawienia/Ja (KONTO/WYGLĄD/POWIADOMIENIA/APLIKACJA, edycja imienia, mobile „Ja") + Kategorie (`/kategorie`) (D 22:147/M 15:60, dark 17:80, D 24:90). Powiadomienia = atrapy w stanie.
- **P-I** e2e + a11y + dark sweep + perf (axe 9 ekranów light+dark, Lighthouse, breakpointy 375/768/1024/1920).

**Kolejność:** P-A → P-B → [P-C, P-D, P-E, P-H] → [P-F, P-G] → P-I.

## 9. Plan testów
Unit: migracja 1→2, selectStreak, selectTodayProgress, presety, walidacja dueTime, selectVisibleTasks. Component: TaskForm (create/edit/błąd/godzina), TaskTable, ProgressBar/StreakBadge, OnboardingPage, TabBar/Sidebar. E2E: onboarding→kokpit; dodaj `/nowe`→widoczne; odhacz→toast→cofnij; edytuj `/zadanie/:id`→usuń z potwierdzeniem; nawigacja tab-bar vs sidebar; dark po reloadzie. A11y/perf: axe 9 ekranów (light+dark), Lighthouse, breakpointy.

## 10. Self-critique (skrót)
Streak/progress derived → memoizacja; „Dziś"=dueDate===today (decyzja 11.2); układ 3-kol edycji = czysto prezentacyjny (jeden store); testy TaskFormDialog→TaskForm (logika ta sama); migracja defensywna + fallback seedState; bottom-sheet → dodać komponent `sheet` (Radix/vaul), nie wymyślać.

## 11. Decyzje produktowe (Oliver, Poziom 2, 2026-06-02)
1. **Desktop Szukaj:** pole w topbarze `/wszystkie` (filtr in-place); osobna strona Szukaj tylko mobile.
2. **„Dziś":** zadania z `dueDate === dzisiaj`.
3. **„Ten tydzień":** tydzień ISO (pon–niedz), z zaległymi z tego tygodnia.
4. **Kategorie:** „Finanse" dodane do seeda (6 kategorii); onboarding wstępnie zaznacza część, wszystkie pozostają dostępne (odznaczonych nie kasujemy).
5. **Streak:** kolejne dni (wstecz od dziś) z min. 1 ukończonym zadaniem; dzień bez ukończenia przerywa serię.
6. **Godzina:** natywny `<input type="time">`, dozwolona tylko z datą.
7. **Powiadomienia (Ustawienia):** realne przełączniki zapisywane w stanie, frontendowe atrapy (bez faktycznych powiadomień) — ekran zgodny z Figmą.

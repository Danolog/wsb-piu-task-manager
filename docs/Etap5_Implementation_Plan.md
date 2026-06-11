# Etap 5 — Plan implementacji frontendu (WSB-PIU Task Manager)

> Dokument planistyczny dla Etapu 5 (Implementacja frontend, 30% oceny). Bazuje na `PLAN.md` (sekcje 3, 5), `Etap1_Analiza_UX.md`, `Etap2_Journey_Maps.md`, briefie prowadzącego i decyzjach Darka (Tailwind + shadcn/ui, pełny zakres bonusowy, >2 tyg., testy + Lighthouse 90+ + audyt a11y).
>
> **Autor:** Ethan (CTO). **Zatwierdzone decyzje wewnętrzne (Oliver, Poziom 2, 2026-06-02):** Tailwind v4, modal zamiast tras formularza (trasy = bonus w FUTURE.md), seed kategorii + edycja w /settings, ADR-0002 → Accepted Tailwind+shadcn, Hi-Fi gotowy (Figma v0.1 + nowa ramka „Nowe zadanie").
>
> **Słownik (dla nietechnicznych):** *frontend* = warstwa aplikacji którą widzi i klika użytkownik; *scaffold* = automatyczne wygenerowanie szkieletu projektu; *reducer* = jedna funkcja która przyjmuje „polecenie" (akcję) i zwraca nowy stan aplikacji; *e2e test* = test „od końca do końca", klika aplikację jak prawdziwy użytkownik; *a11y* = accessibility, czyli dostępność dla osób z niepełnosprawnościami; *CI* = automat który po każdej zmianie sprawdza czy kod się buduje i przechodzi testy.

## 0. Stan wejściowy (snapshot 2026-06-02)

- Repo zawiera wyłącznie dokumentację. Brak `package.json`, brak katalogu `apps/`.
- `docs/wireframes/` i `docs/figma-exports/` mają tylko `.gitkeep` — eksporty Hi-Fi do dograć w trakcie (P2/P4).
- Środowisko: Node v24.13.0, npm 11.11.0 (Windows 11, PowerShell). Husky/lockfile-e wspierane.
- Konwencje z `PLAN.md` sekcja 5: Conventional Commits, branch `feature/etapN-nazwa`, PR + self-review.
- Design system odczytany z Figmy Hi-Fi v0.1 (patrz sekcja 3.4 — tokeny do mapowania).

---

## 1. Setup projektu (`apps/web/`)

Wszystkie komendy uruchamiane z katalogu głównego repo (PowerShell). Lokalizacja zgodna z `PLAN.md` sekcja 5.2.

**1.1 Scaffold Vite + React + TS**
```powershell
npm create vite@latest apps/web -- --template react-ts
Set-Location apps/web
npm install
```

**1.2 TypeScript strict** — w `apps/web/tsconfig.app.json`:
```jsonc
"strict": true,
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true,
"exactOptionalPropertyTypes": true
```

**1.3 Tailwind CSS v4** (Node 24 → wersja 4, plugin Vite zamiast PostCSS):
```powershell
npm install tailwindcss @tailwindcss/vite
```
W `vite.config.ts` dodaj plugin `tailwindcss()`. W `src/styles/globals.css` na górze `@import "tailwindcss";`. Tokeny designu z Figmy mapujemy przez `@theme { ... }` (CSS variables) — sekcja 3.4.

**1.4 shadcn/ui init**
```powershell
npx shadcn@latest init
```
Base color = neutral (nadpiszemy tokenami z Figmy), CSS variables = yes. Komponenty dodajemy paczkami (sekcja 4):
```powershell
npx shadcn@latest add button input textarea select dialog checkbox badge label sonner tabs toggle-group popover calendar
```

**1.5 Biblioteki domenowe**
```powershell
npm install react-router-dom react-hook-form @hookform/resolvers zod date-fns lucide-react uuid
```

**1.6 ESLint + Prettier**
```powershell
npm install -D prettier eslint-config-prettier prettier-plugin-tailwindcss
```
Dodaj `eslint-config-prettier` na końcu konfiguracji ESLint i `prettier-plugin-tailwindcss` (auto-sortowanie klas Tailwind).

**1.7 Husky + lint-staged** (z katalogu głównego repo — `.git` jest w roocie):
```powershell
Set-Location ../..
npm install -D husky lint-staged
npx husky init
```
`.husky/pre-commit` → `cd apps/web && npx lint-staged`. W `apps/web/package.json`:
```json
"lint-staged": { "*.{ts,tsx}": ["eslint --fix", "prettier --write"] }
```
> Decyzja: aplikacja w `apps/web/` (monorepo-ready), ale bez narzędzia monorepo (over-engineering dla 1 pakietu). `.git` w roocie; Husky odpala lint-staged ze ścieżką do `apps/web`.

**1.8 Vitest + Testing Library + Playwright**
```powershell
Set-Location apps/web
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test
npx playwright install chromium
```
`vite.config.ts` + sekcja `test` (environment `jsdom`, setup `src/test/setup.ts`). Playwright osobny `playwright.config.ts` (testy w `e2e/`, baseURL preview build).

**1.9 Skrypty npm** (`apps/web/package.json`): `dev`, `build`, `preview`, `lint`, `format`, `test`, `test:watch`, `test:e2e`, `typecheck` (`tsc --noEmit`).

---

## 2. Routing — DECYZJA: TAK (React Router v6)

Hi-Fi ma 4 widoki: lista, dodawanie, edycja, ustawienia.

**Struktura tras:**
| Trasa | Widok | Forma |
|---|---|---|
| `/` | `TasksPage` (lista + filtry + wyszukiwarka) | strona |
| `/settings` | `SettingsPage` (motyw, kategorie) | strona |
| `*` | `NotFoundPage` | strona |

**Dodawanie/edycja = modal (Dialog), NIE osobna trasa.** Uzasadnienie z journey maps: Marek chce dodawać w kontekście listy (Faza 2), Anna chce wrócić do „identycznego widoku" (Faza 5), filtrowanie in-place (decyzja 8). Trasy `/tasks/new` i `/tasks/:id/edit` = opcjonalny bonus → `FUTURE.md`.

---

## 3. Model danych + warstwa storage

### 3.1 Typy
`src/features/tasks/model.ts`:
```ts
export type TaskId = string;        // UUID v4
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'todo' | 'in_progress' | 'done';

export interface Category { id: string; name: string; color: string; } // color = token semantyczny, nie hex
export interface Task {
  id: TaskId;
  title: string;            // 1..120
  description?: string;     // 0..1000
  status: Status;
  priority: Priority;
  dueDate?: string;         // 'YYYY-MM-DD'
  categoryId?: Category['id'];
  createdAt: string; updatedAt: string; completedAt?: string;
}
export const SCHEMA_VERSION = 1 as const;
export interface AppState {
  schemaVersion: typeof SCHEMA_VERSION;
  tasks: Record<TaskId, Task>;
  categories: Record<string, Category>;
  ui: { theme: 'light' | 'dark' | 'system' };
}
```
Doprecyzowania: `dueDate` jako dzień (bez czasu); `Category.color` jako token semantyczny (dark-mode swap); `Record<id,T>` (O(1) lookup, brak duplikatów).

### 3.2 Schematy zod (DRY: formularz + persystencja)
Komunikaty PO POLSKU. `taskInputSchema` (input usera) + `appStateSchema` (walidacja localStorage). `@hookform/resolvers/zod` spina schemat z formularzem.

### 3.3 Storage z migracjami
`src/features/tasks/storage.ts`: `load()` (parse → migrate → `appStateSchema.parse` → fallback `seedState` przy błędzie), `save()` w try/catch (QuotaExceeded → toast), `migrate()` (switch po wersji). Zapis przez efekt w Providerze (nie rozproszone `useEffect`).

### 3.4 Design tokens z Figmy (Hi-Fi v0.1) → Tailwind `@theme`
Odczytane wartości do mapowania 1:1:
- **Kolory:** tło canvas (beż) `#f4efe4`; powierzchnia pól/sidebar (krem) `#fcfaf4`; powierzchnia alt. `#efe9db`; tekst ink `#221f19`, ink-soft `#5f5849`, muted `#6e6757`; linia/obwódka `#ddd6c5`; CTA tło `#221f19` / tekst `#f7f3e9`; destrukcyjny `#b23a2e`; kategoria Studia zielony `#2f6f5e` (aktywny chip = 16% alfa).
- **Typografia:** Inter (Medium etykiety wersalikowe/nav, Regular treść, Semi Bold tytuły/CTA); Caveat Bold (logo); Space Mono (URL/timestamp). Rozmiary: etykiety 10–11 px (tracking 0.8), treść 15 px, nagłówek 16 px, body 13–14 px.
- **Kształty:** padding pól 13/15 px, gap formularza 20 px, sidebar padding 20 px; radius: pola 11, nav/mini 10, chipy/przyciski pełna pigułka 999, segment priorytetu 11; obwódki resting 1.5 px `#ddd6c5`.

---

## 4. Lista komponentów + mapowanie ekranów Hi-Fi

### 4.1 Z shadcn/ui
`Button`, `Input`, `Textarea`, `Label`, `Select`, `ToggleGroup` (segmented control priorytetu), `Dialog` (modal add/edit + potwierdzenie usunięcia), `Checkbox` (toggle done, min. 32×32), `Badge`, `Popover`+`Calendar` (date picker), `Tabs` (filtr statusu), `Sonner` (toast + „Cofnij" 5 s).

### 4.2 Własne
`TaskCard` (stany todo/done — przekreślenie + przyciemnienie, nie tylko kolor), `TaskList` (grupowanie po kategorii, sekcja „Dzisiaj", sortowanie), `TaskFormDialog` (progressive disclosure, „Zapisz" + „Zapisz i dodaj nowe"), `Sidebar`/`TopBar` (nawigacja, duży opisany „+ Dodaj zadanie"), `CategoryPills` (filtr in-place), `PriorityControl` (wrapper ToggleGroup + forwardRef), `SearchBar` (debounce), `SortControl`, `EmptyState`, `ThemeToggle`.

### 4.3 Mapowanie ekranów Hi-Fi → strony/komponenty
| Ekran Hi-Fi | Strona React | Główne komponenty |
|---|---|---|
| Lista zadań | `TasksPage` (`/`) | TopBar, SearchBar, CategoryPills, Tabs, SortControl, TaskList→TaskCard, EmptyState |
| Dodawanie | modal na `TasksPage` | TaskFormDialog (create) |
| Edycja | modal na `TasksPage` | TaskFormDialog (edit, prefill) |
| Ustawienia | `SettingsPage` (`/settings`) | ThemeToggle, CRUD kategorii |
| 404 | `NotFoundPage` (`*`) | EmptyState wariant |

---

## 5. State management (useReducer + Context)

Jeden globalny `AppState`, reducer z discriminated union. Akcje: `task/add`, `task/update`, `task/delete`, `task/toggle`, `category/add`, `category/update`, `category/delete`, `ui/setTheme`, `state/hydrate`.

**Filtry/sortowanie/wyszukiwarka — POZA globalnym reducerem** (stan widoku w `TasksPage`, nie persystowany). Czysty selektor `selectVisibleTasks(state, viewFilters)` (testowalny unitowo). Decyzja udokumentowana jako ADR-0003 (do utworzenia).

Provider: `useReducer(rootReducer, undefined, load)` (lazy init ze storage), efekt `save(state)` przy zmianie, theme jako `data-theme` na `<html>`.

---

## 6. Rozbicie pracy na paczki (work breakdown)

Każda paczka = osobny branch + PR. `[RÓWNOLEGLE]` = jednocześnie po spełnieniu zależności.

- **P0 — Fundament** (blokuje wszystko): scaffold z sekcji 1, pusta `App` z routerem, CI green. DoD: dev/lint/typecheck/test/build przechodzą, commit blokowany przy błędzie, Actions zielony.
- **P1 — Model + storage + reducer** (po P0): `model.ts`, `storage.ts`, `store.ts`, `AppProvider`. DoD: 5+ unit testów, 0 `any`.
- **P2 — Design tokens + most z Figmy** (po P0) `[RÓWNOLEGLE z P1]`: `globals.css` `@theme` light+dark, `ThemeToggle`. DoD: przełączanie motywu utrwala się, kontrasty WCAG AA.
- **P3 — Prymitywy UI** (po P2): komponenty shadcn + wrappery. DoD: każdy wrapper 1 test, dostępne klawiaturą.
- **P4 — TaskCard + TaskList** (po P1, P3). DoD: testy TaskCard, status nie tylko kolorem.
- **P5 — TaskFormDialog** (po P1, P3): react-hook-form+zod, progressive disclosure, date picker, błędy po polsku. DoD: walidacja, test happy+błąd, Esc/focus trap.
- **P6 — Filtry + sortowanie + wyszukiwarka** (po P4) `[RÓWNOLEGLE z P5]`: selektor `selectVisibleTasks`. DoD: unit test selektora.
- **P7 — SettingsPage + kategorie** (po P1, P3) `[RÓWNOLEGLE z P5/P6]`: `/settings`, CRUD kategorii, `NotFoundPage`. DoD: usunięcie kategorii odpina od zadań, 404 działa.
- **P8 — Integracja + toasty + undo** (po P4–P7): spięcie na `TasksPage`, toast + „Cofnij" 5 s, modal potwierdzenia usunięcia.
- **P9 — Testy e2e + a11y + perf** (po P8): e2e Playwright, axe 0 serious, Lighthouse 90+, responsywność 375/768/1024/1920.
- **P10 — Deploy** (po P0, finał po P9): Vercel, preview per PR, link w README.

**Równoległość:** po P0 → P1+P2 → P3 → [P4→P6] ∥ [P5, P7] → P8 → P9 → P10. Realnie 3 paczki naraz.

---

## 7. Plan testów (min. 5 unit + 1 e2e)

**Unit:** reducer add/toggle/delete, migrate+parse+fallback, taskInputSchema (pusty/za długi/zła data), selectVisibleTasks.
**Component:** TaskCard (todo vs done, toggle), TaskFormDialog (błąd walidacji, dispatch add).
**E2E (Playwright):** happy path — dodaj → oznacz wykonane → usuń → znika. Opcjonalnie: dark mode utrwala się po reloadzie.

---

## 8. Deploy (Vercel)

Root Directory = `apps/web`, preset Vite, build `npm run build`, output `dist`. Preview per PR automatycznie po połączeniu repo. Brak zmiennych środowiskowych (czysty frontend, localStorage). Merge do `main` → produkcja, link w README. Opcjonalnie `vercel.json` SPA fallback dla `/settings`.

---

## 9. Mapowanie na kryteria oceniania

| Kryterium | % | Pokrycie |
|---|---|---|
| Analiza i persony | 10 | Etap 1 gotowy; implementacja realizuje potrzeby person |
| Wireframes i struktura | 10 | Trasy + komponenty odwzorowują widoki briefu |
| Projekt wizualny i Hi-Fi | 20 | Tokeny Figma→Tailwind 1:1 (P2) |
| Testy użyteczności | 10 | Osobny tor (człowiek); wdrożenie findings |
| **Implementacja frontend** | **30** | Pełny CRUD + 7 funkcji rozszerzonych, TS strict 0 any, responsywność, a11y WCAG AA, testy, CI |
| Prezentacja i dokumentacja | 20 | Commits + ADR + CHANGELOG; linki deploy/repo/Figma |

7 funkcji rozszerzonych: filtrowanie+sortowanie (P6), priorytety+terminy (P4/P5), kategorie (P4/P7), wyszukiwarka (P6), dark mode (P2), walidacja (P5), localStorage (P1).

---

## 10. Ryzyka techniczne i mitygacje

| Ryzyko | Mitygacja |
|---|---|
| Tailwind v4 + shadcn niespójność | `shadcn@latest` (wspiera v4); weryfikacja w P0; fallback pin v3 (ADR) |
| Tokeny Figma → Tailwind rozjazd | P2 mapuje 1:1 przed ekranami; MCP Figma automatyzuje eksport zmiennych |
| Kolory kategorii w dark mode | token semantyczny zamiast hex, swap w `@theme` |
| localStorage Quota/corrupted | save try/catch + toast; load waliduje zod + fallback seed |
| Bundle > 200kb | tree-shaking date-fns, shadcn kopiuje tylko użyte, Lighthouse w P9 |
| Focus trap / a11y modal | shadcn Dialog = Radix (focus trap + Esc + aria gratis) |
| Husky w układzie root/apps | pre-commit `cd apps/web`; test na realnym commicie w P0 |

---

## 11. Decyzje rozstrzygnięte (Oliver, Poziom 2, 2026-06-02)

1. **Hi-Fi gotowy** — Figma v0.1 + nowa ramka „Nowe zadanie" (node 133:2). Eksporty PNG do `docs/figma-exports/` dograne w P2/P4.
2. **Tailwind v4** (nie pin v3) — nowy standard; fallback do v3 tylko jeśli P0 pokaże niespójność z shadcn.
3. **Modal** zamiast tras formularza; trasy `/tasks/new`, `/tasks/:id/edit` → bonus w `FUTURE.md`.
4. **ADR-0002** → Accepted: Tailwind v4 + shadcn/ui.
5. **Kategorie:** seed (Studia/Praca/Prywatne/Dom/Zdrowie) + edycja w `/settings`.

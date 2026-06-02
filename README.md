# wsb-piu-task-manager

Projekt semestralny z przedmiotu **Projektowanie interfejsów użytkownika** (WSB Merito, semestr 4).

Aplikacja do zarządzania zadaniami (Task Management App) budowana w React — z naciskiem na pełen proces projektowy UX/UI: od badania użytkownika, przez journey mapping, po implementację i testy.

**Zakres (po Etapie 5 v2):** **9 ekranów logicznych** (każdy w wariancie komputer + telefon = 26 ramek Figmy), wszystkie zaimplementowane — onboarding, kokpit „Dziś", lista „Wszystkie"/„Ten tydzień"/„Zrobione", dodawanie i edycja jako pełne strony, szukaj, kategorie, ustawienia. **12 funkcji** (5 wymaganych + 7 rozszerzonych). Aplikacja działa **tylko lokalnie** (bez publikacji w internecie), dane w pamięci przeglądarki (localStorage).

## Status projektu

Projekt realizowany wg harmonogramu z briefu (7 etapów). Szczegółowy roadmap, decyzje architektoniczne i Definition of Done dla każdego etapu znajdziesz w [`PLAN.md`](./PLAN.md).

| # | Etap (wg briefu) | Status | Artefakty |
|---|------------------|--------|-----------|
| 1 | Analiza potrzeb i persony | ✅ ukończony | [`Etap1_Analiza_UX.md`](./Etap1_Analiza_UX.md) |
| 1+ | Journey Maps (bonus, poza briefem) | ✅ ukończony (Kasia, Marek, Anna + 15 cross-persona decisions) | [`Etap2_Journey_Maps.md`](./Etap2_Journey_Maps.md) |
| 2 | Low-Fi Wireframes + User Flow | ⬜ planowany | — |
| 3 | Prototyp Hi-Fidelity (Figma) | ✅ ukończony (v0.1) | [Figma — Hi-Fi v0.1](#-linki) |
| 4 | Testy użyteczności (min. 3 użytkowników) | ⬜ planowany | — |
| 5 | Implementacja frontend (React) | ✅ **ukończony (v2 — 9 ekranów)** | [`apps/web/`](./apps/web/), [`docs/Etap5_Implementation_Plan_v2.md`](./docs/Etap5_Implementation_Plan_v2.md) |
| 6 | Testy końcowe i optymalizacja | ✅ **ukończony** | [`docs/Etap6_QA.md`](./docs/Etap6_QA.md) |
| 7 | Prezentacja i dokumentacja (PDF 2–4 str.) | ✅ dokumentacja i prezentacja gotowe (oddanie czeka) | [`Etap7_Dokumentacja.md`](./Etap7_Dokumentacja.md), [`Etap7_Prezentacja.md`](./Etap7_Prezentacja.md) |

> **Uwaga dot. kolejności:** w briefie testy użyteczności (Etap 4) są **na prototypie**, przed implementacją. Wcześniejsza wersja README miała je po implementacji — obecny plan trzyma się briefu, bo testowanie na Figmie jest tańsze od przerabiania działającego kodu.

## Struktura repo

- [`Projetkowanie_projekt.pdf`](./Projetkowanie_projekt.pdf) — brief projektowy od prowadzącego (kryteria oceniania w środku)
- [`PLAN.md`](./PLAN.md) — **roadmap projektu, decyzje architektoniczne, Definition of Done** (czytaj to pierwsze przy powrocie do pracy)
- [`CHANGELOG.md`](./CHANGELOG.md) — historia zmian (Keep a Changelog + SemVer)
- [`FUTURE.md`](./FUTURE.md) — parking pomysłów poza zakresem semestru (ochrona przed scope creep)
- [`Etap1_Analiza_UX.md`](./Etap1_Analiza_UX.md) — analiza UX, persony, problemy użytkownika, zakres funkcjonalny
- [`Etap2_Journey_Maps.md`](./Etap2_Journey_Maps.md) — mapy podróży użytkownika (metodologia NN/g)
- [`TEAM_SETUP.md`](./TEAM_SETUP.md) — setup środowiska dla zespołu (git, GitHub, workflow)
- [`docs/adr/`](./docs/adr/) — **Architecture Decision Records** (dlaczego takie decyzje, a nie inne)
- [`docs/wireframes/`](./docs/wireframes/) — eksporty wireframes z Figmy (Etap 2, do wypełnienia)
- [`docs/figma-exports/`](./docs/figma-exports/) — eksporty Hi-Fi z Figmy (Etap 3, do wypełnienia)
- [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md) — checklist dla każdego PR

## Stack (stan po Etapie 5 v2)

- **Build:** Vite 8
- **Framework:** React 19 + TypeScript 6 (strict mode, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- **Styling:** Tailwind CSS v4 (plugin Vite) + shadcn/ui (na Radix) — tokeny z Figmy przez `@theme`; globalny tryb ciemny przez podmianę tokenów
- **Routing:** react-router v7 — 10 tras (`/onboarding`, `/dzis`, `/wszystkie`, `/tydzien`, `/zrobione`, `/nowe`, `/zadanie/:id`, `/szukaj`, `/kategorie`, `/ustawienia` + 404) + code-splitting tras (każdy ekran w osobnym chunku)
- **State:** `useReducer` + Context (bez dodatkowych libek)
- **Forms:** react-hook-form + zod (ten sam schemat waliduje formularz i localStorage)
- **Daty:** date-fns (import per-funkcja → tree-shaking)
- **Storage:** localStorage z wersjonowanym schematem (v2) i migracją 1→2
- **Testy:** Vitest + Testing Library (105 unit/komponent) + Playwright/Chromium (73 e2e, w tym 24 axe a11y)
- **Jakość:** ESLint + Prettier + Husky + lint-staged
- **CI/CD:** GitHub Actions (bramki jakości na każdej zmianie)

## Uruchomienie lokalne

Wymagania: Node ≥ 20 (zweryfikowane na 24), npm. Aplikacja żyje w `apps/web/`, ale `.git` jest w katalogu głównym repo.

```powershell
# 1. Zależności (z katalogu apps/web)
cd apps/web
npm install

# 2. Tryb deweloperski (http://localhost:5173)
npm run dev

# 3. Bramki jakości (wszystko musi być zielone)
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm run test        # Vitest (105 testów jednostkowych/komponentowych)
npm run build       # produkcyjny build do dist/

# 4. Podgląd produkcyjnego buildu (http://localhost:4173)
npm run preview

# 5. Testy e2e (Playwright/Chromium; build + preview odpala się automatycznie)
npm run test:e2e    # 73 testy e2e, w tym 24 axe a11y
# jednorazowo wcześniej: npx playwright install chromium
```

> **Tryb tylko lokalny:** to jest jedyny sposób uruchomienia aplikacji — właściciel zdecydował, że projekt nie jest publikowany w internecie. Dane żyją w localStorage, więc aplikacja działa offline i bez logowania.

## Uruchomienie (tylko lokalne)

> **Decyzja właściciela:** aplikacja działa **wyłącznie lokalnie** — bez publikacji w internecie, bez wdrożenia na serwer, bez publicznego repozytorium. Nie ma adresu produkcyjnego. Uruchamia się ją na własnym komputerze wg sekcji „Uruchomienie lokalne" wyżej.

- **Tryb pracy:** `npm run dev` → `http://localhost:5173`.
- **Wersja produkcyjna (do demo / prezentacji):** `npm run build && npm run preview` → `http://localhost:4173` (działa offline, bo dane są w localStorage).
- Plik `apps/web/vercel.json` (SPA-rewrite) został w repo na wypadek przyszłej zmiany decyzji, ale **nie jest używany** — żadnego wdrożenia nie ma.

## 🔗 Linki

- **Uruchomienie:** wersja lokalna (`localhost`) — patrz sekcje „Uruchomienie lokalne" i „Uruchomienie (tylko lokalne)" wyżej. Brak adresu w internecie (decyzja właściciela).
- **Figma Hi-Fi v0.1:** https://www.figma.com/design/g491nUK7eH0wODYsySBEMf/WSB-PIU-%E2%80%94-Task-Manager-%C2%B7-Hi-Fi-v0.1 (9 ekranów × komputer/telefon = 26 ramek)
- **Repozytorium:** lokalne — `wsb-piu-task-manager`, gałąź `feature/etap5-implementacja` (bez publikacji publicznej)

## Kryteria oceniania (z briefu)

| Element | Udział |
|---|---|
| Analiza użytkowników i persony | 10% |
| Wireframes i struktura aplikacji | 10% |
| Projekt wizualny i prototyp Hi-Fidelity | 20% |
| Testy użyteczności i wnioski | 10% |
| Implementacja frontendowa | **30%** |
| Jakość prezentacji i dokumentacji | 20% |

## Autor

Darek — student WSB Merito, semestr 4

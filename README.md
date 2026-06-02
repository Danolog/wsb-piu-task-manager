# wsb-piu-task-manager

Projekt semestralny z przedmiotu **Projektowanie interfejsów użytkownika** (WSB Merito, semestr 4).

Aplikacja do zarządzania zadaniami (Task Management App) budowana w React — z naciskiem na pełen proces projektowy UX/UI: od badania użytkownika, przez journey mapping, po implementację i testy.

## Status projektu

Projekt realizowany wg harmonogramu z briefu (7 etapów). Szczegółowy roadmap, decyzje architektoniczne i Definition of Done dla każdego etapu znajdziesz w [`PLAN.md`](./PLAN.md).

| # | Etap (wg briefu) | Status | Artefakty |
|---|------------------|--------|-----------|
| 1 | Analiza potrzeb i persony | ✅ ukończony | [`Etap1_Analiza_UX.md`](./Etap1_Analiza_UX.md) |
| 1+ | Journey Maps (bonus, poza briefem) | ✅ ukończony (Kasia, Marek, Anna + 15 cross-persona decisions) | [`Etap2_Journey_Maps.md`](./Etap2_Journey_Maps.md) |
| 2 | Low-Fi Wireframes + User Flow | ⬜ planowany | — |
| 3 | Prototyp Hi-Fidelity (Figma) | ✅ ukończony (v0.1) | [Figma — Hi-Fi v0.1](#-linki) |
| 4 | Testy użyteczności (min. 3 użytkowników) | ⬜ planowany | — |
| 5 | Implementacja frontend (React) | ✅ **ukończony** | [`apps/web/`](./apps/web/), [`docs/Etap5_Implementation_Plan.md`](./docs/Etap5_Implementation_Plan.md) |
| 6 | Testy końcowe i optymalizacja | 🔄 w toku | [`docs/Etap6_QA.md`](./docs/Etap6_QA.md) |
| 7 | Prezentacja i dokumentacja (PDF 2–4 str.) | ⬜ planowany | — |

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

## Stack (stan po Etapie 5)

- **Build:** Vite 8
- **Framework:** React 19 + TypeScript 6 (strict mode, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- **Styling:** Tailwind CSS v4 (plugin Vite) + shadcn/ui (na Radix) — tokeny z Figmy przez `@theme`
- **Routing:** react-router v7 (trasy: `/`, `/settings`, `*`) + code-splitting tras
- **State:** `useReducer` + Context (bez dodatkowych libek)
- **Forms:** react-hook-form + zod (ten sam schemat waliduje formularz i localStorage)
- **Daty:** date-fns (import per-funkcja → tree-shaking)
- **Storage:** localStorage z wersjonowanym schematem i migracjami
- **Testy:** Vitest + Testing Library (49 unit/komponent) + Playwright/Chromium (13 e2e)
- **Jakość:** ESLint + Prettier + Husky + lint-staged
- **CI/CD:** GitHub Actions + Vercel (preview deploys per PR)

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
npm run test        # Vitest (49 testów)
npm run build       # produkcyjny build do dist/

# 4. Podgląd produkcyjnego buildu (http://localhost:4173)
npm run preview

# 5. Testy e2e (Playwright/Chromium; build + preview odpala się automatycznie)
npm run test:e2e
# jednorazowo wcześniej: npx playwright install chromium
```

## Deploy (Vercel)

> Połączenie repo z Vercel i pierwszy deploy to **krok do wykonania przez właściciela konta** — w tej turze przygotowano tylko konfigurację (`apps/web/vercel.json` z SPA-rewrite, by twardy refresh na `/settings` nie dawał 404).

Krok po kroku (przez panel Vercel):

1. **New Project** → zaimportuj repo `wsb-piu-task-manager` z GitHuba.
2. **Root Directory = `apps/web`** (ważne — apka nie jest w katalogu głównym).
3. **Framework Preset = Vite** (build `npm run build`, output `dist`).
4. **Brak zmiennych środowiskowych** — czysty frontend, dane w localStorage.
5. Deploy → preview per PR automatycznie; merge do `main` → produkcja.

Po pierwszym deployu uzupełnij linki w sekcji niżej.

## 🔗 Linki

- **Produkcja (Vercel):** _TODO — uzupełnić po pierwszym deployu właściciela_
- **Figma Hi-Fi v0.1:** _TODO — wkleić link do pliku Figma (ramka „Nowe zadanie" node 133:2)_
- **Repozytorium:** https://github.com/ (umbrella) — `wsb-piu-task-manager`

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

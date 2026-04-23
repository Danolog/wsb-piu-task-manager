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
| 3 | Prototyp Hi-Fidelity (Figma) | ⬜ planowany | — |
| 4 | Testy użyteczności (min. 3 użytkowników) | ⬜ planowany | — |
| 5 | Implementacja frontend (React) | ⬜ planowany | — |
| 6 | Testy końcowe i optymalizacja | ⬜ planowany | — |
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

## Stack

Decyzje wstępne (patrz sekcja 3 w [`PLAN.md`](./PLAN.md)):

- **Build:** Vite
- **Framework:** React 18 + TypeScript (strict mode)
- **Styling:** CSS Modules + CSS Variables *lub* Tailwind (do decyzji)
- **State:** `useReducer` + Context (bez dodatkowych libek)
- **Forms:** react-hook-form + zod
- **Daty:** date-fns
- **Storage:** localStorage z wersjonowanym schematem
- **Testy:** Vitest + Testing Library + Playwright
- **Jakość:** ESLint + Prettier + Husky + lint-staged
- **CI/CD:** GitHub Actions + Vercel (preview deploys per PR)

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

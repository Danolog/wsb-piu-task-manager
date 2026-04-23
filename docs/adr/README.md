# Architecture Decision Records (ADR)

Ten folder zawiera **udokumentowane decyzje projektowe**. Każda ADR to jeden plik markdown opisujący jedną decyzję: co, dlaczego, jakie były alternatywy, jakie są konsekwencje.

## Po co to w ogóle istnieje

Za 3 miesiące nie będziesz pamiętał, dlaczego wybrałeś `useReducer` zamiast Zustand, albo dlaczego CSS Modules zamiast Tailwind. Albo — co gorsza — **kolega z zespołu nie będzie wiedział** i zacznie dyskusję od zera.

ADR rozwiązuje ten problem:
- **Krótka** (1 strona max)
- **Formalna** (kontekst → decyzja → konsekwencje)
- **Niezmienna** — raz podjęte decyzje się nie edytuje; jeśli zmieniasz zdanie, tworzysz nową ADR ze statusem `Supersedes 0002` i poprzednią oznaczasz `Superseded by 0005`

To jest **prawdziwy pattern z dużych firm technologicznych** (Spotify, ThoughtWorks, Microsoft). Masz go w portfolio = punkt dla rekrutera.

## Konwencja nazewnictwa

`NNNN-kebab-case-tytul.md`, gdzie NNNN to kolejny numer.

- `0001-stack-frontend.md`
- `0002-state-management.md`
- `0003-styling-approach.md`
- ...

## Status ADR

- **Proposed** — rozważane, nie zdecydowane
- **Accepted** — zaakceptowane i obowiązujące
- **Deprecated** — nieaktualne (bez następcy)
- **Superseded by XXXX** — zastąpione przez inną ADR

## Jak pisać nową ADR

1. Skopiuj `TEMPLATE.md` do `NNNN-kebab-tytul.md`
2. Wypełnij sekcje
3. Pushuj w PR — ADR **jest sama w sobie** przedmiotem code review
4. Jeśli przyjęta → merge, status `Accepted`

## Lista decyzji

| # | Tytuł | Status | Data |
|---|-------|--------|------|
| 0001 | [Stack frontend: Vite + React + TypeScript](0001-stack-frontend.md) | Accepted | 2026-04-23 |
| 0002 | [Podejście do stylowania (CSS Modules vs Tailwind)](0002-styling-approach.md) | Proposed | 2026-04-23 |

## Dalsze źródła

- Michael Nygard, oryginalny artykuł ADR: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
- ADR Tools: https://github.com/npryce/adr-tools (CLI do generowania)

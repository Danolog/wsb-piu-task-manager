# Changelog

Wszystkie istotne zmiany w projekcie będą dokumentowane w tym pliku.

Format wg [Keep a Changelog](https://keepachangelog.com/pl/1.1.0/) + [Semantic Versioning](https://semver.org/lang/pl/).

## [Unreleased]

### Added
- **Etap 7 — dokumentacja oddania:** `Etap7_Dokumentacja.md` + `docs/Etap7_Dokumentacja.html` (4 strony A4, druk→PDF), `Etap7_Prezentacja.md` (konspekt prezentacji) — zaktualizowane pod pełny zakres 9 ekranów.
- **Etap 2 (wg briefu) — Low-Fi Wireframes + User Flow.** `Etap3_Wireframes.md` (numeracja pliku przesunięta o jeden vs brief) + 21 eksportów PNG w `docs/wireframes/`: 10 widoków mobile (360×720), 9 desktop (1328×848), 2 diagramy user flow (mobile + desktop). Źródło prawdy: edytowalny plik Figma „Wireframes v2" (natywne frame'y, nie import PDF).

---

## [1.0.0] — 2026-06-02 — Etap 5 v2 (pełna implementacja, 9 ekranów) + Etap 6 (QA)

> Aplikacja urosła z 3 widoków (lista + modal) do **9 ekranów logicznych** (× komputer/telefon = 26 ramek Figmy). Gałąź `feature/etap5-implementacja`.

### Added
- **9 ekranów logicznych**, wszystkie zaimplementowane: onboarding (imię + kategorie, splash na telefonie), kokpit „Dziś" (powitanie, pasek postępu, seria), „Wszystkie", „Ten tydzień", „Zrobione", „Nowe zadanie", „Edycja zadania", „Szukaj", „Kategorie", „Ustawienia/Ja".
- **Dodawanie i edycja jako pełne strony** (`/nowe`, `/zadanie/:id`) zamiast modalu — wierność prototypowi Hi-Fi; na komputerze edycja w układzie 3-kolumnowym.
- **Onboarding gate** (`RequireOnboarding`) — bez podanego imienia aplikacja przekierowuje na ekran powitalny.
- **Dwie nawigacje:** sidebar na komputerze (widoki + kategorie z licznikami + karta usera z serią), tab-bar na telefonie (Dziś/Lista/Szukaj/Ja); przełączane progiem `md`.
- **Globalny tryb ciemny** przez podmianę tokenów — wszystkie 9 ekranów, wybór zapamiętywany.
- **Model danych v2** + migracja 1→2 (bezstratna): pole godziny zadania (`dueTime`), imię użytkownika, derived seria/postęp dnia, presety zakresu (dziś/tydzień/zrobione), seed 6 kategorii (dodano Finanse).

### Changed
- **Routing:** z 3 tras (`/`, `/settings`, `*`) na 10 tras (9 ekranów + 404), code-splitting per trasa.
- **Status „zrobione":** usunięto przygaszanie całego wiersza (zbijało kontrast tekstu) — zostają dwa kanały poza kolorem (przekreślenie + wyciszenie).

### Quality (Etap 6 QA — zmierzone realnie)
- **178 testów automatycznych** zielonych: 105 jednostkowych/komponentowych (Vitest) + 73 e2e (Playwright/Chromium), w tym **24 testy dostępności axe** na 9 ekranach w trybie jasnym i ciemnym (0 naruszeń poważnych/krytycznych).
- **Lighthouse 100/100/100/100** (wydajność/dostępność/dobre praktyki/SEO) na `/dzis` i `/wszystkie`, komputer i telefon (Performance podniesione z 86 — wcześniej mierzone błędnie na ekranie onboarding).
- Naprawione realne naruszenia kontrastu (kolory kategorii, badge „pilne") i WCAG 2.5.3 (label-in-name).
- Responsywność zweryfikowana na 375/768/1024/1920 px.

### Notes
- **Tryb tylko lokalny** (decyzja właściciela): bez publikacji w internecie, bez wdrożenia Vercel, bez publicznego repozytorium. Uruchomienie wyłącznie lokalne (`localhost`), dane w localStorage.

---

## [0.3.0] — Etap 0 (rusztowanie projektu: roadmap, ADR, journey maps)

### Added
- `PLAN.md` — główny roadmap projektu (9 sekcji: stan, mapowanie brief/ocena, decyzje architektoniczne, etap-po-etapie z DoD, konwencje, harmonogram, ryzyka, „START HERE", zasoby)
- `CHANGELOG.md` — ten plik
- `FUTURE.md` — parking pomysłów poza zakresem semestru (ochrona przed scope creep)
- `docs/adr/` — Architecture Decision Records z template'em i pierwszymi dwoma decyzjami
- `.github/PULL_REQUEST_TEMPLATE.md` — checklist dla code review
- **Journey Map Anny** — 5 faz (poranne otwarcie → przegląd → oznaczenie wykonanego → dodanie nowego → wyjście), scenariusz poniedziałek 7:45 przed lekcjami
- 6 nowych cross-persona decisions (10–15) w `Etap2_Journey_Maps.md` — duże elementy klikalne, etykiety vs placeholdery, ludzkie komunikaty błędów, auto-save, "undo over confirm", zero rozpraszaczy
- Sekcja „Wnioski dla następnych etapów" w Etap2 — 3 decyzje do przetestowania w wireframes/Hi-Fi

### Changed
- `README.md` — numeracja etapów zgodna z briefem prowadzącego; testy użyteczności **przed** implementacją (wg briefu), nie po; dodana tabela statusu + kryteria oceny + szczegółowy stack
- Status Journey Maps: z 🟡 (Anna ❌) na ✅ ukończony
- Status Etap 2 (Wireframes) w README: z ⬜ planowany na ✅ ukończony


---

## [0.2.0] — 2026-04-23 — Etap 2 (Journey Maps, częściowo)

### Added
- `Etap2_Journey_Maps.md` — mapy podróży dla Kasi i Marka wg metodologii NN/g (Journey Mapping 101)
- Sekcja „Kluczowe decyzje projektowe (cross-persona)" z 9 decyzjami wpływającymi na wireframes

### Known gaps
- Journey Map dla Anny — do dokończenia w kolejnej sesji

---

## [0.1.0] — Etap 1 (Analiza UX)

### Added
- `Etap1_Analiza_UX.md` — problem projektowy, 3 persony (Kasia, Marek, Anna), zakres funkcjonalny (minimum + rozszerzony), 4 zasady UI
- `README.md` — opis projektu i stack planowany
- `TEAM_SETUP.md` — onboarding zespołowy (GitHub, git, workflow, Conventional Commits)
- `Projetkowanie_projekt.pdf` — brief prowadzącego w repo dla kontekstu historycznego
- Inicjalizacja repo + struktura dokumentacji

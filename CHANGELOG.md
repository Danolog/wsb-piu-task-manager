# Changelog

Wszystkie istotne zmiany w projekcie będą dokumentowane w tym pliku.

Format wg [Keep a Changelog](https://keepachangelog.com/pl/1.1.0/) + [Semantic Versioning](https://semver.org/lang/pl/).

## [Unreleased]

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

```markdown
# Zasady współpracy w repozytorium

Zasada nr 1: **Nie pracujemy bezpośrednio na gałęzi `main`.** `main` to gałąź produkcyjna, na której musi znajdować się tylko czysty, działający kod. Każde zadanie robimy na osobnym branchu i łączymy przez Pull Request.

## 1. Cykl pracy (Git Flow)

1. Zaciągnij najnowsze zmiany: `git checkout main` -> `git pull`
2. Utwórz nowy branch: `git checkout -b feature/nazwa-zadania`
3. Pracuj, zapisuj pliki, rób commity.
4. Wypchnij branch: `git push -u origin feature/nazwa-zadania`
5. Utwórz Pull Request (PR) na GitHubie.
6. Po kod-review robimy Merge do głównej gałęzi.

## 2. Konwencja nazw branchy

* `feature/krotki-opis` — nowa funkcjonalność, kod lub makiety (np. `feature/etap2-wireframes`)
* `fix/krotki-opis` — poprawka błędu
* `docs/krotki-opis` — zmiany w dokumentacji

## 3. Konwencja commitów

Format: `typ: krótki opis`
* `feat:` — nowa funkcja / zrobione makiety
* `fix:` — naprawa błędu
* `docs:` — dokumentacja (np. README, PDF)
* `style:` — formatowanie (CSS)
* `refactor:` — optymalizacja kodu
* `chore:` — technikalia (zależności, czyszczenie configów)
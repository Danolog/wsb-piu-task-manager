# Setup dla zespołu — wsb-piu-task-manager

Hej! Jeśli to czytasz, to jesteś w zespole projektowym **Projektowanie interfejsów użytkownika** (WSB Merito, semestr 4). Poniżej znajdziesz wszystko, czego potrzebujesz, żeby zacząć pracować nad kodem.

**Czas na setup: ok. 15 minut.**

---

## 1. Załóż konto na GitHubie (jeśli jeszcze nie masz)

1. Wejdź na https://github.com/signup
2. Podaj email (najlepiej uczelniany — dzięki temu możesz wyrobić [GitHub Student Pack](https://education.github.com/pack) za darmo, masz np. darmowy Copilot)
3. Wybierz login **który będzie Cię reprezentował profesjonalnie** — ten nick zostanie w historii commitów i może skończyć w Twoim portfolio. `janek-kowalski-dev` > `xXx_janek_xXx`.
4. Potwierdź email.

**Gdy już masz konto — napisz Darkowi swój login na GitHubie.** Darek doda Cię do repo jako collaboratora. Dostaniesz wtedy maila z zaproszeniem albo zobaczysz baner na https://github.com. Kliknij "Accept invitation".

---

## 2. Zainstaluj git (jeśli nie masz)

### macOS

Otwórz Terminal (Cmd+Space → "Terminal"), wklej:

```bash
xcode-select --install
```

Otworzy się okienko — kliknij "Zainstaluj". Potem sprawdź:

```bash
git --version
```

Jeśli pokaże wersję (np. `git version 2.43.0`) — gotowe.

### Windows

Pobierz instalator z https://git-scm.com/download/win i zainstaluj z domyślnymi opcjami. Potem odpal **Git Bash** (zainstaluje się razem z gitem) — to tam będziesz pisał komendy git.

---

## 3. Zainstaluj GitHub CLI (opcjonalne, ale ułatwia życie)

To jest skrót do wielu operacji — w tym logowania bez wklepywania tokenów.

### macOS (z Homebrew)

```bash
brew install gh
```

Nie masz Homebrew? Jeden wiersz: https://brew.sh → skopiuj komendę z ich strony.

### Windows (z winget)

```
winget install --id GitHub.cli
```

Po instalacji — zaloguj się:

```bash
gh auth login
```

Wybieraj: **GitHub.com → HTTPS → Login with a web browser**. Wklej kod z terminala do przeglądarki, potwierdź.

---

## 4. Ustaw git config (JEDNORAZOWO)

W terminalu:

```bash
git config --global user.name "Imię Nazwisko"
git config --global user.email "twoj-login@users.noreply.github.com"
```

> Zamień `twoj-login` na swój login GitHub (np. `janek-kowalski-dev`). Dlaczego no-reply? Żeby Twój prawdziwy email nie wyświetlał się publicznie w historii commitów. Dokładny format znajdziesz w Settings → Emails → "Keep my email addresses private".

---

## 5. Sklonuj repo

Przejdź do folderu, w którym chcesz mieć projekt (np. `~/Projects`):

```bash
cd ~/Projects
gh repo clone Danolog/wsb-piu-task-manager
cd wsb-piu-task-manager
```

Bez gh CLI? Użyj:

```bash
git clone https://github.com/Danolog/wsb-piu-task-manager.git
cd wsb-piu-task-manager
```

Gotowe — masz pełną kopię projektu z historią zmian.

---

## 6. Workflow — jak pracujemy

**ZASADA NR 1: nie pracujemy bezpośrednio na `main`.** `main` to gałąź "czysta" — ma tam trafiać tylko kod, który jest przejrzany i działa.

Każde zadanie (nowy etap projektu, nowa funkcja, fix) robimy na **feature branch**.

### Cykl pracy nad jednym zadaniem

```bash
# 1. Zaciągnij najnowsze zmiany z main
git checkout main
git pull

# 2. Utwórz nowy branch dla swojego zadania
git checkout -b feature/etap3-wireframes

# 3. Pracuj, zapisuj pliki, zacommituj
git add .
git commit -m "feat: dodaj szkielet wireframes dla ekranu głównego"

# 4. Wypchnij branch na GitHub
git push -u origin feature/etap3-wireframes

# 5. Otwórz Pull Request (PR)
gh pr create --base main --fill
# albo przez przeglądarkę — GitHub sam zaproponuje po pushu
```

Po otwarciu PR:
- Zespół robi **code review** — czyta zmiany, komentuje
- Gdy ktoś zatwierdzi (Approve) — klikasz **Merge pull request**
- Twoja gałąź zostaje scalona z `main`
- Branch feature/... możesz skasować (GitHub sam proponuje "Delete branch")

### Konwencja nazw branchy

- `feature/opis-kebab-case` — nowa funkcja / nowy etap
- `fix/opis-buga` — poprawka błędu
- `docs/co-dokumentujesz` — zmiany w dokumentacji / README

### Konwencja commitów (Conventional Commits)

Format: `typ: krótki opis po polsku lub po angielsku`

- `feat:` — nowa funkcja / nowa treść
- `fix:` — naprawa błędu
- `docs:` — zmiana w dokumentacji
- `style:` — formatowanie (bez zmiany logiki)
- `refactor:` — przepisanie kodu bez zmiany działania
- `chore:` — drobiazgi (zależności, config, itp.)

Przykłady:
- `feat: dodaj mapę podróży Anny (Etap 2)`
- `fix: popraw literówkę w Etap1_Analiza_UX.md`
- `docs: zaktualizuj README o stack technologiczny`

---

## 7. Co robić, jeśli coś się wyłoży?

- **"Your branch is behind 'origin/main'"** → zrób `git pull` zanim pushujesz
- **konflikt przy pull / merge** → nie panikuj, napisz na grupę, wspólnie rozwiążemy
- **zrobiłem commit na main zamiast na branch** → `git log`, skopiuj hash, `git reset --soft <hash>`, potem `git checkout -b feature/coś` i commit jeszcze raz
- **nic nie działa, boję się tknąć** → klonuj repo na nowo do innego folderu i zacznij od tej kopii. Żadna komenda po stronie Twojego repo nie zniszczy wersji na GitHubie.

---

## 8. Pomoc

- Zespół: napisz na naszej grupie / Discordzie
- GitHub docs: https://docs.github.com/pl (po polsku!)
- Oh Shit, Git!?! — https://ohshitgit.com (szczerze: najlepsza ściąga z gitowych wtopów w internecie)

Powodzenia.

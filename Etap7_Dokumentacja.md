# WSB-PIU Task Manager — dokumentacja projektowa

> Dokumentacja oddania (wg briefu: PDF 2–4 strony). Przedmiot: **Projektowanie Interfejsów Użytkownika**, WSB Merito, sem. 4. Prowadzący: mgr inż. Bartłomiej Kizielewicz. Autor: Darek.
>
> Wersja gotowa do druku (A4 → PDF): `docs/Etap7_Dokumentacja.html` — otwórz w przeglądarce i „Drukuj → Zapisz jako PDF".
>
> **Słownik (dla osób nietechnicznych):** *frontend* — warstwa aplikacji, którą widzi i klika użytkownik; *ekran logiczny* — jeden widok aplikacji pod własnym adresem (np. „Dziś", „Ustawienia"); *modal* — okienko nakładane na ekran, bez przechodzenia na osobną stronę; *user flow* — ścieżka kroków, którą przechodzi użytkownik, by osiągnąć cel; *onboarding* — pierwsze uruchomienie, w którym aplikacja pyta o imię i kategorie; *gate* (bramka) — warunek przepuszczający dalej (tu: po podaniu imienia); *sidebar* — boczne menu na komputerze; *tab-bar* — pasek nawigacji na dole ekranu telefonu; *Hi-Fi* (high-fidelity) — szczegółowy projekt wizualny w docelowych kolorach i czcionkach (Figma); *design token* — nazwana wartość projektu (np. „kolor tła"), używana spójnie w całej apce; *localStorage* — pamięć przeglądarki, dane zostają po zamknięciu karty, bez logowania; *responsywność* — dopasowanie układu do szerokości ekranu (telefon/tablet/komputer); *a11y* (accessibility) — dostępność dla osób z niepełnosprawnościami; *axe / Lighthouse* — automatyczne narzędzia do pomiaru dostępności i wydajności.

---

## Strona 1 — Problem i persony

### Problem projektowy

Narzędzia do zarządzania zadaniami są albo **zbyt rozbudowane** (Jira, Trello, Asana — krzywa nauki, przytłaczające), albo **zbyt prymitywne** (karteczki, notatki w telefonie — gubią się, brak kategorii i terminów). Brakuje narzędzia **pośrodku**: lekkiego i intuicyjnego, które pozwala dodać zadanie w kilka sekund, a jednocześnie ma kategorie, priorytety i terminy.

### Persony (Etap 1)

**Kasia, 22 — studentka informatyki.** Wiele projektów zespołowych i kolokwiów naraz. Korzysta głównie z **telefonu, między zajęciami**. Próbowała karteczek (gubi), notatek (bałagan), Trello (za rozbudowane). **Kluczowa potrzeba: szybkość i mobilność** — dodać zadanie w 3 sekundy, jedną ręką.

**Marek, 28 — specjalista ds. marketingu z projektem po godzinach.** Świadomie nie miesza spraw prywatnych z firmowymi narzędziami (prywatność, work-life balance). Potrzebuje jednego miejsca na side-project i sprawy życiowe. **Kluczowa potrzeba: kategorie (prywatne vs projekt), priorytety, terminy, filtrowanie.**

**Anna, 58 — nauczycielka.** Sprawdziany, dyżury, sprawy domowe. Komputer głównie w pracy. Próbowała aplikacji do zadań, ale były „za napakowane" — za dużo opcji, za małe przyciski. **Kluczowa potrzeba: prostota, czytelność, duże elementy klikalne, jasne komunikaty.**

---

## Strona 2 — Struktura aplikacji, user flow + kluczowe decyzje projektowe

### 9 ekranów logicznych

Aplikacja to **9 ekranów logicznych** (każdy pod własnym adresem), zaprojektowanych w Figmie w dwóch wariantach — komputer i telefon (łącznie 26 ramek). Wszystkie zaimplementowane:

1. **Onboarding** (`/onboarding`) — pierwsze uruchomienie: imię + wybór kategorii (na telefonie poprzedzone ekranem powitalnym „splash").
2. **Dziś / kokpit** (`/dzis`) — powitanie po imieniu, pasek postępu dnia, seria (kolejne dni z ukończonym zadaniem), lista zadań na dziś.
3. **Wszystkie** (`/wszystkie`) — pełna lista: na komputerze **tabela**, na telefonie **kartki**.
4. **Ten tydzień** (`/tydzien`) i **Zrobione** (`/zrobione`) — ta sama lista z gotowymi filtrami zakresu.
5. **Nowe zadanie** (`/nowe`) — **pełna strona** formularza dodawania.
6. **Edycja zadania** (`/zadanie/:id`) — **pełna strona** edycji (na komputerze układ 3-kolumnowy), z usuwaniem przez okno potwierdzenia.
7. **Szukaj** (`/szukaj`) — wyszukiwarka (na telefonie osobny ekran; na komputerze pole w pasku górnym listy).
8. **Kategorie** (`/kategorie`) — zarządzanie kategoriami z licznikiem zadań.
9. **Ustawienia / „Ja"** (`/ustawienia`) — imię, tryb ciemny, przełączniki powiadomień, reset danych.

### Główny user flow

```
Pierwsze uruchomienie → ONBOARDING (imię + kategorie)  [bramka: bez imienia nie wejdziesz dalej]
        │
        ▼
KOKPIT „DZIŚ" (powitanie + pasek postępu + seria + zadania na dziś)
        │
        ├──► „+ Dodaj" → strona NOWE ZADANIE ───────────────────────┐
        │       tytuł + priorytet + termin + GODZINA                │
        │       (godzina aktywna dopiero po wybraniu daty)          │
        │       → Zapisz                                            │
        │                                                           │
        ├──► WSZYSTKIE / TEN TYDZIEŃ / ZROBIONE  ◄──────────────────┘
        │       komputer = tabela, telefon = kartki
        │       filtr kategorii / szukanie — in-place (bez przeładowania)
        │
        ├──► klik w checkbox → wykonane (check + przekreślenie + wyciszenie)
        │       → toast „✓ Zadanie ukończone · Cofnij" (5 s)
        │
        ├──► klik w zadanie → strona EDYCJA (/zadanie/:id, wypełniona danymi)
        │       → Zapisz  albo  Usuń → okno potwierdzenia → toast „Cofnij"
        │
        └──► USTAWIENIA: tryb ciemny (jasny/ciemny/system) + imię + KATEGORIE

Nawigacja: komputer = lewy sidebar (Widoki + Kategorie + karta usera);
           telefon = dolny tab-bar (Dziś / Lista / Szukaj / Ja).
```

### 6 kluczowych decyzji projektowych (z uzasadnieniem)

Decyzje wyprowadzone z journey map (Etap 2) i udokumentowane w Architecture Decision Records (ADR — zapis decyzji z uzasadnieniem, `docs/adr/`).

1. **Dodawanie i edycja jako pełne strony (`/nowe`, `/zadanie/:id`), nie modal.** Pierwotny plan zakładał modal; po ustaleniu pełnego zakresu Figmy decyzja zmieniła się na **pełne strony** — bo tak zaprojektowano formularz w prototypie (na komputerze edycja to układ 3-kolumnowy, niemożliwy w ciasnym okienku). Wierność prototypowi Hi-Fi była ważniejsza niż oszczędność nawigacji. Logika formularza (walidacja, pola) jest wspólna dla obu trybów — jeden komponent `TaskForm`. Na pełnej stronie wszystkie pola są od razu widoczne (bez chowania pod „Więcej opcji").

2. **Onboarding jako bramka pierwszego uruchomienia.** Zanim użytkownik zobaczy kokpit, podaje imię i wybiera kategorie. Powód: kokpit „Dziś" wita po imieniu („Cześć, Kasiu") — bez imienia powitanie byłoby puste. Bramka (`RequireOnboarding`) przekierowuje na onboarding, dopóki imię nie zostanie podane. Na telefonie poprzedza go krótki ekran powitalny (splash), na komputerze pomijany.

3. **Dwie odrębne nawigacje: sidebar na komputerze, tab-bar na telefonie.** Komputer dostaje lewy panel boczny (widoki, kategorie z licznikami, karta użytkownika z serią); telefon — dolny pasek z czterema pozycjami (Dziś / Lista / Szukaj / Ja), w zasięgu kciuka. Powód: Kasia obsługuje telefon jedną ręką w ruchu (dolny pasek), Marek i Anna pracują na większym ekranie (boczne menu z pełnym kontekstem). Przełączane wyłącznie szerokością ekranu (próg `md`), bez wykrywania urządzenia.

4. **Tryb ciemny jako globalna podmiana tokenów.** Motyw przełącza jedną zmienną na całym dokumencie, a wszystkie ekrany używają nazwanych tokenów koloru (np. „tło", „tekst", „obwódka") zamiast wpisanych na sztywno wartości. Dzięki temu każdy z 9 ekranów dziedziczy tryb ciemny automatycznie, a wybór jest zapamiętywany. Powód: spójność na wszystkich ekranach bez powielania kodu i bez ekranów „zapomnianych" przy ciemnym tle.

5. **Status zadania sygnalizowany dwukanałowo, nie samym kolorem.** Zrobione = **przekreślenie tekstu + wyciszenie**, nie tylko kolor. Powód: ok. 8% mężczyzn ma zaburzenie rozróżniania czerwieni/zieleni (deuteranopia/protanopia), a Anna ma rozpoznawać status z odległości 1 m przy biurku. Zgodne z wytyczną dostępności WCAG 1.4.1 („Use of Color"). Terminy „po terminie/dzisiaj" mają dodatkowo tekst dla czytników ekranu. (W toku QA usunięto przygaszanie całego wiersza — zbijało kontrast tekstu — zostawiając dwa kanały poza kolorem.)

6. **Stan aplikacji na `useReducer` + Context, z danymi w localStorage; stan widoku osobno.** Jedna funkcja-reducer obsługuje wszystkie zmiany danych (dodaj/edytuj/usuń/oznacz), a stan zapisuje się automatycznie do pamięci przeglądarki po każdej akcji — **bez przycisku „Zapisz", bez logowania** (Anna nie musi rozumieć „zapisywania plików"; natychmiastowy dostęp dla Kasi). Filtry, wyszukiwanie i sortowanie są **świadomie poza** tym mechanizmem (stan lokalny widoku + czysta funkcja `selectVisibleTasks`), żeby filtrowanie było płynne i nie zaśmiecało zapisu danych (ADR-0003).

> **Bonus (mostek projekt → kod):** kolory, czcionki i kształty z prototypu Hi-Fi (Figma) zmapowano **1:1** na design tokeny w kodzie (mechanizm `@theme` w Tailwind CSS), m.in. tło `#f4efe4`, tekst `#221f19`, czcionka Inter. Dzięki temu aplikacja wygląda jak prototyp, a tryb ciemny to podmiana tokenów na wszystkich 9 ekranach.

---

## Strona 3 — Testy użyteczności (metodologia + miejsce na wnioski)

### Metodologia

Zaprojektowano kompletny zestaw testów (`Etap4_Usability_Tests.md`): moderowany test typu **think-aloud** (myślenie na głos) na **działającej aplikacji**, z **3 uczestnikami** odpowiadającymi personom (student ~20 / pracujący ~25–35 / osoba mniej techniczna 50+). Podstawa: badania Jakoba Nielsena — **3 użytkowników wykrywa ok. 60–75% problemów użyteczności**, więc nie trzeba dużej próby, lecz różnych profili i dobrego scenariusza.

**Scenariusz (5 zadań na realnych 9 ekranach):** (Z1) przejdź onboarding — podaj imię i kategorie, (Z2) na ekranie „Nowe zadanie" dodaj zadanie z priorytetem, kategorią i godziną, (Z3) oznacz wykonane i cofnij (toast), (Z4) na liście „Wszystkie" przefiltruj po kategorii, (Z5) włącz tryb ciemny w Ustawieniach. Mierzone: sukces zadania (1/0), orientacyjny czas, liczba błędów, kwestionariusz **SUS** (System Usability Scale, wynik 0–100) i cytaty jakościowe.

### Wnioski z testów

> **[PLACEHOLDER — do uzupełnienia po sesjach z Etapu 4.]**
> Sesje testowe przeprowadza właściciel projektu na działającej aplikacji. Po ich wykonaniu wstaw tutaj:
> - **Top 3 problemy** (z tabeli findings, severity 1–3) i ich personę,
> - **3 wdrożone poprawki** (przed/po — krótki opis lub zrzut ekranu),
> - **średni / orientacyjny wynik SUS** (mała próba → traktować poglądowo),
> - 1–2 cytaty uczestników.
>
> **Niczego tu nie wymyślono** — dopóki sesje się nie odbędą, ta sekcja pozostaje placeholderem. Narzędzia są w pełni gotowe.

---

## Strona 4 — Implementacja i retrospektywa

### Stack technologiczny (konkretnie)

- **Build:** Vite 8 · **Framework:** React 19 + TypeScript 6 w trybie `strict` (najsurowsze sprawdzanie typów, 0 użyć `any`).
- **Styling:** Tailwind CSS v4 + komponenty shadcn/ui (na bibliotece Radix — dostępność z definicji: pułapka fokusa, ARIA, obsługa klawiaturą). Tokeny z Figmy przez `@theme`.
- **Routing:** react-router v7 — **10 tras** (onboarding, dzis, wszystkie, tydzien, zrobione, nowe, zadanie/:id, szukaj, kategorie, ustawienia + 404) z dzieleniem kodu na trasy (każdy ekran w osobnej paczce ładowanej dopiero przy wejściu).
- **Stan:** `useReducer` + Context (bez dodatkowych bibliotek), dane w localStorage z wersjonowaniem schematu (wersja 2) i migracją starych danych. **Formularze:** react-hook-form + zod (ten sam schemat waliduje formularz i dane w localStorage). **Daty:** date-fns.
- **Testy:** Vitest + Testing Library (**105** testów jednostkowych/komponentowych) + Playwright/Chromium (**73** testy „od końca do końca", w tym **24** testy dostępności narzędziem axe). **Razem 178 testów, wszystkie zielone.**
- **Jakość:** ESLint + Prettier + Husky (blokada commita przy błędzie) · **CI/CD:** GitHub Actions (zestaw bramek jakości na każdej zmianie).

### Zrealizowane funkcje (12 = 5 wymaganych + 7 rozszerzonych — wszystkie zaimplementowane)

**5 wymaganych przez brief:** dodawanie zadania · edycja · usuwanie (z opcją „Cofnij") · oznaczanie jako wykonane · lista zadań.

**7 rozszerzonych (podnoszących ocenę):** filtrowanie + sortowanie · priorytety + terminy (z godziną) · kategorie/tagi · wyszukiwarka (z opóźnieniem reakcji, by nie filtrować przy każdym znaku) · tryb ciemny (jasny/ciemny/systemowy, zapamiętywany, globalny na 9 ekranach) · walidacja formularzy (komunikaty po polsku) · zapis w localStorage (z wersjonowaniem schematu i odzyskiwaniem przy uszkodzonych danych).

### Liczby (stan QA, Etap 6 — zmierzone realnie)

- **178 testów automatycznych** zielonych (105 jednostkowych/komponentowych + 73 e2e, w tym 24 axe).
- **Lighthouse 100 / 100 / 100 / 100** (wydajność / dostępność / dobre praktyki / SEO) na ekranach `/dzis` i `/wszystkie`, w wariancie komputer **i** telefon — cztery pomiary, wszystkie po 100.
- **Dostępność: axe 0 naruszeń poważnych/krytycznych** na **9 ekranach w trybie jasnym i ciemnym** (24 testy) — zmierzone realnie, nie z audytu kodu. W toku QA naprawiono realne naruszenia kontrastu kolorów kategorii i statusu „pilne".
- **Bundle (spakowany kod) głównego wejścia: 426 kB / ~130 kB po kompresji gzip**; każdy ekran w osobnej paczce ładowanej dopiero przy wejściu (np. formularz 102 kB / 33 kB gzip dopiero na `/nowe`).
- **Responsywność zweryfikowana na 375 / 768 / 1024 / 1920 px** (telefon/tablet/laptop/desktop) — brak poziomego przewijania; potwierdzone przełączanie sidebar↔tab-bar i tabela↔kartki progiem `md`.

### Uruchomienie i dostęp

> Właściciel zdecydował o trybie **tylko lokalnym** — aplikacja nie jest publikowana w internecie (bez wdrożenia na serwerze, bez publicznego repozytorium). Uruchamia się ją na własnym komputerze; dane żyją w pamięci przeglądarki (localStorage), więc działa offline i bez logowania.

- **Uruchomienie lokalne:** w katalogu `apps/web` → `npm install`, potem `npm run dev` (tryb pracy, `http://localhost:5173`) lub `npm run build && npm run preview` (wersja produkcyjna, `http://localhost:4173`). Pełna instrukcja w `README.md`.
- **Figma Hi-Fi v0.1:** https://www.figma.com/design/g491nUK7eH0wODYsySBEMf/WSB-PIU-%E2%80%94-Task-Manager-%C2%B7-Hi-Fi-v0.1 (9 ekranów × komputer/telefon = 26 ramek).
- **Repozytorium:** lokalne (`wsb-piu-task-manager`, gałąź `feature/etap5-implementacja`) — bez publikacji publicznej (decyzja właściciela).

### Czego się nauczyłem (retrospektywa)

- **Testowanie na prototypie przed implementacją jest tańsze** niż przerabianie działającego kodu — dlatego testy użyteczności (Etap 4) są w planie **przed** kodowaniem.
- **Decyzje warto zapisywać od razu** (ADR + CHANGELOG): po tygodniach łatwo zapomnieć, „dlaczego modal, a nie strona". Zapis decyzji z uzasadnieniem to nawyk z realnej pracy.
- **Dostępność to nie dodatek na koniec** — projektowanie „statusu nie samym kolorem" i etykiet od początku było tańsze niż łatanie później.
- **Progresywne ujawnianie pogodziło sprzeczne potrzeby person** (prostota Anny vs kontrola Marka) jednym komponentem zamiast dwóch trybów.
- **TypeScript w trybie strict wymusił przemyślenie modelu danych** zanim powstał interfejs — mniej błędów później.

---

### Jak ta dokumentacja pokrywa kryteria oceniania (z briefu)

| Kryterium | Udział | Gdzie w projekcie |
|---|---|---|
| Analiza użytkowników i persony | 10% | Strona 1 (problem + 3 persony, Etap 1) |
| Wireframes i struktura aplikacji | 10% | Strona 2 (user flow, struktura tras i widoków) |
| Projekt wizualny i prototyp Hi-Fi | 20% | Strona 2 (Figma Hi-Fi v0.1, tokeny 1:1 do kodu) |
| Testy użyteczności i wnioski | 10% | Strona 3 (metodologia + zestaw `Etap4_…` + miejsce na wnioski) |
| **Implementacja frontendowa** | **30%** | Strona 4 (9 ekranów, 12 funkcji, TS strict, Lighthouse 100×4, axe 0, 178 testów) |
| Jakość prezentacji i dokumentacji | 20% | Ten dokument + `Etap7_Prezentacja.md` + ADR/CHANGELOG/commits |

---

## Self-critique (kontrola jakości dokumentu)

5 słabości i jak je domknięto:
1. **Ryzyko przekroczenia 4 stron po rozszerzeniu do 9 ekranów** → lista ekranów skondensowana (Ten tydzień/Zrobione w jednym punkcie), user flow zwięzły; treść trzyma 4 wyraźne „strony", HTML formatuje pod A4 do druku.
2. **Żargon dla nietechnicznego odbiorcy** → słowniczek rozszerzony o nowe pojęcia (onboarding, gate, sidebar, tab-bar, axe/Lighthouse, ekran logiczny) + tłumaczenie przy pierwszym użyciu.
3. **Pokusa wpisania zmyślonych wyników testów użyteczności** → sekcja testów UX ma jawny PLACEHOLDER; podane są tylko realnie zmierzone liczby techniczne (178 testów, Lighthouse 100×4, axe 0, viewporty) — wprost z `docs/Etap6_QA.md`.
4. **Niespójność liczb po skoku zakresu (stare 62 testy / 117 kB)** → wszystkie liczby podmienione na realne z `docs/Etap6_QA.md` v2.0 (105+73=178, Lighthouse 100, 426/130 kB) — zero pozostałości po starym pomiarze.
5. **Decyzja „modal" sprzeczna z realnym kodem (pełne strony)** → decyzja #1 przepisana: dodawanie/edycja to pełne strony (wierność Figmie), dodano decyzje o onboardingu, dwóch nawigacjach i globalnym trybie ciemnym; każda z 6 decyzji ma „powód" zakotwiczony w personie/prototypie — kryterium „uzasadnienie decyzji" z briefu.

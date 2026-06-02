# WSB-PIU Task Manager — dokumentacja projektowa

> Dokumentacja oddania (wg briefu: PDF 2–4 strony). Przedmiot: **Projektowanie Interfejsów Użytkownika**, WSB Merito, sem. 4. Prowadzący: mgr inż. Bartłomiej Kizielewicz. Autor: Darek.
>
> Wersja gotowa do druku (A4 → PDF): `docs/Etap7_Dokumentacja.html` — otwórz w przeglądarce i „Drukuj → Zapisz jako PDF".
>
> **Słownik (dla osób nietechnicznych):** *frontend* — warstwa aplikacji, którą widzi i klika użytkownik; *modal* — okienko nakładane na ekran (formularz dodawania), bez przechodzenia na osobną stronę; *user flow* — ścieżka kroków, którą przechodzi użytkownik, by osiągnąć cel; *Hi-Fi* (high-fidelity) — szczegółowy projekt wizualny w docelowych kolorach i czcionkach (Figma); *design token* — nazwana wartość projektu (np. „kolor tła"), używana spójnie w całej apce; *localStorage* — pamięć przeglądarki, dane zostają po zamknięciu karty, bez logowania; *responsywność* — dopasowanie układu do szerokości ekranu (telefon/tablet/komputer); *a11y* (accessibility) — dostępność dla osób z niepełnosprawnościami.

---

## Strona 1 — Problem i persony

### Problem projektowy

Narzędzia do zarządzania zadaniami są albo **zbyt rozbudowane** (Jira, Trello, Asana — krzywa nauki, przytłaczające), albo **zbyt prymitywne** (karteczki, notatki w telefonie — gubią się, brak kategorii i terminów). Brakuje narzędzia **pośrodku**: lekkiego i intuicyjnego, które pozwala dodać zadanie w kilka sekund, a jednocześnie ma kategorie, priorytety i terminy.

### Persony (Etap 1)

**Kasia, 22 — studentka informatyki.** Wiele projektów zespołowych i kolokwiów naraz. Korzysta głównie z **telefonu, między zajęciami**. Próbowała karteczek (gubi), notatek (bałagan), Trello (za rozbudowane). **Kluczowa potrzeba: szybkość i mobilność** — dodać zadanie w 3 sekundy, jedną ręką.

**Marek, 28 — specjalista ds. marketingu z projektem po godzinach.** Świadomie nie miesza spraw prywatnych z firmowymi narzędziami (prywatność, work-life balance). Potrzebuje jednego miejsca na side-project i sprawy życiowe. **Kluczowa potrzeba: kategorie (prywatne vs projekt), priorytety, terminy, filtrowanie.**

**Anna, 58 — nauczycielka.** Sprawdziany, dyżury, sprawy domowe. Komputer głównie w pracy. Próbowała aplikacji do zadań, ale były „za napakowane" — za dużo opcji, za małe przyciski. **Kluczowa potrzeba: prostota, czytelność, duże elementy klikalne, jasne komunikaty.**

---

## Strona 2 — Główny user flow + kluczowe decyzje projektowe

### Główny user flow

```
Otwarcie aplikacji (bez logowania — dane w localStorage)
        │
        ▼
Lista zadań  ──────────────────────────────────────────────┐
  • grupowanie po kategorii (kolorowe nagłówki)             │
  • sekcja „Dzisiaj" na górze                               │ filtrowanie / wyszukiwanie / sortowanie
  • wyraźne statusy (do zrobienia ↔ zrobione)               │ (in-place, bez przeładowania widoku)
        │                                                   │
        ├──► „+ Dodaj zadanie" → MODAL formularza ──────────┘
        │       tytuł + termin widoczne od razu;
        │       priorytet/kategoria/opis pod „Więcej opcji"
        │       → Zapisz (lub „Zapisz i dodaj nowe")
        │
        ├──► klik w checkbox → oznaczenie wykonane
        │       (przekreślenie + przyciemnienie + zielony check)
        │
        ├──► edycja zadania → ten sam MODAL (wypełniony danymi)
        │
        └──► usunięcie → potwierdzenie → toast „Cofnij" (5 s)

Ustawienia (/settings): przełącznik motywu (jasny/ciemny/system) + zarządzanie kategoriami
```

### 5 kluczowych decyzji projektowych (z uzasadnieniem)

Decyzje wyprowadzone z journey map (Etap 2) i udokumentowane w Architecture Decision Records (ADR — zapis decyzji z uzasadnieniem, `docs/adr/`).

1. **Dodawanie/edycja w modalu, nie na osobnej stronie.** Uzasadnienie z journey map: Marek chce dodawać zadania **w kontekście listy** (widzi, czego brakuje), a Anna chce po zapisie wrócić do **identycznego widoku**, bez „gubienia się". Modal nakłada formularz na listę i zamyka pętlę bez nawigacji. Trasy `/tasks/new` zostawiono jako pomysł na przyszłość (`FUTURE.md`).

2. **Status zadania sygnalizowany dwukanałowo, nie samym kolorem.** Zrobione = zielony check **+ przekreślenie tekstu + przyciemnienie**. Powód: ok. 8% mężczyzn ma zaburzenie rozróżniania czerwieni/zieleni (deuteranopia/protanopia), a Anna ma rozpoznawać status z odległości 1 m przy biurku. Zgodne z wytyczną dostępności WCAG 1.4.1 („Use of Color"). Terminy „po terminie/dzisiaj" mają dodatkowo tekst dla czytników ekranu.

3. **Formularz z progresywnym ujawnianiem (progressive disclosure).** Na wejściu widać tylko **tytuł i termin**; priorytet, kategoria i opis są pod rozwijaną sekcją **„Więcej opcji"**. Powód: Annę przytłacza ściana pól (chce dodać szybko), a Marek chce mieć dostęp do wszystkiego, gdy potrzebuje. Jeden formularz obsługuje oba profile. Etykiety **nad** polami (nie znikające placeholdery), komunikaty błędów po ludzku („Proszę wpisać nazwę zadania", nie „Field required").

4. **Mobile-first i duże elementy klikalne.** Układ projektowany najpierw pod telefon (kontekst Kasi), sidebar zwija się w wysuwane menu (drawer) na wąskich ekranach. Przyciski min. **44×44 px**, checkbox min. **32×32 px**, stałe miejsce zapisu na dole. Powód: Kasia klika palcem w ruchu, Anna potrzebuje dużych, przewidywalnych celów.

5. **Stan aplikacji na `useReducer` + Context, z danymi w localStorage; stan widoku osobno.** Jedna funkcja-reducer obsługuje wszystkie zmiany danych (dodaj/edytuj/usuń/oznacz), a stan zapisuje się automatycznie do pamięci przeglądarki po każdej akcji — **bez przycisku „Zapisz", bez logowania** (Anna nie musi rozumieć „zapisywania plików"; natychmiastowy dostęp dla Kasi). Filtry, wyszukiwanie i sortowanie są **świadomie poza** tym mechanizmem (stan lokalny widoku + czysta funkcja `selectVisibleTasks`), żeby filtrowanie było płynne i nie zaśmiecało zapisu danych (ADR-0003).

> **Bonus (mostek projekt → kod):** kolory, czcionki i kształty z prototypu Hi-Fi (Figma) zmapowano **1:1** na design tokeny w kodzie (mechanizm `@theme` w Tailwind CSS), m.in. tło `#f4efe4`, tekst `#221f19`, czcionka Inter. Dzięki temu aplikacja wygląda jak prototyp, a tryb ciemny to podmiana tokenów.

---

## Strona 3 — Testy użyteczności (metodologia + miejsce na wnioski)

### Metodologia

Zaprojektowano kompletny zestaw testów (`Etap4_Usability_Tests.md`): moderowany test typu **think-aloud** (myślenie na głos) na **działającej aplikacji**, z **3 uczestnikami** odpowiadającymi personom (student ~20 / pracujący ~25–35 / osoba mniej techniczna 50+). Podstawa: badania Jakoba Nielsena — **3 użytkowników wykrywa ok. 60–75% problemów użyteczności**, więc nie trzeba dużej próby, lecz różnych profili i dobrego scenariusza.

**Scenariusz (5 zadań):** (Z1) dodaj zadanie z priorytetem i kategorią, (Z2) oznacz wykonane, (Z3) filtruj po kategorii, (Z4) zmień termin, (Z5) włącz tryb ciemny. Mierzone: sukces zadania (1/0), orientacyjny czas, liczba błędów, kwestionariusz **SUS** (System Usability Scale, wynik 0–100) i cytaty jakościowe.

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
- **Routing:** react-router v7 (`/`, `/settings`, `*`) z dzieleniem kodu na trasy.
- **Stan:** `useReducer` + Context (bez dodatkowych bibliotek). **Formularze:** react-hook-form + zod (ten sam schemat waliduje formularz i dane w localStorage). **Daty:** date-fns.
- **Testy:** Vitest + Testing Library (49 testów jednostkowych/komponentowych) + Playwright/Chromium (13 testów „od końca do końca"). **Razem 62 testy, wszystkie zielone.**
- **Jakość:** ESLint + Prettier + Husky (blokada commita przy błędzie) · **CI/CD:** GitHub Actions + Vercel (podgląd per zmiana).

### Zrealizowane funkcje (12 = 5 wymaganych + 7 rozszerzonych)

**5 wymaganych przez brief:** dodawanie zadania · edycja · usuwanie (z opcją „Cofnij") · oznaczanie jako wykonane · lista zadań.

**7 rozszerzonych (podnoszących ocenę):** filtrowanie + sortowanie · priorytety + terminy · kategorie/tagi · wyszukiwarka (z opóźnieniem reakcji, by nie filtrować przy każdym znaku) · tryb ciemny (jasny/ciemny/systemowy, zapamiętywany) · walidacja formularzy (komunikaty po polsku) · zapis w localStorage (z wersjonowaniem i odzyskiwaniem przy uszkodzonych danych).

### Liczby (stan QA, Etap 6)

- **62 testy automatyczne** zielone (49 jednostkowych/komponentowych + 13 e2e).
- **Bundle (spakowany kod) głównego wejścia: ~117 kB po kompresji gzip** (z 208 kB przed podziałem na części) — formularz i ustawienia ładują się dopiero, gdy potrzebne (lazy loading), nie na starcie.
- **Responsywność zweryfikowana na 375 / 768 / 1280 px** (telefon/tablet/desktop) — brak poziomego przewijania; przy okazji wykryto i naprawiono realny błąd (pasek narzędzi wylewał się na 768 px).
- **Dostępność (a11y):** pełna obsługa klawiaturą, status nie tylko kolorem, etykiety + ARIA + komunikaty błędów, `lang="pl"` — zweryfikowane audytem kodu.

### Linki

- **Repozytorium:** `wsb-piu-task-manager` (GitHub) — _TODO: wkleić pełny URL po opublikowaniu._
- **Figma Hi-Fi v0.1:** https://www.figma.com/design/g491nUK7eH0wODYsySBEMf/WSB-PIU-%E2%80%94-Task-Manager-%C2%B7-Hi-Fi-v0.1 (ramka „Nowe zadanie", node 133:2).
- **Wdrożenie (Vercel):** _TODO: uzupełnić po pierwszym deployu właściciela (Root Directory = `apps/web`, preset Vite)._

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
| **Implementacja frontendowa** | **30%** | Strona 4 (12 funkcji, TS strict, responsywność, a11y, 62 testy) |
| Jakość prezentacji i dokumentacji | 20% | Ten dokument + `Etap7_Prezentacja.md` + ADR/CHANGELOG/commits |

---

## Self-critique (kontrola jakości dokumentu)

5 słabości i jak je domknięto:
1. **Ryzyko przekroczenia 4 stron** → treść skondensowana do 4 wyraźnych „stron"; HTML formatuje pod A4 do druku.
2. **Żargon dla nietechnicznego odbiorcy** → słowniczek na górze + tłumaczenie przy pierwszym użyciu (modal, token, lazy loading, a11y, bundle).
3. **Pokusa wpisania zmyślonych wyników testów** → sekcja testów ma jawny PLACEHOLDER; podane są tylko realnie zmierzone liczby (62 testy, 117 kB gzip, viewporty).
4. **Niespójność liczb z kodem/QA** → liczby wzięte wprost z `docs/Etap6_QA.md` (49+13=62, 208→117 kB) i `Etap1`, nie szacowane.
5. **Decyzje projektowe bez uzasadnienia (sam opis)** → każda z 5 decyzji ma „powód" zakotwiczony w konkretnej personie/journey map i ADR — kryterium „uzasadnienie decyzji" z briefu.

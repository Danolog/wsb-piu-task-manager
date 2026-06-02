# Etap 4 — Testy użyteczności (zestaw narzędzi do przeprowadzenia)

> **Status: NARZĘDZIA GOTOWE, WYNIKI PUSTE.** Ten dokument to kompletny zestaw do przeprowadzenia testów z 3 użytkownikami — scenariusz, kwestionariusz i szablony do wypełnienia. **Sekcje wyników są celowo puste.** Wypełnia je właściciel po realnych sesjach. Niczego tu nie zmyślono: dopóki sesje się nie odbędą, w tabelach wyników nie ma żadnych liczb ani cytatów.
>
> **Słownik (dla osób nietechnicznych):**
> - *think-aloud* (myślenie na głos) — uczestnik komentuje na głos co widzi i co robi, podczas gdy klika aplikację; moderator słucha i notuje.
> - *moderowany* — moderator jest obecny przy teście (na żywo lub przez wideorozmowę), prowadzi i zadaje pytania; przeciwieństwo testu, który użytkownik robi sam.
> - *SUS (System Usability Scale)* — standardowy kwestionariusz 10 pytań mierzący odczuwaną łatwość obsługi; wynik 0–100.
> - *task success* (sukces zadania) — czy uczestnik ukończył zadanie (1) czy nie (0).
> - *severity* (waga problemu) — skala 1–3 jak bardzo dany problem przeszkadza.
> - *facylitacja / facylitator* — prowadzenie sesji / osoba prowadząca (tu: właściciel projektu).

---

## 1. Cel i metodologia

**Cel:** sprawdzić, czy działająca aplikacja (Etap 5) pozwala trzem różnym typom użytkowników wykonać podstawowe zadania bez pomocy — i wyłapać konkretne miejsca, które ich blokują lub dezorientują.

**Metoda:** moderowany test typu *think-aloud* (myślenie na głos) na **działającej aplikacji** (preview build z Etapu 5, uruchomiony lokalnie: `npm run preview` → `http://localhost:4173`, albo na linku z wdrożenia gdy będzie gotowy). Uczestnik wykonuje 5 zadań, komentując na głos. Moderator obserwuje, mierzy i notuje — **nie podpowiada**.

**Dlaczego 3 użytkowników.** Jakob Nielsen (1994, *„Why You Only Need to Test with 5 Users"* / wcześniejsze badania z Landauerem) pokazał, że już **3 użytkowników wykrywa ok. 60–75% problemów użyteczności**. Nie potrzeba 20 osób — potrzeba 3 **różnych** profili odpowiadających personom z Etapu 1 i dobrego scenariusza. Każdy kolejny tester po piątym powtarza w większości te same odkrycia.

**Czas jednej sesji:** ok. 30–40 minut (5 min wprowadzenie, 20–25 min zadania, 5 min kwestionariusz SUS, 5 min pytania końcowe).

**Sprzęt i zapis:**
- Anna (mniej techniczna) i Marek — najlepiej na **laptopie/desktopie** (tak jak w ich journey mapach z Etapu 2).
- Kasia (studentka) — najlepiej na **telefonie** (jej kontekst to korzystanie w ruchu, jedną ręką).
- Zapis: za zgodą uczestnika nagranie ekranu + dźwięku (lub notatki na żywo). Zgoda obowiązkowa, dane anonimizowane (P1/P2/P3, bez nazwisk).

---

## 2. Rekrutacja — 3 profile wg person z Etapu 1

| Kod | Profil | Wiek | Odpowiada personie | Na co zwracać uwagę |
|---|---|---|---|---|
| **P1** | Student/ka, korzysta głównie z telefonu | ~20 | Kasia (studentka) | szybkość, obsługa jedną ręką, mobilność |
| **P2** | Osoba pracująca, zaawansowany user (nie programista) | ~25–35 | Marek (marketingowiec z projektem po godzinach) | kategorie, priorytety, filtrowanie |
| **P3** | Osoba mniej techniczna | ~50+ | Anna (nauczycielka) | czytelność, wielkość przycisków, jasne komunikaty |

**Zasady doboru (ważne dla wiarygodności wyników):**
- **Nie testuj ze znajomymi z branży IT ani programistami** — oni czytają interfejs tak jak autor, więc nie wyłapią problemów typowego użytkownika.
- P3 (osoba mniej techniczna, 50+) jest **najtrudniejsza do zrekrutowania, ale najważniejsza** — to ona ujawni największe luki w prostocie.
- Uczestnik **nie powinien wcześniej widzieć** aplikacji ani prototypu.

---

## 3. Scenariusz testowy (5 zadań, think-aloud)

**Instrukcja wstępna do przeczytania uczestnikowi (przeczytaj dosłownie, nie parafrazuj):**

> „Dziękuję, że pomagasz mi przetestować tę aplikację do zadań. Ważne: **testuję aplikację, nie Ciebie** — nie ma tu złych odpowiedzi, a jeśli coś nie zadziała, to wina aplikacji, nie Twoja. Poproszę Cię o wykonanie pięciu krótkich zadań. Podczas klikania **mów głośno wszystko, co myślisz** — co widzisz, czego szukasz, co Cię dziwi, co Cię cieszy. Jeśli utkniesz, spróbuj poradzić sobie sam/a tak, jakbyś był/a w domu — ja nie będę podpowiadał/a, ale to celowe. Gotowy/a? Zaczynamy."

### Zadania

| # | Zadanie (czytane uczestnikowi) | Co sprawdza | Funkcja w aplikacji |
|---|---|---|---|
| **Z1** | „Dodaj nowe zadanie: »Zapłacić rachunek za prąd do piątku«, ustaw **wysoki priorytet** i **kategorię Prywatne**." | Czy user znajduje przycisk dodawania, rozwija opcje zaawansowane (priorytet/kategoria są pod „Więcej opcji"), wybiera priorytet i kategorię | dodawanie zadania + priorytet + kategoria |
| **Z2** | „Oznacz pierwsze zadanie z listy jako **wykonane**." | Czy user znajduje checkbox (kwadracik) i rozumie zmianę stanu (przekreślenie + przyciemnienie) | oznaczanie jako wykonane |
| **Z3** | „Pokaż na liście **tylko zadania z kategorii Prywatne**." | Czy user znajduje filtr kategorii i rozumie, że lista się zawęziła | filtrowanie po kategorii |
| **Z4** | „Wybierz dowolne zadanie i **zmień jego termin** na inny dzień." | Czy user znajduje edycję, otwiera kalendarz/date picker i zapisuje | edycja zadania + termin |
| **Z5** | „Włącz **tryb ciemny** (ciemne tło aplikacji)." | Czy user znajduje przełącznik motywu | dark mode |

**Wskazówka dla moderatora:** zadania są ułożone od najprostszego do najbardziej „ukrytego". Z1 celowo wymaga rozwinięcia „Więcej opcji" (progressive disclosure) — to dobry test, czy ten wzorzec nie ukrywa funkcji zbyt głęboko.

---

## 4. Kwestionariusz SUS (System Usability Scale) — 10 pytań po polsku

Wypełnia uczestnik **po** zadaniach. Skala przy każdym pytaniu: **1 = zdecydowanie się nie zgadzam … 5 = zdecydowanie się zgadzam.**

> Instrukcja dla uczestnika: „Oceń każde zdanie według tego, jak bardzo się z nim zgadzasz. Odpowiadaj szybko, pierwszą reakcją — nie ma dobrych ani złych odpowiedzi."

| # | Pytanie | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| 1 | Chętnie korzystał(a)bym z tej aplikacji często. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | Aplikacja jest niepotrzebnie skomplikowana. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | Aplikacja jest łatwa w obsłudze. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4 | Potrzebował(a)bym pomocy osoby technicznej, żeby z niej korzystać. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 5 | Różne funkcje aplikacji są dobrze ze sobą połączone. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6 | W aplikacji jest zbyt dużo niespójności. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 7 | Myślę, że większość osób szybko nauczy się obsługi tej aplikacji. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 8 | Obsługa aplikacji jest niewygodna / uciążliwa. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 9 | Czuł(a)m się pewnie, korzystając z aplikacji. | ☐ | ☐ | ☐ | ☐ | ☐ |
| 10 | Musiał(a)bym nauczyć się wielu rzeczy, zanim zacznę sprawnie korzystać. | ☐ | ☐ | ☐ | ☐ | ☐ |

### Jak policzyć wynik SUS (0–100)

SUS daje jeden wynik na skali **0–100** (to **nie procent** — to znormalizowany wynik). Liczy się tak:

1. **Pytania nieparzyste (1, 3, 5, 7, 9):** wkład = (zaznaczona wartość) − 1.
2. **Pytania parzyste (2, 4, 6, 8, 10):** wkład = 5 − (zaznaczona wartość).
   (Pytania parzyste są sformułowane „negatywnie", dlatego liczymy je odwrotnie.)
3. **Zsumuj wkłady wszystkich 10 pytań** (suma będzie w zakresie 0–40).
4. **Pomnóż sumę × 2,5** → wynik SUS w zakresie 0–100.

**Interpretacja (Sauro/Bangor):** ~68 = średnia rynkowa; >80 = bardzo dobry; <50 = poważny problem z użytecznością. Przy 3 uczestnikach traktuj wynik **orientacyjnie** (mała próba) — kluczowe są obserwacje jakościowe z sekcji 3, nie sama liczba.

**Pomocniczy arkusz liczenia (do wypełnienia per uczestnik):**

| Pytanie | Odp. (1–5) | Wkład |
|---|---|---|
| 1 (nieparz.) | ___ | odp − 1 = ___ |
| 2 (parz.) | ___ | 5 − odp = ___ |
| 3 (nieparz.) | ___ | odp − 1 = ___ |
| 4 (parz.) | ___ | 5 − odp = ___ |
| 5 (nieparz.) | ___ | odp − 1 = ___ |
| 6 (parz.) | ___ | 5 − odp = ___ |
| 7 (nieparz.) | ___ | odp − 1 = ___ |
| 8 (parz.) | ___ | 5 − odp = ___ |
| 9 (nieparz.) | ___ | odp − 1 = ___ |
| 10 (parz.) | ___ | 5 − odp = ___ |
| **Suma wkładów** | | **___ / 40** |
| **Wynik SUS (× 2,5)** | | **___ / 100** |

---

## 5. Szablony do wypełnienia (PUSTE — uzupełnia właściciel po sesjach)

> Poniższe tabele są **celowo puste**. Nie wpisano żadnych wymyślonych danych. Wypełnij je dopiero realnymi obserwacjami z sesji.

### 5.1 Profil uczestnika (kopiuj blok dla każdego z P1/P2/P3)

| Pole | P1 | P2 | P3 |
|---|---|---|---|
| Persona (Kasia / Marek / Anna) | _____ | _____ | _____ |
| Wiek (przedział) | _____ | _____ | _____ |
| Poziom techniczny (podst./średni/zaawans.) | _____ | _____ | _____ |
| Urządzenie testu (telefon / laptop) | _____ | _____ | _____ |
| Data sesji | _____ | _____ | _____ |

### 5.2 Metryki per zadanie (kopiuj tabelę dla każdego uczestnika osobno)

**Uczestnik: P__ ( ________ )**

| Zadanie | Sukces (1/0) | Czas (orientacyjnie) | Liczba błędów | Notatki moderatora |
|---|---|---|---|---|
| Z1 — dodaj zadanie + priorytet + kategoria | ___ | ___ | ___ | |
| Z2 — oznacz wykonane | ___ | ___ | ___ | |
| Z3 — filtruj po kategorii | ___ | ___ | ___ | |
| Z4 — edytuj termin | ___ | ___ | ___ | |
| Z5 — włącz tryb ciemny | ___ | ___ | ___ | |
| **SUS uczestnika** | | | | **___ / 100** |

*„Błąd" = każde kliknięcie w złe miejsce, cofnięcie się, lub wyraźna dezorientacja przed wykonaniem zadania.*

### 5.3 Tabela findings (zbiorcza — wszystkie problemy ze wszystkich sesji)

| # | Severity (1–3) | Problem (co konkretnie zablokowało/zdezorientowało) | Dotyczy persony | Proponowana poprawka |
|---|---|---|---|---|
| F1 | ___ | | | |
| F2 | ___ | | | |
| F3 | ___ | | | |
| F4 | ___ | | | |
| F5 | ___ | | | |
| _(dodaj wiersze wg potrzeb)_ | | | | |

**Skala severity (wagi problemu):**
- **1 = krytyczny** — uczestnik nie ukończył zadania lub był poważnie zablokowany.
- **2 = średni** — ukończył, ale z wyraźnym trudem / dłuższym szukaniem.
- **3 = kosmetyczny** — drobna irytacja, nie wpływa na ukończenie.

### 5.4 Cytaty jakościowe (złoto do dokumentacji — wpisuj dosłownie)

> Zapisuj dokładne sformułowania uczestników, zwłaszcza te ujawniające dezorientację („Nie wiem gdzie kliknąć…", „A gdzie jest…?") lub satysfakcję. W dokumentacji Etapu 7 jeden trafny cytat działa mocniej niż akapit opisu.

- P1: „_____________________________"
- P2: „_____________________________"
- P3: „_____________________________"

### 5.5 Top 3 poprawki do wdrożenia (po analizie findings)

| Priorytet | Poprawka | Severity źródłowy | Status (do zrobienia / zrobione) |
|---|---|---|---|
| 1 | _____ | ___ | ___ |
| 2 | _____ | ___ | ___ |
| 3 | _____ | ___ | ___ |

---

## 6. Instrukcja dla właściciela — jak przeprowadzić sesję

### Przebieg jednej sesji (krok po kroku)
1. **Przygotuj aplikację** przed przyjściem uczestnika: `npm run preview` (lub link z wdrożenia), ekran startowy z kilkoma przykładowymi zadaniami i kategoriami (aplikacja ma seed: Studia, Praca, Prywatne, Dom, Zdrowie).
2. **Przeczytaj instrukcję wstępną** (sekcja 3) — dosłownie. Uzyskaj zgodę na nagranie.
3. **Podawaj zadania pojedynczo** (Z1…Z5), za każdym razem czekając aż uczestnik skończy lub się podda.
4. **Obserwuj i notuj** w szablonie 5.2: sukces/porażka, orientacyjny czas, błędy, cytaty.
5. **Po zadaniach** poproś o wypełnienie kwestionariusza SUS (sekcja 4).
6. **5 minut pytań końcowych** (otwartych): „Co było najłatwiejsze? Co najtrudniejsze? Czego brakowało?"

### Czego NIE robić (pułapki, które psują wyniki)
- **Nie zadawaj pytań naprowadzających.** Źle: „Czy podoba Ci się ten zielony przycisk?" Dobrze: „Co myślisz o tym ekranie?" / „Co byś teraz zrobił/a?". Pytanie nie może sugerować odpowiedzi.
- **Nie podpowiadaj, gdy uczestnik utknie.** Cisza jest niewygodna, ale to właśnie moment, w którym ujawnia się problem. Daj mu próbować. Pomóż dopiero, gdy całkowicie się zablokuje i sesja inaczej nie ruszy — i zanotuj to jako finding severity 1.
- **Nie tłumacz, „jak to działa".** Jeśli musisz wyjaśnić, to znaczy, że interfejs jest niejasny — to jest właśnie wynik testu.
- **Nie testuj z osobami z branży IT** (patrz sekcja 2).

### Jak priorytetyzować poprawki po testach
- **Severity 1 (krytyczne) → wdrażamy zawsze.** Blokują podstawowe zadania.
- **Severity 2 (średnie) → wdrażamy, jeśli poprawka jest tania** (mała zmiana w UI). Jeśli droga — do backlogu z uzasadnieniem.
- **Severity 3 (kosmetyka) → backlog** (`FUTURE.md`), chyba że poprawka jest trywialna.
- Zasada Nielsena: lepiej naprawić 3 krytyczne problemy niż 15 kosmetycznych.

### Co zrobić z wynikami
1. Wypełnij wszystkie tabele z sekcji 5.
2. Wybierz **Top 3 poprawki** (sekcja 5.5).
3. Wdrożone poprawki opisz w `CHANGELOG.md` i wnioski przenieś do dokumentacji **Etapu 7** (sekcja „Testy użyteczności").
4. Commit po wypełnieniu: `docs(etap4): wyniki testów użyteczności + top 3 poprawki`.

---

## 7. Self-critique (kontrola jakości tego dokumentu)

5 słabości tego zestawu i jak je domknięto:
1. **Ryzyko, że ktoś weźmie puste szablony za „gotowe wyniki"** → na górze i przy każdej tabeli wyników jawne ostrzeżenie „PUSTE / do wypełnienia po realnych sesjach".
2. **Żargon (think-aloud, SUS, severity, facylitacja)** → słowniczek na górze + tłumaczenie przy pierwszym użyciu.
3. **SUS bywa źle liczony (mylony z procentem, błędne odwracanie pytań parzystych)** → krok po kroku + gotowy arkusz liczenia + uwaga „to nie procent".
4. **Mała próba (3 osoby) może dać złudzenie statystyki** → wprost: wynik SUS orientacyjny, liczą się obserwacje jakościowe; uzasadnienie 60–75% (Nielsen).
5. **Scenariusz mógłby nie odpowiadać realnym funkcjom aplikacji** → 5 zadań zmapowano 1:1 na funkcje z Etapu 5 (priorytet/kategoria pod „Więcej opcji", checkbox done, filtr kategorii, edycja + kalendarz, przełącznik motywu) i na journey mapy person z Etapu 2.

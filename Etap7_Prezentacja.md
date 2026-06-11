# WSB-PIU Task Manager — konspekt prezentacji

> Konspekt wystąpienia ustnego (8 slajdów + opcjonalny tytuł/podziękowanie = ok. 9–10). Storyline: **Problem → Persony → Proces (UX) → Produkt (demo) → Wnioski.** Czas docelowy: 7–10 min. Przedmiot: Projektowanie Interfejsów Użytkownika, WSB Merito. Prowadzący: mgr inż. Bartłomiej Kizielewicz.
>
> Każdy slajd ma: **tytuł**, **treść na slajdzie** (skrót — to, co widać) i **notatki prelegenta** (to, co mówisz). Slajd nie jest scenariuszem — na ekranie mało tekstu, reszta w głowie/notatkach.
>
> **Słownik:** *user flow* — ścieżka kroków użytkownika do celu; *ekran logiczny* — jeden widok pod własnym adresem; *onboarding* — pierwsze uruchomienie (imię + kategorie); *Hi-Fi* — szczegółowy projekt wizualny (Figma); *think-aloud* — test, w którym uczestnik mówi na głos co robi; *sidebar / tab-bar* — boczne menu (komputer) / dolny pasek (telefon); *responsywność* — dopasowanie układu do ekranu; *a11y / Lighthouse* — dostępność i narzędzie do jej pomiaru oraz pomiaru wydajności.

---

## Slajd 0 (tytułowy)

**Na slajdzie:**
- WSB-PIU Task Manager
- „Lekka aplikacja do zadań — pomiędzy karteczką a Jirą."
- Imię, przedmiot, prowadzący, data

**Notatki prelegenta:** Krótko, jedno zdanie wprowadzające: „Pokażę proces zaprojektowania i zbudowania prostej aplikacji do zarządzania zadaniami — od potrzeb użytkownika do działającego kodu."

---

## Slajd 1 — Problem

**Na slajdzie:**
- Tytuł: „Problem: narzędzia są albo za duże, albo za małe"
- Dwa bieguny: **za rozbudowane** (Jira, Trello, Asana) ↔ **za prymitywne** (karteczki, notatki)
- Luka pośrodku: lekkie + intuicyjne, ale z kategoriami, priorytetami, terminami

**Notatki prelegenta:** „Ludzie albo toną w rozbudowanych narzędziach, których trzeba się uczyć, albo gubią karteczki i notatki bez struktury. Nie ma nic pośrodku — i to jest problem, który chciałem rozwiązać. Coś, w czym dodaję zadanie w kilka sekund, a mimo to mam kategorie, priorytety i terminy."

---

## Slajd 2 — Persony

**Na slajdzie (3 bloki/ikonki, nie tabele):**
- **Kasia, 22** — studentka, telefon, w biegu → *szybkość i mobilność*
- **Marek, 28** — marketing + projekt po godzinach → *kategorie, priorytety, filtry*
- **Anna, 58** — nauczycielka, mniej techniczna → *prostota, duże przyciski, jasne komunikaty*

**Notatki prelegenta:** „Zdefiniowałem trzy persony — celowo różne, bo to one napędzają wszystkie decyzje projektowe. Kasia potrzebuje szybkości na telefonie. Marek — porządku w wielu kontekstach. Anna jest najważniejsza: jeśli aplikacja działa dla niej, działa dla wszystkich. Każda decyzja, którą za chwilę pokażę, jest zakotwiczona w którejś z tych person."

---

## Slajd 3 — Proces UX i user flow

**Na slajdzie:**
- Ścieżka etapów: Analiza → Journey Maps → Hi-Fi (Figma) → Testy → Implementacja → QA
- Mały diagram głównego user flow: Onboarding → Kokpit „Dziś" → „+ Dodaj" (strona) → checkbox + cofnij → edycja (strona) → filtry in-place
- **9 ekranów logicznych** (Figma: komputer + telefon = 26 ramek)

**Notatki prelegenta:** „Pracowałem etapami, zgodnie z briefem. Najpierw analiza i persony, potem mapy podróży użytkownika metodą Nielsen Norman Group — z nich wyszły konkretne wymagania. Potem prototyp Hi-Fi w Figmie, testy użyteczności, dopiero na końcu kod. Aplikacja urosła do dziewięciu ekranów logicznych, każdy zaprojektowany w wariancie na komputer i na telefon. Przepływ zaczyna się od onboardingu — aplikacja pyta o imię i kategorie — potem kokpit »Dziś« z powitaniem i postępem dnia. Dodawanie i edycja to pełne strony, bo tak zaprojektowałem je w Figmie. Zadanie oznaczam jednym kliknięciem, z opcją cofnięcia, a listę filtruję bez przeładowania."

---

## Slajd 4 — Kluczowe decyzje projektowe (i dlaczego)

**Na slajdzie (6 punktów, każdy = decyzja + powód):**
1. **Dodawanie/edycja jako pełne strony, nie modal** → wierność prototypowi Figmy (edycja na komputerze to układ 3-kolumnowy)
2. **Onboarding jako bramka** → kokpit wita po imieniu, więc imię musi być znane od startu
3. **Dwie nawigacje: sidebar (komputer) + tab-bar (telefon)** → Kasia jedną ręką na telefonie, Marek/Anna na większym ekranie
4. **Tryb ciemny globalny** (podmiana tokenów) → wszystkie 9 ekranów dziedziczy ciemny automatycznie
5. **Status nie tylko kolorem** (przekreślenie + wyciszenie) → ~8% mężczyzn nie rozróżnia czerwieni/zieleni (WCAG 1.4.1)
6. **Auto-zapis, bez logowania** (localStorage) → natychmiastowy dostęp; filtry poza zapisem (płynność)

**Notatki prelegenta:** „To jest serce prezentacji — decyzje z uzasadnieniem, bo o to chodzi w tym przedmiocie. Najważniejsza zmiana: dodawanie i edycja to pełne strony, nie okienka. Pierwotnie planowałem modal, ale gdy doprecyzowałem projekt w Figmie, edycja na komputerze okazała się układem trzykolumnowym — nie mieści się w okienku, więc poszedłem za prototypem. Onboarding jest bramką, bo kokpit wita użytkownika po imieniu — bez imienia powitanie byłoby puste. Zrobiłem dwie nawigacje: na telefonie dolny pasek w zasięgu kciuka dla Kasi, na komputerze boczne menu dla Marka i Anny. Tryb ciemny jest globalny — jedna zmienna przełącza wszystkie dziewięć ekranów. Status sygnalizuję nie tylko kolorem, bo część użytkowników nie rozróżnia czerwieni i zieleni — to wytyczna dostępności, nie kosmetyka. Decyzje zapisałem w ADR — Architecture Decision Record — żeby było wiadomo, dlaczego tak, a nie inaczej."

---

## Slajd 5 — Produkt: demo na żywo

**Na slajdzie:**
- Tytuł: „Demo" + zrzut ekranu aplikacji (jasny + ciemny motyw obok siebie)
- Lista kroków demo (do pokazania w aplikacji, nie do czytania):
  1. Onboarding — podaj imię, wybierz kategorie → kokpit „Dziś" wita po imieniu
  2. Na stronie „Nowe zadanie" dodaj zadanie + priorytet + kategoria + godzina
  3. Oznacz wykonane → toast „Cofnij" → cofnij
  4. Lista „Wszystkie": filtruj po kategorii (komputer = tabela, telefon = kartki)
  5. Włącz tryb ciemny w Ustawieniach (cała aplikacja ciemnieje)

**Notatki prelegenta:** „Teraz pokażę to na żywo." Przejdź do aplikacji i wykonaj 5 kroków (te same co scenariusz testowy z Etapu 4 — spójność). Mów, co robisz.
> **Backup (obowiązkowy):** miej nagrany **screencast** tych 5 kroków na wypadek awarii aplikacji. Jeśli demo live padnie — przełącz na nagranie bez przerywania toku. Demo live z wersji lokalnej: `npm run preview` → `http://localhost:4173` (działa offline, bo dane w localStorage). Aplikacja działa **tylko lokalnie** — nie ma wersji w internecie, więc demo zawsze odpalasz z własnego komputera.

---

## Slajd 6 — Jak to zbudowane (implementacja)

**Na slajdzie:**
- Stack: React 19 + TypeScript (strict) · Tailwind v4 + shadcn/ui · localStorage (wersjonowanie + migracja)
- **9 ekranów** · **12 funkcji** = 5 wymaganych + 7 rozszerzonych — wszystkie zaimplementowane
- **178 testów** zielone (105 + 73, w tym 24 axe) · **Lighthouse 100/100/100/100** · **axe 0 naruszeń** (9 ekranów, jasny+ciemny) · responsywność 375/768/1024/1920

**Notatki prelegenta:** „Krótko o stronie technicznej. React z TypeScriptem w trybie strict — to wymusza myślenie o danych. Tailwind plus shadcn/ui daje gotowe, dostępne komponenty i wygląd 1:1 z Figmą, bo kolory i czcionki przeniosłem jako tokeny. Zbudowałem wszystkie dziewięć ekranów i wszystkie dwanaście funkcji — pięć wymaganych i siedem rozszerzonych. Mam 178 testów automatycznych, wszystkie zielone. Lighthouse — narzędzie Google do pomiaru jakości strony — daje sto na sto w czterech kategoriach, na komputerze i na telefonie. Audytor dostępności axe nie znajduje żadnych poważnych naruszeń na dziewięciu ekranach, w trybie jasnym i ciemnym. Działa na telefonie i komputerze, jest w pełni obsługiwalny z klawiatury."

---

## Slajd 7 — Testy użyteczności

**Na slajdzie:**
- Metoda: moderowany think-aloud, **3 użytkownicy** = 60–75% problemów (Nielsen)
- 5 zadań + kwestionariusz SUS (0–100)
- **[Wyniki — placeholder do uzupełnienia po sesjach]**: Top 3 problemy + 3 poprawki + przed/po

**Notatki prelegenta:** „Przygotowałem kompletny zestaw testów: scenariusz pięciu zadań, kwestionariusz SUS i szablony. Metoda to think-aloud z trzema osobami odpowiadającymi personom — według Nielsena trzy osoby wykrywają 60–75% problemów."
> Jeśli testy już przeprowadzone — pokaż Top 3 problemy i poprawki (przed/po). Jeśli nie — powiedz uczciwie: „Zestaw jest gotowy, sesje zaplanowane; tu pokażę wyniki i wdrożone poprawki." **Nie podawaj zmyślonych liczb.**

---

## Slajd 8 — Wnioski i czego się nauczyłem

**Na slajdzie:**
- Testować na prototypie taniej niż przerabiać kod
- Zapisywać decyzje od razu (ADR + CHANGELOG)
- Dostępność od początku, nie na końcu
- Skok zakresu (3 → 9 ekranów) wymagał zmiany decyzji (modal → pełne strony) — i to jest OK, jeśli udokumentowane
- Linki: Figma Hi-Fi · uruchomienie lokalne (`localhost`)

**Notatki prelegenta:** „Na koniec — czego mnie to nauczyło. Że taniej testować na prototypie niż przerabiać działający kod. Że decyzje trzeba zapisywać od razu, bo po tygodniu zapominam dlaczego. Że dostępność projektuje się od początku. I że gdy projekt rośnie — z trzech widoków do dziewięciu — czasem trzeba zmienić wcześniejszą decyzję, jak ta o modalu kontra pełnej stronie; ważne, żeby zmianę uzasadnić i zapisać, a nie udawać, że pierwotny plan się nie zmienił. Dziękuję, chętnie odpowiem na pytania." Na slajdzie zostaw widoczny link do Figmy i sposób uruchomienia lokalnego (aplikacja działa tylko lokalnie — nie ma adresu w internecie).

---

## Wskazówki techniczne do wygłoszenia

- **Demo live = slajd 5**, backup screencast obowiązkowy (awaria aplikacji); demo zawsze z wersji lokalnej (`localhost:4173`), bo aplikacja nie ma adresu w internecie.
- 5 kroków demo = 5 zadań ze scenariusza testowego (Etap 4) — spójność procesu.
- Czas: ~1 min/slajd treściowy + ~2 min demo = 7–10 min.
- Tryb ciemny pokaż na żywo (efektowny, jednoznaczny dowód „działa").

---

## Self-critique (kontrola jakości konspektu)

5 słabości i jak je domknięto:
1. **Ryzyko zbyt gęstych slajdów (ściana tekstu)** → rozdzielono „na slajdzie" (skrót) od „notatek prelegenta" (mowa); na ekranie minimum tekstu.
2. **Demo live bez planu B** → wymuszony backup screencast + offline preview build jako zapas.
3. **Pokusa pokazania zmyślonych wyników testów** → slajd 7 ma jawny placeholder i instrukcję „nie podawaj zmyślonych liczb".
4. **Żargon dla prowadzącego/widowni** → słowniczek na górze + rozwijanie skrótów w mowie (ADR, SUS, Lighthouse, axe, a11y).
5. **Brak spójności demo z resztą procesu** → 5 kroków demo = dokładnie 5 zadań ze scenariusza testów użyteczności (zaktualizowanych pod realne 9 ekranów), co spina narrację „proces → produkt".
6. **Stare liczby/„modal"/link do Vercel po skoku zakresu** → wszystkie slajdy podmienione na realny stan: 9 ekranów, pełne strony zamiast modalu, 178 testów + Lighthouse 100×4 + axe 0 (z `Etap6_QA.md`), tryb tylko lokalny zamiast linku do wdrożenia.

# WSB-PIU Task Manager — konspekt prezentacji

> Konspekt wystąpienia ustnego (8 slajdów + opcjonalny tytuł/podziękowanie = ok. 9–10). Storyline: **Problem → Persony → Proces (UX) → Produkt (demo) → Wnioski.** Czas docelowy: 7–10 min. Przedmiot: Projektowanie Interfejsów Użytkownika, WSB Merito. Prowadzący: mgr inż. Bartłomiej Kizielewicz.
>
> Każdy slajd ma: **tytuł**, **treść na slajdzie** (skrót — to, co widać) i **notatki prelegenta** (to, co mówisz). Slajd nie jest scenariuszem — na ekranie mało tekstu, reszta w głowie/notatkach.
>
> **Słownik:** *user flow* — ścieżka kroków użytkownika do celu; *Hi-Fi* — szczegółowy projekt wizualny (Figma); *think-aloud* — test, w którym uczestnik mówi na głos co robi; *modal* — okienko nakładane na ekran; *responsywność* — dopasowanie układu do ekranu; *a11y* — dostępność.

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
- Mały diagram głównego user flow: Lista → „+ Dodaj" (modal) → checkbox (wykonane) → edycja → filtry in-place

**Notatki prelegenta:** „Pracowałem etapami, zgodnie z briefem. Najpierw analiza i persony, potem mapy podróży użytkownika metodą Nielsen Norman Group — z nich wyszły konkretne wymagania. Potem prototyp Hi-Fi w Figmie, testy użyteczności, dopiero na końcu kod. Główny przepływ jest płaski: użytkownik widzi listę, dodaje zadanie w okienku nałożonym na listę, oznacza zrobione jednym kliknięciem, filtruje bez przeładowania."

---

## Slajd 4 — Kluczowe decyzje projektowe (i dlaczego)

**Na slajdzie (5 punktów, każdy = decyzja + persona):**
1. **Modal zamiast osobnej strony** → Marek dodaje w kontekście listy, Anna wraca do tego samego widoku
2. **Status nie tylko kolorem** (check + przekreślenie) → ~8% mężczyzn nie rozróżnia czerwieni/zieleni (WCAG)
3. **„Więcej opcji"** (progresywne ujawnianie) → prostota dla Anny, kontrola dla Marka
4. **Mobile-first, duże przyciski** (44×44 px) → Kasia na telefonie, Anna na celność
5. **Auto-zapis, bez logowania** (localStorage) → natychmiastowy dostęp

**Notatki prelegenta:** „To jest serce prezentacji — decyzje z uzasadnieniem, bo o to chodzi w tym przedmiocie. Modal, bo journey mapy pokazały, że ludzie chcą dodawać w kontekście listy. Status nie tylko kolorem, bo część użytkowników nie rozróżnia czerwieni i zieleni — to wytyczna dostępności, nie kosmetyka. »Więcej opcji« godzi sprzeczne potrzeby Anny i Marka jednym formularzem. Każdą z tych decyzji zapisałem w ADR — Architecture Decision Record — żeby było wiadomo, dlaczego tak, a nie inaczej."

---

## Slajd 5 — Produkt: demo na żywo

**Na slajdzie:**
- Tytuł: „Demo" + zrzut ekranu aplikacji (jasny + ciemny motyw obok siebie)
- Lista kroków demo (do pokazania w aplikacji, nie do czytania):
  1. Dodaj zadanie + priorytet + kategoria (rozwiń „Więcej opcji")
  2. Oznacz wykonane (check + przekreślenie)
  3. Filtruj po kategorii
  4. Edytuj termin (kalendarz)
  5. Przełącz tryb ciemny

**Notatki prelegenta:** „Teraz pokażę to na żywo." Przejdź do aplikacji i wykonaj 5 kroków (te same co scenariusz testowy z Etapu 4 — spójność). Mów, co robisz.
> **Backup (obowiązkowy):** miej nagrany **screencast** tych 5 kroków na wypadek awarii internetu/aplikacji. Jeśli demo live padnie — przełącz na nagranie bez przerywania toku. Demo live z preview build: `npm run preview` → `http://localhost:4173` (działa offline, bo dane w localStorage), albo link z wdrożenia Vercel, gdy gotowy.

---

## Slajd 6 — Jak to zbudowane (implementacja)

**Na slajdzie:**
- Stack: React 19 + TypeScript (strict) · Tailwind v4 + shadcn/ui · localStorage
- **12 funkcji** = 5 wymaganych + 7 rozszerzonych
- **62 testy** zielone · bundle **~117 kB** (gzip) · responsywność 375/768/1280 · a11y (klawiatura, ARIA)

**Notatki prelegenta:** „Krótko o stronie technicznej. React z TypeScriptem w trybie strict — to wymusza myślenie o danych. Tailwind plus shadcn/ui daje gotowe, dostępne komponenty i wygląd 1:1 z Figmą, bo kolory i czcionki przeniosłem jako tokeny. Zaimplementowałem wszystkie 5 wymaganych funkcji i 7 rozszerzonych. Mam 62 testy automatyczne, główny kod waży po kompresji około 117 kilobajtów, działa na telefonie i desktopie, jest obsługiwalny z klawiatury."

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
- Jeden komponent może pogodzić sprzeczne persony (progresywne ujawnianie)
- Linki: Repo · Figma · Wdrożenie (Vercel)

**Notatki prelegenta:** „Na koniec — czego mnie to nauczyło. Że taniej testować na prototypie niż przerabiać działający kod. Że decyzje trzeba zapisywać od razu, bo po tygodniu zapominam dlaczego. Że dostępność projektuje się od początku. I że jeden dobry wzorzec — progresywne ujawnianie — potrafi pogodzić użytkowników o sprzecznych potrzebach. Dziękuję, chętnie odpowiem na pytania." Na slajdzie zostaw widoczne linki do repo, Figmy i wdrożenia.

---

## Wskazówki techniczne do wygłoszenia

- **Demo live = slajd 5**, backup screencast obowiązkowy (awaria sieci/apki).
- 5 kroków demo = 5 zadań ze scenariusza testowego (Etap 4) — spójność procesu.
- Czas: ~1 min/slajd treściowy + ~2 min demo = 7–10 min.
- Tryb ciemny pokaż na żywo (efektowny, jednoznaczny dowód „działa").

---

## Self-critique (kontrola jakości konspektu)

5 słabości i jak je domknięto:
1. **Ryzyko zbyt gęstych slajdów (ściana tekstu)** → rozdzielono „na slajdzie" (skrót) od „notatek prelegenta" (mowa); na ekranie minimum tekstu.
2. **Demo live bez planu B** → wymuszony backup screencast + offline preview build jako zapas.
3. **Pokusa pokazania zmyślonych wyników testów** → slajd 7 ma jawny placeholder i instrukcję „nie podawaj zmyślonych liczb".
4. **Żargon dla prowadzącego/widowni** → słowniczek na górze + rozwijanie skrótów w mowie (ADR, SUS, gzip, a11y).
5. **Brak spójności demo z resztą procesu** → 5 kroków demo = dokładnie 5 zadań ze scenariusza testów użyteczności, co spina narrację „proces → produkt".

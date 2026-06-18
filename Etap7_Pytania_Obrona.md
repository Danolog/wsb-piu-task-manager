# Etap 7 — Pytania na obronę projektu (ściąga pytanie–odpowiedź)

> Przewidywane pytania prowadzącego (mgr inż. Bartłomiej Kizielewicz) podczas prezentacji,
> wraz z odpowiedziami opisanymi językiem zrozumiałym także dla osoby nietechnicznej.
> Pogrupowane: **A. Architektura kodu** · **B. Przygotowanie graficzne** · **C. Proces ↔ produkt**.
>
> Najbardziej prawdopodobne trudne pytanie to **nr 24 (testy użyteczności)** — patrz uwaga na końcu.

---

## A. Architektura kodu (implementacja — 30% oceny)

### 1. Dlaczego React + Vite + TypeScript, a nie czysty HTML/CSS/JS albo Vue?
React to dziś najpopularniejszy sposób budowania aplikacji internetowych — coś jak „standardowy język", którym mówi większość branży. Wybrałem go, bo umiejętność przekłada się wprost na realną pracę. **TypeScript** to dodatek do JavaScriptu, który pilnuje, żeby dane miały właściwy kształt — np. nie pozwoli przez pomyłkę wpisać tekstu tam, gdzie ma być data. To jak korektor, który łapie błędy zanim trafią do użytkownika. **Vite** to narzędzie, które składa aplikację i pozwala oglądać zmiany natychmiast po zapisaniu. Vue odrzuciłem, bo ma mniejszą społeczność i rzadziej pojawia się w ofertach pracy; Next.js — bo to armata na muchę, potrzebna przy dużych serwisach, a u mnie wszystko działa lokalnie.

### 2. Jak zarządzacie stanem aplikacji? Dlaczego nie Redux/Zustand?
„Stan" to po prostu cała pamięć aplikacji w danej chwili — jakie masz zadania, kategorie, czy włączony jest tryb ciemny. Trzymam to w jednym, centralnym miejscu, do którego sięgają wszystkie ekrany, dzięki czemu wszędzie widać te same, aktualne dane. Użyłem do tego mechanizmu wbudowanego w React, bez dodatkowych bibliotek typu Redux. Powód jest prosty: te biblioteki opłacają się przy dużych, skomplikowanych aplikacjach. Przy moim zakresie byłyby zbędnym balastem — wybrałem rozwiązanie prostsze i łatwiejsze do wytłumaczenia.

### 3. Dlaczego filtry i wyszukiwarka NIE są zapisywane razem z danymi?
Rozróżniam dwie rzeczy: **dane** (Twoje zadania — to musi przetrwać) i **chwilowy widok** (to, że akurat filtrujesz po kategorii „praca" albo wpisujesz coś w wyszukiwarkę). Gdybym zapisywał każde wpisane w wyszukiwarkę słowo, aplikacja zapisywałaby się na dysku przy każdym wciśnięciu klawisza — niepotrzebnie. Dlatego filtrowanie żyje „tu i teraz" na ekranie i znika po odświeżeniu, a trwale zapisuję tylko prawdziwe dane. To świadoma decyzja — nie utrata danych, tylko porządek: oddzielam to, co ważne na stałe, od tego, co tymczasowe.

### 4. Jak działa zapis danych i co przy zmianie struktury zadania?
Aplikacja zapisuje dane w **pamięci samej przeglądarki** (localStorage) — to taki prywatny notatnik na Twoim komputerze, dlatego działa bez internetu i bez logowania. Co ważne, każdy zapis ma **numer wersji**. Gdy w trakcie projektu zmieniłem strukturę zadania, napisałem „tłumacza", który dane ze starej wersji automatycznie przerabia na nową. Dzięki temu osoba, która miała już zadania, nie traci ich po aktualizacji — to jak przeprowadzka, w której meble nie lądują na śmietniku, tylko zostają ustawione w nowym mieszkaniu.

### 5. Jak walidujecie formularze? Dwa miejsca czy jedno?
„Walidacja" to sprawdzanie, czy to, co użytkownik wpisał, ma sens — np. że zadanie ma nazwę. Kluczowe jest to, że mam **jeden komplet reguł**, który pilnuje formularza w trakcie wpisywania *oraz* danych w momencie zapisu. To jeden „strażnik" na dwóch posterunkach. Dzięki temu nie zdarzy się sytuacja, że coś przejdzie przez formularz, ale zepsuje zapisane dane — bo reguła jest dokładnie ta sama w obu miejscach.

### 6. Jak zorganizowana jest struktura plików?
Kod jest poukładany jak w dobrze opisanych szufladach, a nie wrzucony na jedną kupę. Osobno trzymam **logikę zadań** (czym jest zadanie, jak je zapisać, jak filtrować), osobno **gotowe klocki interfejsu** (przyciski, okienka), a osobno **całe ekrany** złożone z tych klocków. Najważniejsza zasada: „mózg" aplikacji jest oddzielony od „wyglądu". Dzięki temu mogę zmienić wygląd przycisku bez ryzyka, że zepsuję sposób zapisywania zadań.

### 7. Co daje TypeScript w trybie strict?
Tryb strict to najbardziej rygorystyczne ustawienie tego „korektora" z pytania 1 — celowo ustawiłem poprzeczkę wysoko. Pilnuje rzeczy, o których łatwo zapomnieć: na przykład wymusza, żebym zawsze przewidział sytuację „a co, jeśli tej rzeczy nie ma?". To jak instruktor jazdy, który nie pozwala ruszyć bez zapiętych pasów. Efekt: cała klasa błędów jest wyłapywana na etapie pisania kodu, zanim ktokolwiek użyje aplikacji.

### 8. Jak działa routing i czy aplikacja ładuje wszystko naraz?
„Routing" to system adresów wewnątrz aplikacji — każdy ekran ma własny adres, jak strony w serwisie (`/dzis`, `/kategorie`). Co ważne dla szybkości: aplikacja **nie ładuje wszystkich ekranów na starcie**. Pobiera tylko ten, którego właśnie potrzebujesz, a resztę dociąga w tle, gdy na nią wchodzisz. To jak restauracja, która gotuje danie, gdy je zamówisz, a nie szykuje całe menu zanim wejdziesz.

### 9. Jakie macie testy i co pokrywają?
Mam **178 automatycznych testów** — to programy, które same sprawdzają, czy aplikacja działa, za każdym razem, gdy coś zmienię. Są na trzech poziomach: drobne (czy pojedynczy element robi swoje), średnie (czy cały ekran reaguje poprawnie) i pełne przejścia (czy użytkownik może przeklikać się przez aplikację od początku do końca). Z tych 178 aż **24 sprawdzają dostępność** — czyli czy z aplikacji skorzysta też osoba z niepełnosprawnością. Wszystkie są zielone, czyli przechodzą.

### 10. Jak pilnujecie jakości przy każdej zmianie?
Mam ustawione automatyczne „bramki jakości", przez które musi przejść każda zmiana, zanim zostanie zapisana. Część działa od razu na moim komputerze przy zapisie, część na serwerze po wysłaniu zmiany. Sprawdzają: czy nie ma błędów, czy kod jest jednolicie sformatowany i czy wszystkie testy przechodzą. To jak kontrola na lotnisku — nic nie przechodzi dalej, dopóki nie jest „zielone". Dzięki temu nie da się przypadkiem zepsuć działającej aplikacji.

### 11. Jak zapewniacie responsywność (dopasowanie do telefonu i komputera)?
Aplikacja sama rozpoznaje, na jak szerokim ekranie jest wyświetlana, i przestawia układ. Na komputerze menu jest z boku, lista zadań wygląda jak **tabela**. Na telefonie menu wędruje na dół, w zasięg kciuka, a zadania pokazują się jako **kartki**, wygodniejsze na wąskim ekranie. Sprawdziłem to na czterech typowych szerokościach — od małego telefonu po duży monitor.

### 12. Dlaczego dodawanie i edycja to pełne strony, a nie wyskakujące okienko?
Na początku planowałem okienko (modal), ale gdy dopracowałem projekt w Figmie, edycja na komputerze rozrosła się do układu trzykolumnowego — to się po prostu nie mieści w okienku. Poszedłem więc za projektem i zrobiłem z tego pełne strony. To dobry przykład świadomej zmiany decyzji w trakcie — i co ważne, **opisałem dlaczego**, zamiast udawać, że plan się nie zmienił.

### 13. Czym jest ADR i po co go prowadzicie?
ADR (Architecture Decision Record) to „dziennik decyzji" — krótka notatka, którą zapisuję za każdym razem, gdy podejmuję ważny wybór: jaki był problem, jakie miałem opcje, co wybrałem i dlaczego. Po tygodniu człowiek zapomina, czemu coś zrobił tak, a nie inaczej — ADR jest na to lekarstwem. To też wprost odpowiada na to, co prowadzący ceni najbardziej: uzasadnianie decyzji. Mam udokumentowane trzy kluczowe: wybór technologii, sposób stylowania i sposób trzymania filtrów.

### 14. Skoro nie ma serwera, jak to działa offline i czy dane przetrwają?
Cała aplikacja działa na Twoim komputerze i zapisuje dane lokalnie, w przeglądarce. Dlatego nie potrzebuje internetu ani logowania, a Twoje zadania są po restarcie komputera nadal na miejscu. Jedyne, co znika po odświeżeniu, to chwilowe filtry — i to celowo, bo to nie są dane, tylko sposób, w jaki w danej chwili patrzysz na listę.

---

## B. Przygotowanie graficzne (projekt wizualny + Hi-Fi — 20% oceny)

### 15. Jak osiągnęliście zgodność wyglądu kodu z projektem w Figmie?
W Figmie zdefiniowałem **tokeny** — to nazwane „klocki wyglądu": konkretne kolory, rozmiary czcionek, odstępy. Te same tokeny przeniosłem do kodu, więc aplikacja używa dokładnie tych wartości co projekt. To jak wspólna paleta barw dla malarza i drukarni — kolor „niebieski podstawowy" znaczy to samo w obu miejscach. Dzięki temu aplikacja wygląda jak prototyp, a nie „mniej więcej tak".

### 16. Jak działa tryb ciemny i czemu „globalnie"?
Tryb ciemny zrobiłem przez podmianę wspomnianych tokenów — zmieniam jeden centralny zestaw kolorów, a **wszystkie ekrany ciemnieją automatycznie**. Nie musiałem przerabiać każdego ekranu z osobna. To jak ściemniacz światła w domu: jeden przełącznik, a zmienia się oświetlenie we wszystkich pokojach. Na prezentacji to świetny moment na żywo — jedno kliknięcie i cała aplikacja się przełącza.

### 17. Jak dobraliście kolory, czcionki i ikony?
Kierowałem się prostotą i czytelnością, bo jedna z moich person — Anna, mniej techniczna — potrzebuje dużych przycisków i jasnych komunikatów. Dobrałem spójną paletę kolorów (z wyraźnym kolorem akcji), jedną rodzinę czcionek z czytelną hierarchią rozmiarów (nagłówek większy, treść mniejsza) oraz jeden spójny zestaw ikon, żeby nic nie „gryzło się" stylem. Cały sens to spójność: użytkownik nie powinien czuć, że przechodzi między ekranami z różnych aplikacji.

### 18. Jak zadbaliście o dostępność w warstwie wizualnej?
Najważniejsza zasada: **status zadania nie jest pokazany tylko kolorem**. Wykonane zadanie jest dodatkowo przekreślone i wyszarzone. Robię tak, bo około 8% mężczyzn nie rozróżnia czerwieni i zieleni — dla nich sam kolor to za mało. Poza tym dbam o odpowiedni kontrast i o to, żeby z aplikacji dało się korzystać samą klawiaturą. To nie kosmetyka, tylko oficjalna wytyczna dostępności (WCAG 1.4.1) — a potwierdza to automatyczny audyt, który nie znajduje żadnych naruszeń.

### 19. Co znaczy „spójność komponentów" i jak ją osiągnęliście?
„Komponent" to powtarzalny klocek interfejsu — przycisk, okienko, lista rozwijana. Spójność znaczy, że ten sam typ klocka wygląda i zachowuje się identycznie na każdym ekranie. Osiągnąłem to, budując aplikację z jednego, wspólnego zestawu takich klocków, zamiast za każdym razem robić przycisk od nowa. Efekt: użytkownik raz uczy się, jak coś działa, i ta wiedza działa wszędzie w aplikacji.

### 20. Jak prototyp z Figmy przełożył się na aplikację? Czy coś się zmieniło?
Zaprojektowałem 9 ekranów, każdy w wersji na komputer i na telefon — razem 26 ramek w Figmie. Wszystkie powstały też w kodzie. Największa zmiana między projektem a kodem to wspomniane przejście z okienka na pełne strony przy edycji. Uczciwie to pokazuję: prototyp to nie sztywny kontrakt, tylko punkt wyjścia, który dopracowuje się w trakcie — ważne, że każdą zmianę umiem uzasadnić.

### 21. Jak optymalizowaliście grafikę i czas ładowania?
Zadbałem, żeby aplikacja ładowała się szybko: pobiera tylko potrzebny w danej chwili ekran (a nie wszystko naraz), używa wyłącznie tych elementów wyglądu, które są faktycznie potrzebne, i nie ciągnie zbędnego kodu ani ciężkich obrazów. Efekt potwierdza **Lighthouse** — narzędzie Google do oceny jakości stron — które daje aplikacji komplet 100 punktów w czterech kategoriach, zarówno na komputerze, jak i na telefonie.

### 22. Dlaczego shadcn/ui zamiast gotowej biblioteki komponentów?
shadcn/ui działa inaczej niż typowa biblioteka: zamiast doklejać zewnętrzny pakiet, **kopiuję gotowe klocki bezpośrednio do swojego projektu**. Mam więc pełną kontrolę nad ich wyglądem i mogę je dopasować 1:1 do mojego projektu z Figmy. A pod spodem mają wbudowaną dostępność — poprawną obsługę klawiatury i czytników ekranu — więc nie wymyślam tego od zera.

---

## C. Pytania spinające proces z produktem

### 23. Pokażcie, jak konkretna persona wpłynęła na konkretną decyzję.
Każda decyzja ma „twarz". **Kasia** — studentka w biegu, obsługuje telefon jedną ręką — dlatego na telefonie menu jest na dole, w zasięgu kciuka. **Anna** — nauczycielka, mniej techniczna — dlatego duże przyciski, jasne komunikaty i status pokazany nie tylko kolorem. **Marek** — pracuje w wielu kontekstach naraz — dlatego kategorie, priorytety i filtry. Nic nie robiłem „bo ładnie"; za każdym wyborem stoi konkretna potrzeba konkretnej osoby.

### 24. Co wyszło z testów użyteczności z 3 użytkownikami?
Tu trzeba być uczciwym — i to ważne, bo to nasz najsłabszy punkt. Mam **przygotowany kompletny zestaw**: scenariusz pięciu zadań, kwestionariusz oceny i metodę „think-aloud", czyli test, w którym uczestnik na głos mówi, co robi i co go myli. Według badań Nielsena już trzy osoby wykrywają 60–75% problemów. Jeśli do obrony zdążymy przeprowadzić sesje — pokażę trzy największe problemy i wprowadzone poprawki, z porównaniem przed/po. Jeśli nie — powiem wprost: „zestaw gotowy, sesje zaplanowane". **Nie podaję zmyślonych liczb** — prowadzący od razu by to wychwycił.

---

## ⚠️ Uwaga końcowa — najsłabszy punkt
Pytanie **24 (testy użyteczności)** jest najbardziej prawdopodobnym „trudnym" pytaniem, bo testy
to osobne 10% oceny, a brief mocno akcentuje „dokumentowanie zmian wynikających z testów".
Jeśli jest jakakolwiek możliwość przeprowadzenia choćby trzech krótkich sesji przed obroną —
to najlepiej zainwestowany czas, jaki został. W przeciwnym razie odpowiadać uczciwie, bez zmyślonych liczb.

## Szybka ściąga skrótów (gdyby prowadzący dopytał o termin)
- **ADR** — zapis decyzji projektowej (problem → opcje → wybór → dlaczego).
- **localStorage** — pamięć przeglądarki na Twoim komputerze; działa offline, bez logowania.
- **responsywność** — automatyczne dopasowanie układu do szerokości ekranu.
- **token** — nazwany „klocek wyglądu" (kolor, czcionka, odstęp) wspólny dla Figmy i kodu.
- **komponent** — powtarzalny klocek interfejsu (przycisk, okienko).
- **a11y / dostępność** — możliwość korzystania z aplikacji przez osoby z niepełnosprawnością.
- **Lighthouse** — narzędzie Google do oceny jakości i szybkości strony (0–100).
- **think-aloud** — test, w którym uczestnik na głos mówi, co robi i co go myli.

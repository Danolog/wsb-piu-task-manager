# Dokumentacja Projektowa: Aplikacja Task Manager
**Przedmiot:** Projektowanie Interfejsów Użytkownika  
**Autorzy:** Dariusz Gradzik, Mateusz Jendzul, Piotr Kiecko, Piotr Dobraniecki  

---

## 1. Opis problemu projektowego i Persony

Istniejące na rynku aplikacje do zarządzania zadaniami (np. Jira, Trello, Asana) często cechują się stromą krzywą uczenia się i są zbyt przeładowane funkcjami do prostego, codziennego użytku. Z kolei podstawowe narzędzia, takie jak wbudowane notatniki czy papierowe karteczki, prowadzą do chaosu informacyjnego i nie oferują kluczowych funkcji, takich jak kategoryzacja czy priorytetyzacja. 

Celem niniejszego projektu było stworzenie rozwiązania pośredniego – lekkiej, szybkiej i intuicyjnej aplikacji webowej/mobilnej, która pozwala na błyskawiczne dodanie zadania, oferując jednocześnie zaawansowane możliwości zarządzania kategoriami, priorytetami oraz terminami (Deadlines).

### Persony

* **Kasia (22 lata) – Studentka Informatyki**
    * **Context:** Realizuje wiele projektów akademickich i przygotowuje się do kolokwiów. Korzysta z aplikacji w biegu, między zajęciami, głównie na urządzeniu mobilnym.
    * **Oczekiwania:** Ekstremalna szybkość działania, wysoka responsywność oraz możliwość dodania zadania jedną ręką w kilka sekund.
* **Marek (28 lat) – Specjalista ds. Marketingu**
    * **Context:** Prowadzi własny projekt po godzinach. Świadomie oddziela życie prywatne i poboczne inicjatywy od firmowych, korporacyjnych narzędzi.
    * **Oczekiwania:** Przejrzysty podział na konteksty (np. praca, dom, studia) oraz zaawansowane możliwości filtrowania i oznaczania priorytetów.
* **Anna (58 lat) – Nauczycielka**
    * **Context:** Zarządza terminami sprawdzianów, dyżurów oraz sprawami domowymi. Z komputera korzysta głównie przy biurku.
    * **Oczekiwania:** Prostota, brak przeładowania zbędnymi opcjami, duże i czytelne elementy klikalne (hitboxes) oraz jasne komunikaty systemowe.

---

## 2. Struktura aplikacji i User Flow

Aplikacja została zaprojektowana w sposób iteracyjny, z uwzględnieniem dedykowanych widoków na urządzenia mobilne (wykorzystujących dolny pasek nawigacji – *Bottom Tab-bar*) oraz wersję desktopową (lewy boczny panel nawigacyjny – *Sidebar*). 

### Kluczowe ekrany i komponenty:
* **Kokpit (Dziś):** Ekran główny z szybkim przeglądem zadań bieżących na dany dzień.
* **Wszystkie zadania:** Widok listy z możliwością filtrowania (układ tabelaryczny dla Desktopu, widok dynamicznych kart dla Mobile).
* **Nowe zadanie:** Formularz osadzony w centralnym oknie modalnym.
* **Edycja i Szczegóły:** Panel boczny (*Drawer*) wysuwany po kliknięciu w konkretne zadanie.
* **Ustawienia:** Ekran zarządzania profilem, konfiguracji kategorii oraz zmiany motywu interfejsu (jasny/ciemny).

### Główny przepływ użytkownika (User Flow)
1. Wejście do aplikacji → Domyślny widok **Kokpitu (Dziś)**.
2. Kliknięcie przycisku **„+ Nowe zadanie”** → Otwarcie centralnego okna modalnego.
3. Wypełnienie formularza (tytuł, data, priorytet, kategoria) → Kliknięcie **„Zapisz”**.
4. Automatyczny powrót do widoku Kokpitu lub Listy Wszystkich zadań (aktualizacja stanu w czasie rzeczywistym).
5. *(Opcjonalnie)* Użycie filtrów z górnego paska narzędziowego → Dynamiczne zawężenie wyświetlanej listy.
6. Kliknięcie w wybrane zadanie na liście → Otwarcie prawego panelu bocznego ze szczegółami i edycją.
7. Zaznaczenie checkboxa przy zadaniu → Wizualne wyciszenie i przekreślenie elementu (oznaczenie jako wykonane).
8. Kliknięcie **„Usuń zadanie”** w panelu bocznym → Wywołanie modala potwierdzającego → Całkowite usunięcie zadania z listy.

---

## 3. Wnioski z testów użyteczności

W celu weryfikacji założeń projektowych przeprowadzono moderowane testy użyteczności z wykorzystaniem metodologii głośnego myślenia (*think-aloud*). W testach wzięli udział przedstawiciele zdefiniowanych grup docelowych, operując na prototypach High-Fidelity oraz wczesnej wersji implementacyjnej. Badaniu poddano kluczowe procesy: nawigację, dodawanie, edycję, filtrowanie oraz usuwanie zadań.

### Zidentyfikowane problemy i wdrożone poprawki:

* **Problem 1:** Słaba widoczność aktywnej zakładki w bocznym pasku nawigacji na desktopie.  
    *Poprawka:* Wdrożono wyraźniejsze wyróżnienie wizualne (zastosowanie kontrastowego tła oraz pogrubienia czcionki) dla aktualnie wybranego elementu menu.
* **Problem 2:** Brak jednoznacznego potwierdzenia usunięcia zadania (usunięty element zachowywał się identycznie jak zadanie ukończone – poprzez przekreślenie).  
    *Poprawka:* Zaktualizowano logikę UI. Po zatwierdzeniu akcji w dedykowanym oknie modalnym, zadanie jest całkowicie usuwane z widoku struktury listy.
* **Problem 3:** Niska reaktywność komponentów filtrujących.  
    *Poprawka:* Skorygowano i zoptymalizowano nasłuchiwanie zdarzeń (*event listeners*) na komponentach typu checkbox oraz radio button w modalu filtrów, co zapewniło płynne i natychmiastowe sortowanie danych.
* **Problem 4:** Obcinanie długich nazw filtrów i kategorii na ekranach urządzeń mobilnych.  
    *Poprawka:* Zastosowano elastyczny kontener z właściwością zawijania tekstu (*text wrapping*) wewnątrz mobilnych komponentów interfejsu.

---

## 4. Uzasadnienie najważniejszych decyzji projektowych

* **Kontekstowa nawigacja (Responsive Design):** Zastosowano podejście łączące zasady *Mobile-First* i *Desktop-Second*. Wdrożono dwa niezależne wzorce nawigacyjne zależne od rozdzielczości ekranu: *Bottom Tab-bar* na urządzeniach mobilnych (optymalizacja pod kątem obsługi kciukiem jednej ręki) oraz boczny *Sidebar* na desktopie (efektywne zagospodarowanie przestrzeni roboczej).
* **Zachowanie kontekstu poprzez okna modalne i panele boczne (Drawers):** Zamiast kosztownych wydajnościowo i dezorientujących przekierowań na osobne podstrony, operacje tworzenia i edycji osadzono w modalach oraz wysuwanych panelach. Dzięki temu użytkownik nigdy nie traci z oczu głównej listy zadań.
* **Dwukanałowa sygnalizacja statusów (Dostępność / WCAG):** Aby zapewnić pełną dostępność cyfrową dla osób z zaburzeniami rozpoznawania barw, stan ukończenia zadania sygnalizowany jest dwukanałowo: poprzez zmianę kontrastu/koloru (wyciszenie) oraz modyfikację stylu tekstu (przekreślenie).
* **Implementacja Ciemnego Motywu (Dark Mode) jako standardu:** Decyzja o pełnym wsparciu dla architektury tokenów ciemnego motywu wynikała bezpośrednio z potrzeb persony Kasi (redukcja zmęczenia wzroku podczas pracy w warunkach nocnych).

---

## 5. Implementacja Frontendowa (Podsumowanie Techniczne)

Projekt został zrealizowany jako w pełni responsywna aplikacja frontendowa z wykorzystaniem nowoczesnego stosu technologicznego komponentów interfejsu. Wdrożono kompletną architekturę CRUD (Create, Read, Update, Delete) w odniesieniu do zarządzania zadaniami oraz zaimplementowano wymagane funkcjonalności zaawansowane:

* **Dynamiczne filtrowanie:** Mechanizm wielokryterialnego filtrowania danych w czasie rzeczywistym w oparciu o przypisane priorytety i kategorie.
* **Zaawansowana walidacja formularzy:** Walidacja wprowadzanych danych po stronie klienta (*client-side validation*) w czasie rzeczywistym, zapobiegająca przesłaniu pustych pól lub nieprawidłowych formatów dat.
* **Persystencja danych (State Persistence):** Wykorzystanie mechanizmu pamięci przeglądarki (`localStorage`) do lokalnego przechowywania stanu aplikacji. Zapewnia to trwałość danych i zachowanie wpisów użytkownika pomiędzy sesjami bez konieczności wdrażania zewnętrznej architektury bazodanowej.
* **Globalne zarządzanie motywem:** Implementacja przełącznika trybów (Light/Dark Mode) sterującego globalnymi tokenami stylów interfejsu, gwarantująca spójność wizualną wszystkich komponentów aplikacji.
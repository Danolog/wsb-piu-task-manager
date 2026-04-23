# Etap 2 — Journey Maps użytkowników

Metodologia: Journey Mapping wg NN/g (Nielsen Norman Group, "Journey Mapping 101").
Dla każdej persony tworzymy mapę z elementami: Fazy, Akcje, Myśli, Emocje, Szanse (Opportunities).

---

## Journey Map — Kasia (Studentka, 22 lata)

**Scenariusz:** Kasia jest na przerwie między wykładami. Dowiedziała się, że termin projektu zespołowego przesunięto na piątek. Chce szybko zmienić datę w aplikacji.

### Faza 1 — Otwarcie aplikacji
| Element | Opis |
|---------|------|
| **Akcja** | Odblokowanie telefonu → kliknięcie ikony aplikacji → ekran główny |
| **Myśl** | "Muszę to ogarnąć szybko, zaraz mam wykład." |
| **Emocja** | Neutralna → lekki stres (presja czasu) |
| **Szansa** | Brak logowania (localStorage), natychmiastowy dostęp do treści |

### Faza 2 — Znalezienie projektu
| Element | Opis |
|---------|------|
| **Akcja** | Kliknięcie dropdown → przejrzenie listy alfabetycznej → wybór projektu palcem |
| **Myśl** | "Mam sporo projektów, gdzie jest ten właściwy?" |
| **Emocja** | Potencjalna frustracja jeśli dużo pozycji → ulga gdy szybko znajduje |
| **Szansa** | Dropdown z listą alfabetyczną + wyszukiwarka z autosuggest jako alternatywa. Tagi jako dodatkowa metoda wyszukiwania. Dwie drogi do tego samego celu. |

### Faza 3 — Edycja daty
| Element | Opis |
|---------|------|
| **Akcja** | Kliknięcie "Edytuj" → kliknięcie pola daty → klawiatura numeryczna DD→MM→RRRR → wizualna weryfikacja na podglądzie kalendarza |
| **Myśl** | "Czy mogę to zrobić jedną ręką? Czy data jest poprawna?" |
| **Emocja** | Poczucie kontroli — widzi co robi, może zweryfikować wizualnie |
| **Szansa** | Klawiatura numeryczna zamiast małego kalendarza, autofocus przeskakujący między polami DD→MM→RRRR, podgląd kalendarza (cały miesiąc) jako wizualna walidacja, możliwość zapisu po zmianie samego dnia bez przechodzenia przez MM i RRRR. Obsługa jedną ręką. |

### Faza 4 — Zapis i wyjście
| Element | Opis |
|---------|------|
| **Akcja** | Kliknięcie dużego zielonego przycisku → zapis daty i projektu jednocześnie → powrót do ekranu głównego |
| **Myśl** | "Czy się zapisało?" |
| **Emocja** | Satysfakcja, ulga, poczucie sprawczości |
| **Szansa** | Jeden przycisk zapisuje wszystko (data + projekt), popup potwierdza sukces, ekran główny gotowy do kolejnej akcji. Przycisk zapisu w stałym, przewidywalnym miejscu (dół ekranu). |

---

## Journey Map — Marek (Marketingowiec z side-projectem, 28 lat)

**Scenariusz:** Piątkowy wieczór, Marek planuje weekend — zadania side-projectowe i prywatne. Chce dodać nowe zadania, poukładać priorytetami i widzieć osobno kategorie.

### Faza 1 — Otwarcie i orientacja
| Element | Opis |
|---------|------|
| **Akcja** | Otwiera aplikację na laptopie, przegląda istniejące zadania |
| **Myśl** | "Co tu mam? Które z tego jest side-project, a które prywatne?" |
| **Emocja** | Lekka irytacja jeśli zadania nie są wizualnie rozdzielone |
| **Szansa** | Zadania grupowane pod kolorowymi nagłówkami kategorii (każda kategoria ma swój kolor nagłówka i listy). Możliwość filtrowania po kategoriach, priorytetach, datach. |

### Faza 2 — Dodawanie nowych zadań
| Element | Opis |
|---------|------|
| **Akcja** | Przegląda istniejące zadania w kategorii → stwierdza czego brakuje → klika wyróżniony przycisk "Dodaj" |
| **Myśl** | "Ten artykuł na bloga jeszcze nie jest zapisany, muszę go dodać." |
| **Emocja** | Ulga że szybko zorientował się co ma, a czego brakuje |
| **Szansa** | Przycisk "Dodaj" większy i wyróżniony kolorem. Kontekst istniejących zadań widoczny przed dodawaniem — ekran główny służy jednocześnie jako przegląd i punkt startu do dodawania. |

### Faza 3 — Wypełnianie szczegółów (wizard)
| Element | Opis |
|---------|------|
| **Akcja** | Przechodzi przez pola krok po kroku: projekt (dropdown + "dodaj nowy projekt"), tytuł, opis (opcjonalny), kategoria (dropdown/autosuggest + "dodaj nową"), data (klawiatura numeryczna), powtarzalność. Na końcu "Zapisz" lub "Dodaj nowe zadanie". |
| **Myśl** | "Chcę to dokładnie opisać, ale bez przekopywania się przez ścianę formularza." |
| **Emocja** | Poczucie kontroli — jedno pole = jedna decyzja |
| **Szansa** | Wizard pattern: jedno pole na raz, wyraźne tytuły pól, "Dalej" przy obowiązkowych, "Dalej"/"Pomiń" przy opcjonalnych. "Save & New" do dodawania seriami. Rozważyć opcję "Widok rozszerzony" dla zaawansowanych użytkowników. |

### Faza 4 — Przegląd i zakończenie
| Element | Opis |
|---------|------|
| **Akcja** | Ustawia filtr dat na "następne 3 dni" → widok aktualizuje się in-place → przegląda plan weekendu |
| **Myśl** | "Czy mam wszystko zaplanowane na weekend?" |
| **Emocja** | Satysfakcja i spokój — wie co go czeka |
| **Szansa** | Filtrowanie na tej samej stronie bez przeładowania (in-place). W widoku filtrowanym zadania nadal posortowane po kategorii i priorytecie. |

---

## Journey Map — Anna (Nauczycielka, 58 lat)

**Status:** Do zrobienia

---

## Kluczowe decyzje projektowe (cross-persona)

1. **Brak logowania** — dane w localStorage, natychmiastowy dostęp
2. **Dwa sposoby nawigacji** — dropdown z listą alfabetyczną + wyszukiwarka z autosuggest
3. **Date picker z klawiaturą numeryczną** — autofocus DD→MM→RRRR, podgląd kalendarza, zapis po zmianie samego dnia
4. **Zielony przycisk zapisu** — konwencja koloru pozytywnego, stałe miejsce na dole ekranu
5. **Kolorowe nagłówki kategorii** — wizualne grupowanie zadań bez konieczności czytania
6. **Wizard pattern dla formularza** — jedno pole na raz, "Dalej"/"Pomiń", przyjazne dla początkujących i zaawansowanych
7. **"Save & New"** — przycisk do dodawania zadań seriami bez powrotu do ekranu głównego
8. **Filtrowanie in-place** — bez otwierania nowych okien, widok aktualizuje się na bieżąco
9. **Popup potwierdzający zapis** — feedback wizualny dla pewności użytkownika

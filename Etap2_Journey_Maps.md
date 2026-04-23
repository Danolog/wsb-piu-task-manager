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

**Scenariusz:** Poniedziałek, 7:45. Anna siedzi przy biurku w pokoju nauczycielskim przed pierwszą lekcją. Otwiera laptop, chce zobaczyć co ma dziś do zrobienia, oznaczyć to co już zrobiła w weekend (oddane kartkówki, zapłacony rachunek) i dopisać rzeczy, które pojawiły się w ciągu weekendu: rodzic napisał wiadomość z prośbą o konsultację, a sąsiadka przypomniała o płatności za kurs do środy.

### Faza 1 — Poranne otwarcie i orientacja
| Element | Opis |
|---------|------|
| **Akcja** | Włącza laptop → otwiera przeglądarkę → klika zakładkę z aplikacją (ma ją dodaną do pulpitu jako ikonę) → od razu widzi listę zadań |
| **Myśl** | „Co ja mam dziś do zrobienia? Tylko żeby nic mi nie uciekło." |
| **Emocja** | Lekka nerwowość (początek tygodnia), ale też potrzeba poczucia kontroli |
| **Szansa** | Brak logowania — natychmiastowy dostęp. Duży, widoczny nagłówek **„Dzisiaj"** nad listą. Dzisiejsze zadania domyślnie na górze, starsze/późniejsze poniżej. **Żadnego tutoriala ani modal-a na starcie** — Anna nie chce się uczyć aplikacji, chce jej używać. |

### Faza 2 — Przegląd dzisiejszych zadań
| Element | Opis |
|---------|------|
| **Akcja** | Skanuje wzrokiem listę dzisiejszych zadań: „Sprawdzian z 3B" (już oznaczone jako zrobione w piątek), „Dyżur w świetlicy 10:00", „Oddać kartkówki z 2A" |
| **Myśl** | „Sprawdzian gotowy, dobrze. Dyżur jest. Kartkówki — jeszcze nie oddałam? Aha, jeszcze nie zaznaczyłam." |
| **Emocja** | Ulga że nic nie zgubiła → lekki stres przy niezaznaczonym zadaniu („a jednak coś mi umyka") |
| **Szansa** | **Wizualnie bardzo wyraźne statusy**: niebieskie obramowanie + pusty checkbox dla „do zrobienia", zielony check + przekreślony tekst dla „zrobione". Zadania pogrupowane kolorowymi nagłówkami kategorii (np. „Szkoła" — niebieski, „Dom" — pomarańczowy). **Brak migających powiadomień, brak reklam, brak rozpraszaczy** — ekran ma jeden cel. |

### Faza 3 — Oznaczenie wykonanego zadania
| Element | Opis |
|---------|------|
| **Akcja** | Szuka checkboxa przy „Oddać kartkówki z 2A" → klika → widzi jak pojawia się zielony check, tekst się przekreśla, zadanie po chwili (0,5 s) przesuwa się na dół listy |
| **Myśl** | „Gdzie jest ten kwadracik? Aha, z boku obok nazwy. Kliknęłam — zmieniło się. Widzę że zrobione." |
| **Emocja** | Satysfakcja z małego zwycięstwa, pewność że kliknięcie zadziałało |
| **Szansa** | **Checkbox co najmniej 32×32 px**, umieszczony w stałym miejscu po lewej od tytułu — Anna nie musi go szukać na każdej karcie od nowa. **Natychmiastowy, jednoznaczny feedback wizualny** (kolor + przekreślenie + subtelna animacja checka). **Bez dialogu „Czy na pewno?"** — akcja jest odwracalna drugim kliknięciem, potwierdzenie byłoby zbędnym ciężarem poznawczym. |

### Faza 4 — Dodanie nowego zadania z weekendu
| Element | Opis |
|---------|------|
| **Akcja** | Klika duży przycisk **„+ Dodaj zadanie"** na górze listy → otwiera się prosty formularz → wpisuje „Odpowiedzieć rodzicowi ucznia z 3B" → wybiera datę „środa" z kalendarza → klika „Zapisz" |
| **Myśl** | „Gdzie dodam nowe? Aha, ten duży przycisk z plusem. Wpisuję tytuł. Data — którego jest środa? Wybieram z kalendarza, widzę miesiąc. Zapisz — zielony, duży, na dole. Klikam." |
| **Emocja** | Niepewność na wejściu („co mam tu wypełnić?") → rosnące poczucie kontroli z każdym polem → satysfakcja po kliknięciu zapisu |
| **Szansa** | **Jeden duży CTA „+ Dodaj zadanie"** z tekstem (nie sama ikona `+`) — Anna rozpoznaje po słowie, nie po symbolu. **Progressive disclosure:** formularz na wejściu pokazuje tylko **tytuł** i **datę**; priorytet, kategoria, opis są pod rozwijaną sekcją „Więcej opcji". **Etykiety nad polami** (nie placeholdery, które znikają po kliknięciu — to pułapka UX dla mniej technicznych userów). **Wymagane pola oznaczone gwiazdką + słowem „wymagane"**. **Walidacja po stronie UI z ludzkimi komunikatami** („Proszę wpisać nazwę zadania", nie „Field is required"). **Duży, zielony, statyczny przycisk „Zapisz"** zawsze w tym samym miejscu (dół formularza). |

### Faza 5 — Kontrolne sprawdzenie i wyjście
| Element | Opis |
|---------|------|
| **Akcja** | Patrzy na zaktualizowaną listę → widzi że nowe zadanie pojawiło się w sekcji „Środa" → zamyka kartę, idzie na lekcję |
| **Myśl** | „Jest. Dobrze. Wrócę wieczorem sprawdzić czy coś jeszcze sobie przypomnę." |
| **Emocja** | Spokój, poczucie pełnej kontroli, brak poczucia „a może coś zostało niezapisane" |
| **Szansa** | **Automatyczny zapis do localStorage** — Anna nie klika „Save file", nie widzi „niezapisane zmiany". Stan sam się utrwala. **Przy kolejnym otwarciu aplikacji — identyczny widok** (brak reset do „ekranu powitalnego"). **Brak wymuszonego logowania / rejestracji / konta** — wchodzi i od razu widzi swoje dane. |

---

## Kluczowe decyzje projektowe (cross-persona)

1. **Brak logowania** — dane w localStorage, natychmiastowy dostęp (wszyscy; krytyczne dla Kasi — szybkość, i dla Anny — brak bariery wejścia)
2. **Dwa sposoby nawigacji** — dropdown z listą alfabetyczną + wyszukiwarka z autosuggest (Kasia, Marek)
3. **Date picker z klawiaturą numeryczną** na mobile + klikalny kalendarz na desktop — autofocus DD→MM→RRRR, podgląd kalendarza, zapis po zmianie samego dnia (Kasia na telefonie, Anna na laptopie)
4. **Zielony przycisk zapisu** — konwencja koloru pozytywnego, stałe miejsce na dole ekranu / formularza (wszyscy; kluczowe dla Anny — przewidywalność)
5. **Kolorowe nagłówki kategorii** — wizualne grupowanie zadań bez konieczności czytania (Marek na kategoriach side-project/prywatne, Anna na Szkoła/Dom)
6. **Wizard pattern / progressive disclosure dla formularza** — na wejściu minimum wymaganych pól (tytuł + data), opcje zaawansowane (priorytet, kategoria, opis) pod rozwijaną sekcją „Więcej opcji". Jedno pole = jedna decyzja. Przyjazne zarówno dla Anny (nie przytłacza), jak i Marka (ma dostęp do wszystkich opcji gdy chce)
7. **„Save & New"** — przycisk do dodawania zadań seriami bez powrotu do ekranu głównego (Marek)
8. **Filtrowanie in-place** — bez otwierania nowych okien, widok aktualizuje się na bieżąco (Marek; pomaga też Annie utrzymać stabilny „punkt widokowy")
9. **Popup / toast potwierdzający zapis** — feedback wizualny dla pewności użytkownika (wszyscy; krytyczne dla Anny — redukcja niepewności „czy się zapisało")
10. **Duże elementy klikalne** — minimum **44×44 px** dla przycisków, **32×32 px** dla checkboxów, wyraźne odstępy między elementami listy (Anna; pomaga też Kasi na mobile przy palcu, nie myszce)
11. **Etykiety nad polami formularza, nie placeholdery** — placeholder znika przy kliknięciu i zapomina się co tam miało być wpisane. Etykieta stała jest czytelna zawsze (Anna; standard WCAG)
12. **Ludzkie komunikaty błędów walidacji** — „Proszę wpisać nazwę zadania", nie „Field required" ani „Invalid input" (Anna; korzystają też wszyscy, bo nikt nie lubi zagadek)
13. **Automatyczny zapis stanu po każdej akcji** — brak przycisku „Zapisz wszystko", brak pytań „czy na pewno zamknąć bez zapisania". localStorage aktualizuje się przy każdym reducer action (wszyscy; Anna nie musi rozumieć pojęcia „zapisywania plików")
14. **Brak modalnych potwierdzeń dla odwracalnych akcji** — toggle zrobione/niezrobione, zmiana priorytetu itp. idą bez pytania. Modal tylko dla akcji destrukcyjnych i nieodwracalnych (np. usunięcie zadania na zawsze) — tam jak najbardziej „Czy na pewno?" z alternatywą „Cofnij" przez 5 sekund w toast (Anna; standard nowoczesnego UX — „undo over confirm")
15. **Zero elementów rozpraszających na ekranie głównym** — brak reklam (oczywiste), brak powiadomień-onboarding, brak tooltipów wymuszających uwagę. Ekran główny ma jeden cel: pokazać listę i pozwolić działać (Anna; korzystają wszyscy — Kasi ogranicza decyzje między wykładami, Markowi zwiększa sygnał/szum)

---

## Wnioski dla następnych etapów

**Z Journey Map Anny wychodzą 3 decyzje, które będą najsilniej testowane na wireframes (Etap 2 wg briefu) i w prototypie Hi-Fi (Etap 3):**

1. **Layout ekranu głównego** musi działać przy zerowym „onboardingu" — czyli user widzi listę + przycisk „Dodaj" i od razu rozumie co jest co. Test: pokaż surfowemu testerowi wireframe na 3 sekundy, zapytaj „co to za aplikacja i co tu można zrobić". Jeśli nie trafia — upraszczamy.
2. **Formularz dodawania** musi mieć dwa tryby: szybki (tylko tytuł + data) i rozszerzony (wszystko). Wybór które pole jest „domyślnie widoczne" a które „zaawansowane" — decyzja designerska do rozpisania w Etapie 2.
3. **Rozróżnienie statusów** (zrobione vs. do zrobienia) ma być czytelne z odległości 1m (Anna przy biurku) i dla osób z deuteranopią / protanopią (ok. 8% mężczyzn). Czyli **nie polegamy wyłącznie na kolorze** — check + przekreślenie + ewentualnie subtelne przyciemnienie. Test: symulator Coblis / devtools Chrome → Rendering → Emulate vision deficiencies.

# Etap 1 — Analiza potrzeb użytkowników

## Problem projektowy

Istniejące narzędzia do zarządzania zadaniami są albo zbyt rozbudowane i skomplikowane (Jira, Trello, Asana), albo zbyt proste i chaotyczne (karteczki, notatki w telefonie). Użytkownicy potrzebują lekkiego, intuicyjnego narzędzia, które pozwala szybko dodawać i organizować zadania bez konieczności nauki skomplikowanego interfejsu — a jednocześnie oferuje kluczowe funkcje porządkujące, takie jak kategorie, priorytety i terminy.

---

## Persony użytkowników

### Persona 1 — Kasia (Studentka)

| Cecha | Opis |
|-------|------|
| **Imię i wiek** | Kasia, 22 lata |
| **Zawód** | Studentka informatyki |
| **Kontekst** | Pracuje nad kilkoma projektami zespołowymi jednocześnie, ma kolokwia i terminy zaliczeń. Korzysta głównie z telefonu między zajęciami. |
| **Cele** | Szybko dodać zadanie (w 3 sekundy), oznaczyć jako zrobione, nie zgubić terminów. |
| **Frustracje** | Próbowała karteczek (gubi je), notatek w telefonie (bałagan), Trello (za rozbudowane). Potrzebuje czegoś pomiędzy. |
| **Poziom techniczny** | Średni — smartphone + laptop, swobodnie korzysta z aplikacji. |
| **Kluczowa potrzeba** | Szybkość i mobilność. |

### Persona 2 — Marek (Pracownik biurowy z side-projectami)

| Cecha | Opis |
|-------|------|
| **Imię i wiek** | Marek, 28 lat |
| **Zawód** | Specjalista ds. marketingu |
| **Kontekst** | W pracy korzysta z firmowych narzędzi (Jira, Teams, Outlook) i radzi sobie dobrze, ale świadomie nie chce tam mieszać niczego prywatnego — ceni work-life balance i prywatność. Po godzinach prowadzi prywatny side-project (blog / mały sklep online / kurs). Nie jest to duży projekt, bo ma ograniczony czas, ale wymaga pilnowania terminów i prowadzenia zapisków. Do tego dochodzą zwykłe sprawy życiowe: rachunki, zakupy, wizyty. |
| **Cele** | Oddzielić życie prywatne i side-project od narzędzi firmowych. Mieć jedno miejsce na wszystko poza pracą. |
| **Frustracje** | Nie chce używać firmowych narzędzi do prywatnych spraw (prywatność, work-life balance). Notatki w telefonie nie mają kategorii ani priorytetów. |
| **Poziom techniczny** | Zaawansowany użytkownik, nie programista. |
| **Kluczowa potrzeba** | Kategorie (side-project / prywatne), priorytety, terminy. |

### Persona 3 — Anna (Osoba mniej techniczna)

| Cecha | Opis |
|-------|------|
| **Imię i wiek** | Anna, 58 lat |
| **Zawód** | Nauczycielka w liceum |
| **Kontekst** | Ma do ogarnięcia sprawdziany, wywiadówki, dyżury i domowe sprawy. Korzysta z komputera głównie w pracy (dziennik elektroniczny, poczta). |
| **Cele** | Mieć prostą listę z podziałem na „do zrobienia" i „zrobione". Nie zgubić ważnych terminów. |
| **Frustracje** | Próbowała aplikacji do zadań, ale były za bardzo „napakowane" — za dużo opcji, za małe przyciski, nie wiedziała gdzie kliknąć. |
| **Poziom techniczny** | Podstawowy — potrzebuje dużych, czytelnych przycisków i intuicyjnego interfejsu. |
| **Kluczowa potrzeba** | Prostota, czytelność, duże elementy klikalne. |

---

## Zakres funkcjonalny aplikacji

### Funkcje podstawowe (wymagane)

| Funkcja | Uzasadnienie personami |
|---------|----------------------|
| Dodawanie zadania | Wszyscy — podstawowa potrzeba |
| Edycja zadania | Wszyscy — korekta szczegółów |
| Usuwanie zadania | Wszyscy — porządkowanie listy |
| Oznaczanie jako wykonane | Wszyscy — śledzenie postępu |
| Lista zadań | Wszyscy — przegląd wszystkiego |

### Funkcje rozszerzone

| Funkcja | Uzasadnienie personami |
|---------|----------------------|
| Kategorie / tagi | Marek (prywatne vs side-project), Kasia (podział na przedmioty) |
| Priorytety | Marek (co pilne w projekcie), Kasia (kolokwium > zakupy) |
| Terminy wykonania | Wszyscy (deadliny, rachunki, sprawdziany) |
| Filtrowanie i sortowanie | Marek (pokaż tylko side-project), Anna (tylko dzisiejsze) |
| Wyszukiwarka | Marek (dużo zadań z różnych kontekstów) |
| Dark mode | Kasia (korzysta wieczorem), Marek (side-project po godzinach) |
| Walidacja formularzy | Anna (zapobieganie błędom, jasne komunikaty) |
| localStorage | Wszyscy (dane nie znikają po zamknięciu przeglądarki) |

---

## Zasady UI przyjęte w projekcie

1. **Prostota** — minimalna liczba kroków do wykonania akcji
2. **Intuicyjność** — elementy zachowują się zgodnie z oczekiwaniami (affordance)
3. **Spójność** — te same elementy wyglądają i działają tak samo w całej aplikacji
4. **Dostępność** — wystarczający kontrast, obsługa klawiaturą, min. 44x44px elementy klikalne

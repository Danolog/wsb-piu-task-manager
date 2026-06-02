# 0003. Stan widoku (filtry/sortowanie/wyszukiwarka) poza globalnym reducerem

- **Status:** Accepted
- **Data:** 2026-06-02
- **Autor:** Jack (frontend executor)

## Kontekst

Aplikacja trzyma jeden globalny `AppState` (zadania, kategorie, motyw) w `useReducer` + Context, persystowany do `localStorage` przy każdej zmianie (paczka P1). Lista zadań ma dodatkowo: wyszukiwarkę, filtr kategorii, filtr statusu i sortowanie. Pytanie: czy ten stan widoku należy do globalnego reducera (a więc do persystencji), czy jest stanem lokalnym strony.

Ograniczenia: stan widoku zmienia się często (debounce wyszukiwarki), jest efemeryczny i kontekstowy, a journey map Anny (decyzja 8 — „filtrowanie in-place") oraz Marka (Faza 4) wymagają płynnej zmiany widoku bez efektów ubocznych na danych.

## Rozważane opcje

### Opcja A — Filtry w globalnym reducerze (persystowane)

- **Za:** jedno źródło prawdy; filtry przeżywają reload.
- **Przeciw:** każda zmiana filtra = zapis do localStorage (zbędny I/O, ryzyko Quota); reducer puchnie o akcje niezwiązane z danymi; trudniej testować selekcję w izolacji; persystencja efemerycznego stanu UI to anty-pattern.

### Opcja B — Filtry jako lokalny stan strony + czysty selektor

- **Za:** zero zapisów do storage przy filtrowaniu; reducer pozostaje czysto domenowy; selektor `selectVisibleTasks(state, viewFilters)` jest czystą funkcją (testowalny unitowo bez Reacta); zgodne z „in-place" z journey map.
- **Przeciw:** filtry resetują się po reloadzie (akceptowalne — to świadomy wybór, nie strata danych).

## Decyzja

**Wybieramy opcję B.** Filtry/sortowanie/wyszukiwarka żyją w stanie lokalnym `TasksPage` (`useState`), nie w globalnym reducerze ani localStorage. Widoczny zbiór zadań wylicza czysta funkcja `selectVisibleTasks(state, viewFilters)` w `src/features/tasks/store.ts`.

Przeważyło: utrzymanie reducera czysto domenowym (proste testy, brak I/O przy każdym wciśnięciu klawisza w wyszukiwarce) oraz testowalność selektora jako czystej funkcji.

## Konsekwencje

### Pozytywne

- Reducer i persystencja dotyczą wyłącznie danych domenowych.
- `selectVisibleTasks` przetestowany jednostkowo niezależnie od UI (paczka P1).

### Negatywne / koszty

- Stan filtrów nie przeżywa odświeżenia strony (świadomie — nie są to dane użytkownika).

### Neutralne

- Gdyby w przyszłości zaszła potrzeba zapamiętania filtrów, naturalnym miejscem są parametry URL (query string), nie localStorage — bez ruszania reducera.

## Kiedy wrócić do tej decyzji

- Jeśli testy użyteczności pokażą, że użytkownicy oczekują zapamiętania filtrów między sesjami → przenieść do query string URL, nadal poza globalnym reducerem.

# 0001. Stack frontend: Vite + React 18 + TypeScript strict

- **Status:** Accepted
- **Data:** 2026-04-23
- **Autor:** Darek

## Kontekst

Brief prowadzącego dopuszcza „HTML, CSS, JavaScript oraz frameworki frontendowe, np. React lub Vue". README projektu od początku planuje React + Vite + TypeScript. Potrzebujemy zamknąć tę decyzję formalnie zanim zaczniemy Etap 5 (implementacja), bo wpływa ona na wszystko co po niej — tooling, testy, CI, deploy.

Ograniczenia:
- Projekt indywidualny (student, sem. 4) — stack musi być nauczalny, nie „magiczny"
- Cel edukacyjny: nauczyć się praktyk senior FE, nie tylko dowieźć apkę
- Brak backendu, dane w localStorage
- Termin semestralny (skończony zakres pracy)

## Rozważane opcje

### Opcja A — Vanilla JS + HTML + CSS

- **Za:** najbliżej fundamentów, zero zależności, minimalny bundle
- **Przeciw:** brak type-safety, ręczne zarządzanie DOM-em przy CRUD to boilerplate, nie-transferowalne na realną pracę w 2026 roku

### Opcja B — React 18 + Vite + TypeScript (strict)

- **Za:** standard branży, duży ekosystem, wiedza transferowalna do pracy, TypeScript wymusza myślenie o danych; Vite daje szybki HMR i zero konfiguracji; React 18 wspierany długoterminowo
- **Przeciw:** krzywa uczenia (ale to jest zaleta w tym projekcie); więcej tooling niż minimum potrzebuje

### Opcja C — Vue 3 + Vite + TypeScript

- **Za:** prostszy single-file-component niż React, dobra dokumentacja
- **Przeciw:** mniejszy ekosystem, mniejsza szansa wykorzystania w przyszłej pracy w Polsce/świecie (rynek zdominowany przez React)

### Opcja D — Next.js

- **Za:** produkcyjny setup out-of-the-box (SSR, routing)
- **Przeciw:** SSR/SSG nie potrzebujemy (localStorage only), over-engineered dla tego zakresu, odwracałby uwagę od rdzenia Reacta

## Decyzja

**Wybieramy Opcję B — Vite + React 18 + TypeScript w trybie `strict`.**

Uzasadnienie:
1. **Nauczalność:** React jest dziś defaultem FE — nauka przekłada się na 80%+ ofert pracy juniorskich
2. **TypeScript strict:** łapie klasy błędów których JS nie widzi; wymusza myślenie o modelu danych (discriminated unions, nullability)
3. **Vite:** zero konfiguracji Webpacka, instant HMR, mały bundle — nie odwracamy uwagi od kodu do narzędzi

## Konsekwencje

### Pozytywne

- Mamy fundament pod wszystkie kolejne decyzje (state management, forms, testy)
- Ekosystem bibliotek dostępny (react-hook-form, zod, date-fns, testing-library)
- Deploy na Vercel jest 1-click dla Vite (preview deploys per PR out-of-the-box)
- Wiedza transferowalna 1:1 na staże/junior roles

### Negatywne / koszty

- Setup tooling zajmie ~1–2h (ESLint, Prettier, Husky, Vitest, Playwright)
- TypeScript strict oznacza więcej „czerwonego" na początku — trzeba przywyknąć
- Bundle React + TS output >30kb gzipped vs vanilla który byłby <5kb (akceptowalne dla zakresu)

### Neutralne

- Gdy pracujemy z react-hook-form i zod, będziemy uczyć się schema-first design — wartościowy skill poza tym projektem

## Kiedy wrócić do tej decyzji

- Jeśli bundle size urósłby >300kb gzipped (mało prawdopodobne dla tego zakresu)
- Jeśli okaże się że projekt wymaga SSR (nie wymaga)
- Jeśli zespół powiększyłby się o osobę znającą wyłącznie Vue

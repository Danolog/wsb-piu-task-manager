# 0002. Podejście do stylowania: CSS Modules + CSS Variables vs Tailwind

- **Status:** Proposed
- **Data:** 2026-04-23
- **Autor:** Darek

## Kontekst

Musimy wybrać podejście do stylowania dla aplikacji Reactowej. Projekt będzie miał ~10–15 komponentów z wariantami, tryb ciemny (brief), responsywność mobile + desktop, oraz design system z tokenów (zdefiniowany w Figmie w Etapie 3).

Decyzja wpływa na:
- Doświadczenie pisania kodu (developer experience)
- Rozmiar bundle'a
- Łatwość utrzymania spójności z Figmą
- Krzywą uczenia
- Transferowalność na realne projekty

## Rozważane opcje

### Opcja A — CSS Modules + CSS Variables (custom properties)

```css
/* Button.module.css */
.button {
  padding: var(--space-2) var(--space-4);
  background: var(--color-primary-500);
  border-radius: var(--radius-md);
}
.button--secondary { background: var(--color-neutral-200); }
```

- **Za:**
  - Najbliżej „czystego" CSS — uczy fundamentów, które zostają na całe życie
  - CSS Variables są natywnie runtime-swapowalne → dark mode = jeden atrybut na `<html>`
  - Zero zależności runtime
  - Nauka wzorców BEM, specificity, kaskady (wiedza uniwersalna)
  - Łatwo zmapować 1:1 design tokens z Figmy
- **Przeciw:**
  - Wolniejszy flow pisania kodu niż Tailwind — skakanie między plikami .tsx i .module.css
  - Więcej boilerplate (import klasy + użycie)
  - Ryzyko braku spójności jeśli nie pilnujemy tokenów

### Opcja B — Tailwind CSS

```tsx
<button className="px-4 py-2 bg-primary-500 rounded-md hover:bg-primary-600 dark:bg-primary-700">
```

- **Za:**
  - Bardzo szybki dev flow — zero skakania między plikami
  - Wymusza używanie design tokens (konfiguracja → klasy)
  - Ogromny ekosystem (shadcn/ui, komponenty gotowe)
  - Dark mode wbudowany (`dark:` prefix)
  - Mały bundle (JIT, tylko użyte klasy)
- **Przeciw:**
  - „Magiczny" — ukrywa jak działa CSS pod spodem (anti-learning dla juniora)
  - Długie `className` (200+ znaków w komponencie) utrudniają czytanie
  - Mniej transferowalne — wiedza Tailwind ≠ wiedza CSS
  - Wymaga dodatkowego narzędzia (PostCSS config, przycięcie bundle'a)

### Opcja C — Styled Components / Emotion (CSS-in-JS)

- **Za:** kolokacja z komponentem, dynamiczne style na propsach
- **Przeciw:** runtime overhead, spadająca popularność (2024+ ekosystem odchodzi w stronę zero-runtime), mniej transferowalne, problem z SSR (nie dotyczy nas, ale anty-pattern)

### Opcja D — Vanilla Extract / Pigment CSS (zero-runtime CSS-in-TS)

- **Za:** typowane style, kolokacja, zero runtime
- **Przeciw:** niszowe, stroma krzywa uczenia, over-engineered dla tego zakresu

## Decyzja

**Do ustalenia z Darkiem.**

Rekomendacja analizującego (Claude): **Opcja A (CSS Modules + CSS Variables)**, bo:
1. Cel projektu to **nauka jak senior**, a nie „dowieźć szybko" — fundamenty CSS to większa inwestycja niż znajomość Tailwind
2. Dark mode z CSS Variables to pokazowa technika dla portfolio („jak działa w produkcji")
3. Brak dodatkowego narzędzia upraszcza setup i debugging
4. Skala projektu (~15 komponentów) nie wymusza prędkości którą daje Tailwind

**Alternatywnie uzasadniony wybór:** **Opcja B (Tailwind)**, jeśli priorytetem jest **szybkość dowozu i portfolio-ready look-and-feel** (Tailwind + shadcn/ui wygląda profesjonalnie out-of-the-box).

## Konsekwencje

_(wypełnić po decyzji)_

## Kiedy wrócić do tej decyzji

- Jeśli po 2 tygodniach pracy w Etap 5 czujemy, że styling jest bottleneckiem → rozważyć migrację
- Jeśli zespół by się powiększył o kogoś biegłego w jednej z opcji

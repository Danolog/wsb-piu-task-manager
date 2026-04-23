# PLAN projektu — Task Management App (WSB Merito, sem. 4)

> **Rola tego dokumentu:** roadmap „senior-grade" z naciskiem na **naukę**. Dla każdego etapu: czego się uczysz, co dostarczasz, jak to zrobić dobrze, jak poznasz że jest gotowe, oraz klasyczne pułapki.
>
> **Sposób korzystania:** czytaj etap po etapie, nie wszystko na raz. Zanim zaczniesz kolejny etap — przeczytaj **sekcję "START HERE"** na samym dole, ona zawsze mówi gdzie jesteś.

---

## 1. Stan obecny (snapshot na 2026-04-23)

| Element | Status | Uwagi |
|---|---|---|
| Brief prowadzącego (`Projetkowanie_projekt.pdf`) | ✅ przeczytany | 7 etapów, min. 3 userów w testach, PDF dokumentacja 2–4 strony |
| Etap 1 — Analiza UX (`Etap1_Analiza_UX.md`) | ✅ ukończony | 3 persony: Kasia, Marek, Anna |
| Etap 2 — Journey Maps (`Etap2_Journey_Maps.md`) | 🟡 w trakcie | Kasia ✅, Marek ✅, **Anna ❌ do zrobienia** |
| Low-Fi Wireframes + User Flow | ❌ nie zaczęte | W briefie to jest Etap 2; u nas dopiero Etap 4 wg README |
| Hi-Fi Prototype (Figma) | ❌ nie zaczęte | |
| Testy użyteczności (min. 3 os.) | ❌ nie zaczęte | **Brief mówi: testować prototyp, nie implementację** |
| Implementacja React | ❌ nie zaczęte | Stack planowany: React + Vite + TypeScript |
| Dokumentacja PDF 2–4 str | ❌ nie zaczęte | Wymóg oddania |
| Repo + workflow | ✅ skonfigurowane | `TEAM_SETUP.md` solidnie opisuje git flow |

### Co wymaga uwagi zanim ruszymy dalej

1. **Kolejność etapów w README ≠ brief.** README zaczyna od Journey Maps jako Etap 2, a brief prowadzącego — od Low-Fi Wireframes. Journey Maps to wartościowy dodatek UX, ale nie jest w briefie. **Sugestia:** traktować Journey Maps jako część „Etapu 1 rozszerzonego" i w numeracji oddania trzymać się briefu (bo tak będzie oceniane).
2. **Testy użyteczności w README są po implementacji.** W briefie są **po prototypie Hi-Fi i przed implementacją** — to ważne, bo testowanie na prototypie Figmy jest o dwa rzędy wielkości tańsze niż przerabianie działającego kodu React.
3. **Anna nie ma Journey Map.** Dokończyć przed wejściem w wireframes (jej potrzeba czytelności i dużych elementów jest decydująca dla designu).

---

## 2. Mapowanie: brief ↔ kryteria oceniania ↔ ten projekt

| Etap briefu | Nasz deliverable | % oceny | Gdzie to żyje |
|---|---|---|---|
| Etap 1. Analiza UX | `Etap1_Analiza_UX.md` + (bonus) Journey Maps | **10%** | repo/markdown |
| Etap 2. Low-Fi + User Flow | `Etap3_Wireframes.md` + obrazki + diagram flow | **10%** | repo + Figma (osobny plik) |
| Etap 3. Hi-Fi Prototype | Interaktywny prototyp w Figmie | **20%** | Figma (link w README) |
| Etap 4. Testy użyteczności | `Etap4_Usability_Tests.md` — scenariusz, nagrania/notatki, findings, poprawki | **10%** | repo |
| Etap 5. Implementacja frontend | Działająca aplikacja React + deploy | **30%** | `apps/web/` + Vercel/Netlify |
| Etap 6. Optymalizacja i testy końcowe | Lighthouse, a11y audit, cross-browser, QA checklist | (część 30% impl. + 20% prezentacji) | repo/reports |
| Etap 7. Prezentacja + dokumentacja | Slajdy + PDF 2–4 strony | **20%** | repo + oddanie |

**Kluczowe obserwacje do oceny:**
- Implementacja to **30%** — największa pojedyncza pozycja. Ale **prototyp Hi-Fi + prezentacja to razem 40%**. Nie można zaniedbać „nieprogramistycznej" części.
- „Uzasadnianie decyzji projektowych" jest w uwagach organizacyjnych briefu — to meta-kompetencja oceniana przekrojowo. **Każda ważniejsza decyzja w tym planie i w kodzie ma mieć jednolinijkowe „dlaczego" (ADR-style).**

---

## 3. Decyzje architektoniczne (do zamknięcia PRZED implementacją)

Senior developer podejmuje te decyzje świadomie na początku, nie „w trakcie". Poniżej sugestie + uzasadnienie. Zamknij je najpóźniej przed wejściem w Etap 3 (prototyp), bo wpływają na projekt wizualny.

### 3.1 Stack

| Warstwa | Rekomendacja | Dlaczego |
|---|---|---|
| Build tool | **Vite** | Szybki HMR, minimalna konfiguracja, standard 2024+ |
| Framework | **React 18** | W briefie wymieniony, największy ekosystem, transferowalne |
| Język | **TypeScript (strict mode)** | Łapie błędy przed runtime, samodokumentujący kod. **Włącz `"strict": true` od razu** |
| Styling | **CSS Modules + CSS Variables** *lub* **Tailwind CSS** | CSS Modules = czyste, bliskie „czystemu" CSS (nauka); Tailwind = szybszy rozwój. Jeśli celem jest nauka CSS → CSS Modules; jeśli celem jest dowieźć UI szybko → Tailwind. **Do ustalenia.** |
| State | **useState + useReducer + Context** (zero libek na start) | Dla apki tej skali Redux/Zustand to over-engineering. Nauka czystych hooków >> zależność na libkę |
| Routing | **React Router v6** (jeśli będą widoki Ustawienia / inne) lub **brak** (jeśli SPA single-view) | Decyzja po wireframes |
| Forms | **react-hook-form + zod** | Najlepsza para do walidacji. Uczy schematów i typowania danych |
| Storage | **localStorage** z warstwą abstrakcji (`storage.ts`) + schemat + wersjonowanie | Brief to wymaga, ale zrób to **dobrze**: schema + migracje = patternu który działa w prawdziwej pracy |
| Daty | **date-fns** (nie `moment` — deprecated; nie `dayjs` chyba że wymuszony bundle size) | Tree-shakable, typed |
| Ikony | **lucide-react** | Czyste SVG, spójny set, mały bundle |
| Testy | **Vitest + Testing Library + Playwright** | Pyramida: unit / component / e2e. Playwright dla e2e jest standardem 2025+ |
| Lint/format | **ESLint + Prettier + typescript-eslint** | Bez dyskusji w profesjonalnym kodzie |
| Pre-commit | **Husky + lint-staged** | Automatyzacja jakości — dyscyplina bez wysiłku |
| CI/CD | **GitHub Actions** (build + lint + test + preview deploy) | Pokazuje że umiesz CI — coś czego szkoła nie uczy |
| Deploy | **Vercel** (darmowy tier, integracja z GitHub, preview deploys per PR) | |

### 3.2 Model danych (draft — do uszczegółowienia na etapie wireframes)

```ts
type TaskId = string; // UUID v7

type Priority = 'low' | 'medium' | 'high' | 'urgent';
type Status = 'todo' | 'in_progress' | 'done';

interface Category {
  id: string;
  name: string;
  color: string; // semantyczny — motywuje kolorowe nagłówki z Etap 2
}

interface Task {
  id: TaskId;
  title: string;           // required, 1..120 znaków
  description?: string;    // opcjonalny, markdown lite
  status: Status;
  priority: Priority;
  dueDate?: string;        // ISO 8601
  categoryId?: Category['id'];
  createdAt: string;       // ISO 8601
  updatedAt: string;
  completedAt?: string;
}

interface AppState {
  schemaVersion: 1;        // WAŻNE — pozwala robić migracje
  tasks: Record<TaskId, Task>;
  categories: Record<string, Category>;
  ui: { theme: 'light' | 'dark' | 'system' };
}
```

**Dlaczego `Record<id, T>` a nie `T[]`?** O(1) lookup po id, łatwiejsze updaty, brak duplikatów. Selektor `Object.values()` zwraca listę kiedy potrzeba.

**Dlaczego `schemaVersion`?** Jeśli za 3 miesiące dodasz pole `subtasks`, użytkownicy ze starym stanem localStorage nie wywalą apki — migracja przekształci stare dane. To jest **produkcyjny** pattern.

### 3.3 Dostępność (a11y) — nie-negocjowalne minima

- Semantyczny HTML (`button` dla akcji, `a` dla nawigacji, nie `div onClick`)
- Focus visible (nie usuwaj `outline` bez zastąpienia czymś widocznym)
- Kontrast minimum **WCAG AA 4.5:1** dla tekstu (sprawdzisz w Figmie i w devtools)
- Wszystko klikalne minimum **44×44px** (brief Etap 1 to ma)
- Formularze: każde `<input>` ma `<label>`; błędy przez `aria-describedby`
- Klawiatura: Tab kolejnością wizualną, Enter zatwierdza, Esc zamyka modale
- Skip-link jeśli nawigacja jest duża

### 3.4 Responsywność — mobile-first

Kasia używa telefonu → zaczynamy od mobile. Breakpointy do ustalenia w Figmie, sugestia:
- `sm: 640px` (telefon landscape)
- `md: 768px` (tablet)
- `lg: 1024px` (laptop)

**Zasada:** piszemy style najpierw dla najmniejszego ekranu, `@media (min-width: ...)` dodaje rzeczy większym. Odwrotnie = ból.

---

## 4. Etap po etapie — z naciskiem na naukę

### 📘 ETAP 1 (bonus) — Dokończenie Journey Maps

**Cel edukacyjny:** nauczyć się, że journey map to narzędzie do znajdowania **możliwości** (Opportunities), nie do opisywania co user robi. Każda „Szansa" w mapie → konkretny feature lub decyzja UI.

**Do zrobienia:**
1. Napisać Journey Map dla Anny (nauczycielka, persona 3). Scenariusz sugerowany: *„Anna chce rano przejrzeć dzisiejsze zadania i oznaczyć sprawdzone. Używa laptopa w szkole."*
2. Zaktualizować sekcję „Kluczowe decyzje" o wnioski z Anny (prawdopodobnie: **większe elementy, wysokokontrastowy tryb, ograniczenie opcji widocznych na raz**).

**Definition of Done:** plik `Etap2_Journey_Maps.md` ma 3 pełne mapy + cross-persona opportunities.

**Pułapka:** pisanie journey map tak, że każda faza brzmi jak „user klika X, user klika Y". To nie to. Ważne są **Myśl / Emocja / Szansa** — one generują decyzje designerskie.

---

### 📘 ETAP 2 — Low-Fi Wireframes + User Flow (brief Etap 2 — **10% oceny**)

**Cel edukacyjny:** nauczyć się że wireframe to **struktura i hierarchia**, nie rysunek. Na tym etapie **nie ma kolorów, nie ma finalnej typografii, nie ma ikon**. Tylko szare bloki. Celowo — żeby myśleć o layoucie, nie o ładności.

**Wymagane widoki (z briefu):**
- Lista zadań (główny widok)
- Dodawanie zadania
- Edycja zadania
- Ustawienia

**Sugerowane dodatkowe widoki (z naszych persona i journey):**
- Ekran pusty (empty state) — pierwsze uruchomienie
- Widok filtrowanych zadań (Marek filtruje po kategorii)
- Modal usuwania (potwierdzenie destruktywnej akcji)

**Narzędzia:** Figma (darmowy tier wystarcza) **lub** Whimsical/Excalidraw. **Rekomendacja:** Figma, bo to będzie też narzędzie do Hi-Fi i oszczędzisz konwersję.

**Krok po kroku:**

1. **Content inventory.** Wypisz na kartce wszystkie informacje, które muszą być widoczne na każdym ekranie. Dopiero potem zaczynaj rysować.
   - *Nauka:* „content first, chrome second" — najpierw treść, potem obudowanie.

2. **Szkic ołówkiem/Excalidraw 3 warianty na ekran.** Szybko, brzydko, dużo. Przerób każdy wariant z myślą o jednej persona na raz (Kasia = mobile szybkość, Anna = desktop czytelność, Marek = kategorie/filtry).
   - *Nauka:* **„divergent before convergent"** — najpierw rozbieganie pomysłów, potem wybór.

3. **Wybierz najlepsze elementy z każdego** i zrób finalny wireframe w Figmie.

4. **User Flow diagram.** Dla 3 głównych ścieżek:
   - „Dodaj nowe zadanie" (happy path)
   - „Oznacz jako wykonane"
   - „Edytuj zadanie z priorytetem i kategorią"

   Użyj symboli: prostokąt = ekran, romb = decyzja, strzałka = akcja. Narzędzie: FigJam, Whimsical albo natywnie w Figmie.

**Definition of Done:**
- [ ] 6+ wireframes w Figmie (4 wymagane + empty state + filtrowanie)
- [ ] Plik `Etap3_Wireframes.md` w repo z:
  - Osadzonymi screenami (eksport PNG do `docs/wireframes/`)
  - Uzasadnieniem każdego layoutu linkujące do persony/journey
- [ ] User Flow diagram (eksport PNG + link do Figmy)
- [ ] Commit: `feat(etap2): dodaj low-fi wireframes i user flow`

**Pułapki:**
- Pisanie lorem ipsum w wireframes. **Używaj realistycznych tekstów** („Przygotuj sprawdzian z rachunku różniczkowego", nie „Lorem ipsum dolor"). Realizm tekstu zmienia projekt.
- Zbyt wczesne przejście do kolorów. Wireframe ma być **brzydki celowo**.
- Pominięcie edge-cases: pusty stan, long text, 500 zadań, offline.

---

### 📘 ETAP 3 — Hi-Fi Prototype w Figmie (brief Etap 3 — **20% oceny**)

**Cel edukacyjny:** nauczyć się **design systemu** — że spójny projekt wynika z powtarzalnych komponentów i tokenów, nie z indywidualnego rysowania każdego ekranu.

**Krok po kroku:**

1. **Design tokens FIRST.** Przed rysowaniem ekranów zdefiniuj w Figmie:
   - **Color palette:** primary (sugeruję niebieski/fioletowy — neutralny dla task apki), success (zielony dla „done"), warning (żółty dla dueDate zbliżającego się), danger (czerwony, oszczędnie), 5 odcieni szarości. **Każdy kolor ma test WCAG AA.**
   - **Typography scale:** 1 rodzina (sans-serif, np. Inter — darmowa), 5 rozmiarów (`xs 12, sm 14, base 16, lg 20, xl 24, 2xl 32`), 3 wagi (400, 500, 700).
   - **Spacing scale:** potęgi 2 lub 4-base (`4, 8, 12, 16, 24, 32, 48`). **Nigdy ad-hoc „17px bo tak fajnie wygląda".**
   - **Border radius:** `sm 4, md 8, lg 12`. **Max 3 wartości.** Nie mieszamy radiusów — to wizualny chaos.
   - **Shadows:** 3 poziomy (`sm, md, lg`) + kolor shadowa zawsze ten sam (czarny z alfą).

2. **Komponenty (Figma Variants):**
   - Button (variants: `primary | secondary | ghost | danger`, states: `default | hover | active | disabled`)
   - Input (states: `default | focus | error | disabled` + label + helper text + error text)
   - Task card (states: `todo | done`, variants z priorytetem, z kategorią, z dueDate)
   - Checkbox, Select/Dropdown, Modal, Toast, Empty state

3. **Ekrany z komponentów.** Buduj ekrany używając wyłącznie stworzonych komponentów — zauważysz, których Ci brakuje. To jest Design System w praktyce.

4. **Dark mode.** Brief to wymienia jako rozszerzenie. W Figmie robimy **drugi zestaw color tokens** i duplikat ekranów. Praktycznie — nie rysuj dark mode od zera, tylko swap kolorów.

5. **Interaktywność (prototype).**
   - Połącz przyciski Figma Prototype (zakładka Prototype)
   - Przejścia: `Smart Animate` dla modalnych, `Push` dla nawigacji
   - Cel: **3 klikalne przepływy** = te same co w User Flow

6. **Responsywne ekrany.** Zrób w Figmie **2 szerokości**: 375 (mobile), 1280 (desktop). **Nie** wszystkie breakpointy — to za dużo pracy bez proporcjonalnego zysku.

**Definition of Done:**
- [ ] Design system (colors, type, spacing) jako Figma Styles + Variables
- [ ] 8–12 kluczowych komponentów z wariantami i stanami
- [ ] Wszystkie ekrany z Etapu 2 w Hi-Fi (mobile + desktop)
- [ ] Dark mode dla kluczowych ekranów
- [ ] Klikalne prototypy dla 3 głównych flow
- [ ] Link do Figmy w README (tryb „view-only shareable link")
- [ ] WCAG contrast check dla wszystkich tekst/tło par

**Pułapki:**
- **Style z powietrza.** Każdy kolor, rozmiar, spacing musi być w systemie. Jak wrzucasz „jednorazowo" coś nowego — zatrzymaj się i zastanów czy to token, czy błąd.
- **Za dużo stanów.** Lepiej 5 dobrze dopieszczonych komponentów niż 20 byle jakich.
- **Ignorowanie empty states i error states.** Puste state po pierwszym uruchomieniu to pierwsze wrażenie apki. Traktuj to jak pełnoprawny ekran.

---

### 📘 ETAP 4 — Testy użyteczności (brief — **10% oceny**)

**Cel edukacyjny:** nauczyć się że **test z 3 użytkownikami znajduje 60–75% problemów użyteczności** (Nielsen, 1994). Nie potrzebujesz 20 osób — potrzebujesz 3 **różnych** i scenariusza.

**Rekrutacja:** 3 osoby reprezentujące persony:
- 1 student/ka w wieku ~20 (Kasia-like)
- 1 osoba pracująca w wieku ~25–35 (Marek-like)
- 1 osoba mniej techniczna, ~50+ (Anna-like) ← **najtrudniej, ale najważniejsze**

**Scenariusz testowy (think-aloud protocol):**

> „Jesteś nową użytkowniczką tej aplikacji do zadań. Proszę wykonaj po kolei:
> 1. Dodaj zadanie: »Zapłacić rachunek za prąd do piątku«, wysoki priorytet, kategoria Prywatne.
> 2. Oznacz pierwsze zadanie z listy jako wykonane.
> 3. Pokaż mi tylko zadania z kategorii Prywatne.
> 4. Edytuj dowolne zadanie i zmień jego termin.
> 5. Włącz tryb ciemny.
> Podczas klikania **mów głośno co myślisz** — co widzisz, czego szukasz, co Cię dziwi."

**Metryki do zbierania:**
- Task success rate (0/1 na zadanie)
- Time on task (stoper — orientacyjnie)
- Error count
- SUS (System Usability Scale — 10 pytań, 5-minutowy kwestionariusz, Google to)
- Cytaty jakościowe („Nie wiedziałem gdzie kliknąć" — złoto do dokumentacji)

**Deliverable — plik `Etap4_Usability_Tests.md`:**
1. Scenariusz (co testujemy i dlaczego)
2. Metodologia (moderowany think-aloud na prototypie Figma)
3. Profile uczestników (anonimowo: „P1 — studentka, 22 lata")
4. Findings — tabelka: `Severity (1–3) | Problem | Dotyczy persony | Proponowana poprawka`
5. Top 3 poprawki do wdrożenia przed implementacją
6. Przed/po — screeny z Figmy pokazujące zmiany

**Definition of Done:**
- [ ] 3 testy przeprowadzone
- [ ] Findings spisane, priorytetyzowane
- [ ] Top 3 poprawki wdrożone w Figmie (i udokumentowane w historii)
- [ ] Commit: `docs(etap4): dodaj raport z testów i poprawki prototypu`

**Pułapki:**
- **Pytania naprowadzające.** „Czy podoba Ci się ten przycisk?" — źle. „Co myślisz o tym ekranie?" — dobrze. Nie sugeruj odpowiedzi.
- **Testowanie z programistami/znajomymi z branży.** Oni rozumieją UI tak jak Ty. Potrzebujesz user reprezentujących persony.
- **Naprawianie wszystkiego.** Severity 1 (krytyczne) = wdrożyć. Severity 2 = wdrożyć jeśli tanie. Severity 3 (kosmetyka) = backlog.

---

### 📘 ETAP 5 — Implementacja React (brief — **30% oceny**)

**Cel edukacyjny:** to jest moment gdzie rozwijasz umiejętności senior-grade. Każdy podkrok to oddzielna lekcja. Nie chodzi o to żeby skończyć szybko — chodzi o to żeby **każda linia kodu była świadomą decyzją**.

#### 5.1 Setup projektu (nauka: tooling)

```bash
# W folderze repo
npm create vite@latest apps/web -- --template react-ts
cd apps/web
npm install
```

Następnie:
- Włącz TypeScript strict: `tsconfig.json` → `"strict": true`, `"noUncheckedIndexedAccess": true`
- ESLint + Prettier: `npm i -D eslint prettier eslint-config-prettier eslint-plugin-react-hooks`
- Husky + lint-staged:
  ```bash
  npm i -D husky lint-staged
  npx husky init
  echo "npx lint-staged" > .husky/pre-commit
  ```
- `package.json` lint-staged:
  ```json
  "lint-staged": { "*.{ts,tsx}": ["eslint --fix", "prettier --write"] }
  ```

**Nauka:** ta konfiguracja to **10 minut raz** a oszczędza **godziny na code review**. To jest dyscyplina która odróżnia senior od juniora.

#### 5.2 Struktura katalogów (nauka: feature-based organization)

```
apps/web/
  src/
    app/                    # root App, Providers, Routes
    features/
      tasks/
        components/
        hooks/
        model.ts            # types, schemas
        store.ts            # state management
        storage.ts          # localStorage abstraction
      categories/
      theme/
    shared/
      components/           # Button, Input, Modal — design system
      hooks/
      utils/
    styles/                 # design tokens, globals
    test/                   # test utilities, fixtures
  public/
  index.html
```

**Dlaczego feature-based a nie `components/ hooks/ utils/`?** Bo kod ma **kohezję po feature'ach, nie po typach**. Kiedy usuwasz feature „categories", usuwasz jeden folder, nie grzebiesz w 4 miejscach. To kluczowe pytanie architektoniczne — zapamiętaj.

#### 5.3 Design tokens w kodzie (nauka: most z Figmy do kodu)

`src/styles/tokens.css`:
```css
:root {
  --color-primary-500: #...;
  --color-success-500: #...;
  --space-1: 4px;
  --space-2: 8px;
  /* ... reszta z Figmy 1:1 */
  --radius-sm: 4px;
  --font-size-base: 16px;
  --font-size-lg: 20px;
}

[data-theme="dark"] {
  --color-primary-500: #...;
  /* dark mode swap */
}
```

**Nauka:** CSS Variables są **runtime-swapowalne** — dlatego dark mode to jeden atrybut na `<html>`, a nie 2 osobne bundle. To jest piękno CSS zmiennych.

#### 5.4 Komponenty design systemu (nauka: primitive-first)

Zbuduj **w tej kolejności**:
1. `Button` (variants + sizes + disabled + loading)
2. `Input` + `Textarea` + `Select` (z `forwardRef` bo react-hook-form tego potrzebuje)
3. `Checkbox`
4. `Modal` (z focus trap — biblioteka `focus-trap-react` lub własne)
5. `Toast` (dla feedbacku akcji)
6. `Card`

**Nauka — compound components pattern:**
```tsx
<Modal>
  <Modal.Header>Dodaj zadanie</Modal.Header>
  <Modal.Body>...</Modal.Body>
  <Modal.Footer>...</Modal.Footer>
</Modal>
```
...jest bardziej elastyczny niż `<Modal title="..." footer={...} />`. To zaawansowany pattern Reacta.

#### 5.5 State management (nauka: kiedy co)

**Decision tree:**
- Jeden komponent używa → `useState`
- Kilka komponentów w jednym drzewie → lift state up + props
- Globalny stan aplikacji (tasks, theme) → **`useReducer` + `Context`**
- Mega-globalny wspólny stan w wielu miejscach → Zustand/Redux (tu NIE potrzebujemy)

Implementacja tasks store:
```ts
// features/tasks/store.ts
type Action =
  | { type: 'add'; payload: NewTask }
  | { type: 'update'; payload: Partial<Task> & { id: TaskId } }
  | { type: 'delete'; payload: { id: TaskId } }
  | { type: 'toggle'; payload: { id: TaskId } };

function tasksReducer(state: TasksState, action: Action): TasksState {
  // exhaustive switch — TypeScript wymusi obsługę każdego typu
}
```

**Nauka — discriminated unions:** `Action` jako union z dyskryminatorem `type` daje Ci type-safety w reducerze. Jeśli dodasz nowy `type` a nie obsłużysz go w switchu — TypeScript krzyknie. To jest **niemożliwe do osiągnięcia bez TS**.

#### 5.6 localStorage z migracjami (nauka: forward-compatibility)

```ts
// features/tasks/storage.ts
const STORAGE_KEY = 'wsb-task-manager';
const CURRENT_SCHEMA = 1;

function load(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialState;
  try {
    const parsed = JSON.parse(raw);
    return migrate(parsed); // obsługa starszych schematów
  } catch {
    console.warn('Corrupted storage, resetting');
    return initialState;
  }
}

function migrate(data: unknown): AppState {
  // wersja 1 → 2 → 3 — każda migracja to osobna funkcja
  // walidacja przez zod.parse() na końcu
}
```

**Nauka:** kod produkcyjny **zawsze** zakłada że localStorage może być zmanipulowany przez usera w devtools. Paruj + waliduj + migruj + fallback.

#### 5.7 Formularze z walidacją (nauka: schema-first)

```ts
// features/tasks/model.ts
import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany').max(120),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().datetime().optional(),
  categoryId: z.string().uuid().optional(),
});

export type TaskInput = z.infer<typeof taskSchema>;
```

Jeden schemat → walidacja w formularzu → walidacja przy odczycie ze storage → typy TS generowane. **DRY w najczystszej formie.**

#### 5.8 Routing (jeśli wiele widoków)

```tsx
<Routes>
  <Route path="/" element={<TasksPage />} />
  <Route path="/settings" element={<SettingsPage />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

**Nauka:** `path="*"` to must-have. Aplikacja bez 404 to aplikacja z ukrytymi bugami.

#### 5.9 Testy (nauka: pyramida testowa)

- **Unit (Vitest):** reducer, storage migrations, utils, zod schemas
- **Component (Testing Library):** Button, Input, TaskCard — renderowanie, interakcja, stany
- **E2E (Playwright):** 1 happy-path scenariusz „user dodaje zadanie, oznacza wykonane, usuwa"

**Reguła:** nie testuj implementacji, testuj zachowanie. `getByRole('button', { name: /dodaj/i })` > `querySelector('.submit-btn')`.

**Minimum dla oceny:** 5–10 unit testów + 1 e2e. Nie chodzi o pokrycie 100%, chodzi o pokazanie że **umiesz**.

#### 5.10 Performance & a11y audit (przed końcowym commitem)

- Lighthouse: target **90+ w każdej kategorii**
- axe DevTools: 0 violations poziomu „serious/critical"
- Bundle size: uruchom `npm run build`, sprawdź `dist/` — powinno być <200kb gzipped dla apki tej skali
- Keyboard nav: przejdź całą apkę bez myszki — wszystko musi działać

**Definition of Done Etapu 5:**
- [ ] Aplikacja spełnia min. zakres + 4–5 rozszerzonych funkcji
- [ ] TypeScript strict, 0 any
- [ ] ESLint clean
- [ ] Husky blokuje złe commity
- [ ] CI w GitHub Actions zielony
- [ ] Lighthouse 90+
- [ ] Deploy na Vercel/Netlify, link w README
- [ ] 5+ unit testów + 1 e2e

**Pułapki:**
- **useEffect-driven development.** Każdy useEffect który synchronizuje state ze storage to code smell — zrób to w reducerze bezpośrednio.
- **Prop drilling zamiast Context.** Jak przekazujesz prop przez 3+ poziomy — czas na Context.
- **Over-memoization.** `useMemo`/`useCallback` kosztują. Używaj tylko gdy **profiler pokaże problem**, nie prewencyjnie.
- **Zapomnienie o a11y.** Najczęstszy grzech: `<div onClick>` zamiast `<button>`. Niedostępne dla klawiatury i screen readerów.

---

### 📘 ETAP 6 — Optymalizacja i testy końcowe

**Cel edukacyjny:** nauczyć się systematycznego QA. Profesjonalista nie mówi „działa u mnie" — ma **checklist**.

**QA Checklist (plik `Etap6_QA.md`):**

**Funkcjonalne:**
- [ ] Wszystkie CRUD na zadaniach
- [ ] Toggle status, filtrowanie, sortowanie, wyszukiwarka
- [ ] Dark/light mode + preference zapisywana
- [ ] localStorage działa po reloadzie, po zamknięciu karty, po restarcie przeglądarki
- [ ] Walidacja formularzy: puste, za długie, złe formaty
- [ ] Empty states: brak zadań, brak wyników wyszukiwania

**Cross-browser:**
- [ ] Chrome (desktop + mobile)
- [ ] Firefox
- [ ] Safari (jeśli masz Maca — inaczej WebKit test w Playwright)

**Responsywność:**
- [ ] 375px (iPhone)
- [ ] 768px (iPad)
- [ ] 1024px (laptop)
- [ ] 1920px (desktop)

**Accessibility:**
- [ ] axe DevTools zero violations
- [ ] Screen reader walk-through (NVDA/VoiceOver) — kluczowe flow
- [ ] Wszystko klawiaturą
- [ ] Kontrasty WCAG AA

**Performance:**
- [ ] Lighthouse 90+
- [ ] Bundle <200kb gzipped
- [ ] Brak layout shift (CLS < 0.1)

**Edge cases:**
- [ ] localStorage pełny (spróbuj zasymulować)
- [ ] Bardzo długie tytuły
- [ ] 500 zadań (perf)
- [ ] 0 zadań (empty state)
- [ ] Corrupted storage (ręcznie zepsuj JSON w devtools)

---

### 📘 ETAP 7 — Prezentacja i dokumentacja (brief — **20% oceny**)

**Cel edukacyjny:** umiejętność **opowiadania o swojej pracy** — to jest umiejętność interview-ready która zostaje na całe życie.

**Dokumentacja PDF (2–4 strony, wymóg briefu):**

Struktura rekomendowana:
1. **Strona 1 — Problem i persony.** Opis problemu w 2 zdaniach. Persony w formie ikonek/bloków (nie całych tabelek).
2. **Strona 2 — Główny user flow + kluczowe decyzje projektowe.** Diagram flow + 4–5 kluczowych decyzji z uzasadnieniem.
3. **Strona 3 — Testy użyteczności: findings + zmiany.** Top 3 problemy + przed/po screeny.
4. **Strona 4 — Implementacja i retrospektywa.** Screenshoty apki, stack, link do deployu + repo + Figma. Czego się nauczyłeś (nie bój się to napisać — to ceniony kawałek).

**Skąd format PDF:** Użyjemy do tego `docx` lub `pdf` skilla w kolejnej sesji (już mamy gotowe tabelki i screeny). **Nie** używamy `pypdf`.

**Prezentacja (jeśli wymagana ustnie):**
- 5–10 slajdów
- Storyline: Problem → Persony → Proces → Produkt → Wnioski
- Demo live działającej apki (backup: nagranie screencast jakby internet padł)

**Definition of Done:**
- [ ] PDF 2–4 strony w repo (`docs/Documentation.pdf`)
- [ ] Slajdy w repo (`docs/Presentation.pptx`) — jeśli wymagane
- [ ] README zaktualizowane z wszystkimi linkami (Figma, deploy, dokumentacja)
- [ ] Tag `v1.0.0` na repo
- [ ] `CHANGELOG.md` — bo to jest kultura pracy senior

---

## 5. Konwencje kodu i gita (trzymaj się od dnia 1)

**Branching:** `main` = chronione; `feature/etapN-nazwa` dla pracy; PR + self-review przed merge.

**Commits (Conventional Commits):**
```
feat(tasks): dodaj filtrowanie po priorytecie
fix(storage): obsłuż corrupted JSON w localStorage
docs(etap5): zaktualizuj README o deployu
refactor(ui): wydziel Button do shared/components
test(reducer): pokrycie dla action 'toggle'
chore: bump dependencies
```

**Każdy PR ma:**
- Tytuł zgodny z Conventional Commits
- Opis: co, dlaczego, jak przetestowane, screen przed/po (dla UI changes)
- Link do zadania/etapu

---

## 6. Harmonogram sugerowany

Brief: **18 godzin laboratoryjnych.** Realnie (z pracą własną): 30–50h. Tygodniowo po 5–7h:

| Tydzień | Etap | Szacowany czas |
|---|---|---|
| W1 (bieżący) | Dokończ Etap 1 (Anna) + planowanie | 2h |
| W2 | Etap 2 — Wireframes + User Flow | 6h |
| W3 | Etap 3 (1/2) — Design tokens + komponenty w Figmie | 6h |
| W4 | Etap 3 (2/2) — ekrany Hi-Fi + prototyp interaktywny | 6h |
| W5 | Etap 4 — testy użyteczności + poprawki | 5h |
| W6 | Etap 5 (1/3) — setup + design system w kodzie | 6h |
| W7 | Etap 5 (2/3) — feature'y + storage + forms | 7h |
| W8 | Etap 5 (3/3) — testy + perf + a11y | 5h |
| W9 | Etap 6 — QA + poprawki | 4h |
| W10 | Etap 7 — dokumentacja + prezentacja | 5h |

---

## 7. Ryzyka i jak je mitygować

| Ryzyko | Prawdopodobieństwo | Impact | Mitygacja |
|---|---|---|---|
| Scope creep — dodawanie featurów niezaplanowanych | Wysokie | Średni | Trzymać się zakresu z Etapu 1. „Fajne pomysły" → `FUTURE.md` |
| Zabłądzenie w design systemie (perfekcjonizm) | Średnie | Wysoki | Time-box 6h na tokens+komponenty, dalej → ekrany |
| Problemy z rekrutacją użytkowników do testów | Średnie | Średni | Backup plan: nagrania + kwestionariusz zdalnie |
| Over-engineering state management | Niskie | Średni | Zasada: zero libek dopóki nie boli. useReducer+Context wystarczy |
| Figma crash/utrata pracy | Niskie | Wysoki | Figma ma history; dodatkowo export co tydzień do repo (`docs/figma-exports/`) |
| Zapomnienie o responsive i a11y do końca | Wysokie | Wysoki | **Checklist QA ma to być part of Definition of Done dla każdego componentu, nie na końcu** |
| Deadline semestralny | ? | Wysoki | **Do ustalenia — kiedy oddanie?** Jeśli <4 tygodnie → przytnij Etap 6 do minimum |

---

## 8. 🚀 START HERE — gdzie zaczniesz w następnej sesji

Stan na zakończenie sesji **2026-04-23**:
- Plan (ten plik) gotowy
- README do aktualizacji
- Pamięć zapisana

**Następny krok (priorytet 1):** **Dokończyć Journey Map dla Anny** w `Etap2_Journey_Maps.md`. To 1–2h pracy, odblokowuje myślenie o wireframes.

**Drugi krok (priorytet 2):** **Zamknąć decyzje architektoniczne z sekcji 3** — zwłaszcza:
- CSS Modules czy Tailwind? *(preferencja w sekcji 3.1; poprosić Darka o decyzję)*
- Czy dodajemy routing? *(decyzja po wireframes, ale warto mieć opinię)*
- Deadline oddania projektu? *(krytyczne dla harmonogramu)*

**Trzeci krok (priorytet 3):** Rozpocząć Etap 2 — wireframes. Pierwsze zadanie: założyć plik w Figmie + content inventory (sekcja 4, Etap 2, krok 1).

---

## 9. Dodatek — lektury / zasoby do nauki w trakcie

Każdy etap ma „bonus reading" — jeśli chcesz pogłębić:

**UX (Etapy 1–4):**
- *„Don't Make Me Think"* — Steve Krug (must-read, 200 stron, weekend)
- NN/g artykuły: https://www.nngroup.com/articles/ (szczególnie o usability testing i heurystykach)
- *„Laws of UX"* — Jon Yablonski (https://lawsofux.com — darmowe)

**React + TypeScript (Etap 5):**
- React docs (new): https://react.dev — najlepsza dokumentacja frameworka jaka istnieje
- Kent C. Dodds blog: https://kentcdodds.com (szczególnie o testowaniu i state)
- Matt Pocock TypeScript tips: https://www.totaltypescript.com (darmowy Beginners TS)

**Design systems (Etap 3 + 5):**
- Refactoring UI — Steve Schoger (książka, warta pieniędzy)
- Radix UI docs: https://www.radix-ui.com/primitives — wzorce dostępnych komponentów
- Material Design guidelines (do porównania podejść)

**A11y:**
- https://www.a11yproject.com — checklist
- WCAG Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/

---

*Koniec planu. Ten dokument jest żywy — aktualizuj go przy każdej większej decyzji. Commit message: `docs: update PLAN (sekcja X)`.*

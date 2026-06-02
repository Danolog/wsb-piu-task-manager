import { appStateSchema, SCHEMA_VERSION, type AppState } from './model';

export const STORAGE_KEY = 'wsb-piu-task-manager:state';

/**
 * Stan początkowy z seedowanymi kategoriami.
 * color = token semantyczny (klasa/zmienna), nie hex — pozwala na swap w dark mode.
 */
export function seedState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    tasks: {},
    categories: {
      'cat-studia': {
        id: 'cat-studia',
        name: 'Studia',
        color: 'category-green',
      },
      'cat-praca': { id: 'cat-praca', name: 'Praca', color: 'category-blue' },
      'cat-prywatne': {
        id: 'cat-prywatne',
        name: 'Prywatne',
        color: 'category-purple',
      },
      'cat-dom': { id: 'cat-dom', name: 'Dom', color: 'category-orange' },
      'cat-zdrowie': {
        id: 'cat-zdrowie',
        name: 'Zdrowie',
        color: 'category-red',
      },
    },
    ui: { theme: 'system' },
  };
}

/**
 * Migracja surowego obiektu z localStorage do bieżącej wersji schematu.
 * Switch po schemaVersion — każdy przyszły bump dokłada case bez psucia starych danych.
 */
export function migrate(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) {
    return raw;
  }
  const data = raw as { schemaVersion?: number };
  switch (data.schemaVersion) {
    case SCHEMA_VERSION:
      return data;
    // case 0: ... (przyszłe migracje)
    default:
      // Nieznana/brakująca wersja — zwracamy jak jest, walidacja zdecyduje o fallbacku.
      return data;
  }
}

/**
 * Odczyt stanu: parse JSON → migrate → walidacja zod → fallback seedState przy błędzie.
 * Każdy błąd (brak danych, uszkodzony JSON, niezgodny kształt) kończy się seedem,
 * więc aplikacja nigdy nie startuje na zepsutym stanie.
 */
export function load(): AppState {
  if (typeof localStorage === 'undefined') {
    return seedState();
  }
  try {
    const rawString = localStorage.getItem(STORAGE_KEY);
    if (!rawString) {
      return seedState();
    }
    const parsed: unknown = JSON.parse(rawString);
    const migrated = migrate(parsed);
    const result = appStateSchema.safeParse(migrated);
    if (!result.success) {
      return seedState();
    }
    // appStateSchema infer dodaje `| undefined` na polach opcjonalnych;
    // strukturalnie jest to AppState (exactOptionalPropertyTypes), rzutujemy bezpiecznie po walidacji.
    return result.data as AppState;
  } catch {
    return seedState();
  }
}

/**
 * Zapis stanu. Try/catch chroni przed QuotaExceededError (np. tryb prywatny).
 * Zwraca informację o powodzeniu, by warstwa UI mogła pokazać toast przy błędzie.
 */
export function save(state: AppState): { ok: boolean } {
  if (typeof localStorage === 'undefined') {
    return { ok: false };
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

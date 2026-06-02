import { describe, it, expect, beforeEach } from 'vitest';
import { load, save, migrate, seedState, STORAGE_KEY } from './storage';
import { SCHEMA_VERSION } from './model';

describe('storage — seedState', () => {
  it('zawiera 6 seedowanych kategorii, pustego usera i pustą listę zadań', () => {
    const seed = seedState();
    expect(Object.keys(seed.categories)).toHaveLength(6);
    expect(seed.categories['cat-studia']?.name).toBe('Studia');
    expect(seed.categories['cat-finanse']?.name).toBe('Finanse');
    expect(seed.categories['cat-finanse']?.color).toBe('category-teal');
    expect(Object.keys(seed.tasks)).toHaveLength(0);
    expect(seed.user.name).toBe('');
    expect(seed.ui.theme).toBe('system');
    expect(seed.schemaVersion).toBe(SCHEMA_VERSION);
    expect(SCHEMA_VERSION).toBe(2);
  });
});

describe('storage — migrate', () => {
  it('przepuszcza dane o bieżącej wersji bez zmian', () => {
    const seed = seedState();
    expect(migrate(seed)).toBe(seed);
  });

  it('nie wywraca się na danych niebędących obiektem', () => {
    expect(migrate(null)).toBeNull();
    expect(migrate('nonsens')).toBe('nonsens');
  });

  it('migruje v1 → v2 bezstratnie dla zadań i dokłada pustego usera', () => {
    const v1 = {
      schemaVersion: 1,
      tasks: {
        t1: {
          id: 't1',
          title: 'Zadanie z v1',
          status: 'todo',
          priority: 'medium',
          createdAt: '2026-06-01T10:00:00.000Z',
          updatedAt: '2026-06-01T10:00:00.000Z',
        },
      },
      categories: {
        'cat-studia': {
          id: 'cat-studia',
          name: 'Studia',
          color: 'category-green',
        },
      },
      ui: { theme: 'dark' },
    };
    const migrated = migrate(v1) as {
      schemaVersion: number;
      tasks: Record<string, { title: string }>;
      user: { name: string };
      ui: { theme: string };
    };
    expect(migrated.schemaVersion).toBe(2);
    // Zadanie zachowane 1:1 (bezstratność).
    expect(migrated.tasks['t1']?.title).toBe('Zadanie z v1');
    expect(migrated.ui.theme).toBe('dark');
    // Brakujący user → pusty.
    expect(migrated.user).toEqual({ name: '' });
  });

  it('po migracji v1 → v2 stan przechodzi walidację (load go przyjmuje)', () => {
    const v1 = {
      schemaVersion: 1,
      tasks: {},
      categories: {
        'cat-studia': {
          id: 'cat-studia',
          name: 'Studia',
          color: 'category-green',
        },
      },
      ui: { theme: 'light' },
    };
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v1));
    const state = load();
    // Nie fallback do seeda — to zmigrowane dane v1 (1 kategoria, nie 6).
    expect(state.schemaVersion).toBe(2);
    expect(state.user.name).toBe('');
    expect(Object.keys(state.categories)).toHaveLength(1);
  });
});

describe('storage — load (parse + walidacja + fallback)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('zwraca seed gdy localStorage pusty', () => {
    expect(Object.keys(load().categories)).toHaveLength(6);
  });

  it('zwraca seed (fallback) gdy JSON jest uszkodzony', () => {
    localStorage.setItem(STORAGE_KEY, '{to nie jest json');
    const state = load();
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(Object.keys(state.categories)).toHaveLength(6);
  });

  it('zwraca seed (fallback) gdy kształt nie przechodzi walidacji zod', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 2, tasks: 'zły-typ' }),
    );
    const state = load();
    expect(Object.keys(state.categories)).toHaveLength(6);
    expect(state.user.name).toBe('');
  });

  it('wczytuje poprawnie zapisany stan w obie strony (round-trip)', () => {
    const seed = seedState();
    save(seed);
    const loaded = load();
    expect(loaded).toEqual(seed);
  });
});

describe('storage — save', () => {
  beforeEach(() => localStorage.clear());

  it('zapisuje stan i zwraca ok', () => {
    const result = save(seedState());
    expect(result.ok).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
  });
});

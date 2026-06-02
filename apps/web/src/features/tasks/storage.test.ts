import { describe, it, expect, beforeEach } from 'vitest';
import { load, save, migrate, seedState, STORAGE_KEY } from './storage';
import { SCHEMA_VERSION } from './model';

describe('storage — seedState', () => {
  it('zawiera 5 seedowanych kategorii i pustą listę zadań', () => {
    const seed = seedState();
    expect(Object.keys(seed.categories)).toHaveLength(5);
    expect(seed.categories['cat-studia']?.name).toBe('Studia');
    expect(Object.keys(seed.tasks)).toHaveLength(0);
    expect(seed.ui.theme).toBe('system');
    expect(seed.schemaVersion).toBe(SCHEMA_VERSION);
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
});

describe('storage — load (parse + walidacja + fallback)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('zwraca seed gdy localStorage pusty', () => {
    expect(Object.keys(load().categories)).toHaveLength(5);
  });

  it('zwraca seed (fallback) gdy JSON jest uszkodzony', () => {
    localStorage.setItem(STORAGE_KEY, '{to nie jest json');
    const state = load();
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(Object.keys(state.categories)).toHaveLength(5);
  });

  it('zwraca seed (fallback) gdy kształt nie przechodzi walidacji zod', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, tasks: 'zły-typ' }),
    );
    expect(Object.keys(load().categories)).toHaveLength(5);
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

import { describe, it, expect } from 'vitest';
import { rootReducer, selectVisibleTasks, defaultViewFilters } from './store';
import { seedState } from './storage';
import type { AppState, TaskInput } from './model';

function makeInput(overrides: Partial<TaskInput> = {}): TaskInput {
  return {
    title: 'Oddać kartkówki z 2A',
    priority: 'medium',
    status: 'todo',
    ...overrides,
  };
}

function addTask(state: AppState, input: TaskInput): AppState {
  return rootReducer(state, { type: 'task/add', payload: input });
}

describe('rootReducer — task/add', () => {
  it('dodaje zadanie z wygenerowanym id i timestampami', () => {
    const next = addTask(seedState(), makeInput());
    const tasks = Object.values(next.tasks);
    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.title).toBe('Oddać kartkówki z 2A');
    expect(tasks[0]?.status).toBe('todo');
    expect(tasks[0]?.id).toBeTruthy();
    expect(tasks[0]?.createdAt).toBeTruthy();
    expect(tasks[0]?.completedAt).toBeUndefined();
  });

  it('nie dokłada pól opcjonalnych gdy są undefined', () => {
    const next = addTask(seedState(), makeInput());
    const task = Object.values(next.tasks)[0];
    expect(task && 'description' in task).toBe(false);
    expect(task && 'dueDate' in task).toBe(false);
  });
});

describe('rootReducer — task/toggle', () => {
  it('przełącza todo→done (ustawia completedAt) i done→todo (usuwa completedAt)', () => {
    const withTask = addTask(seedState(), makeInput());
    const id = Object.keys(withTask.tasks)[0]!;

    const done = rootReducer(withTask, {
      type: 'task/toggle',
      payload: { id },
    });
    expect(done.tasks[id]?.status).toBe('done');
    expect(done.tasks[id]?.completedAt).toBeTruthy();

    const back = rootReducer(done, { type: 'task/toggle', payload: { id } });
    expect(back.tasks[id]?.status).toBe('todo');
    expect(back.tasks[id] && 'completedAt' in back.tasks[id]!).toBe(false);
  });
});

describe('rootReducer — task/delete', () => {
  it('usuwa zadanie po id', () => {
    const withTask = addTask(seedState(), makeInput());
    const id = Object.keys(withTask.tasks)[0]!;
    const next = rootReducer(withTask, {
      type: 'task/delete',
      payload: { id },
    });
    expect(next.tasks[id]).toBeUndefined();
    expect(Object.keys(next.tasks)).toHaveLength(0);
  });

  it('jest no-op dla nieistniejącego id (zwraca ten sam stan)', () => {
    const state = seedState();
    const next = rootReducer(state, {
      type: 'task/delete',
      payload: { id: 'brak' },
    });
    expect(next).toBe(state);
  });
});

describe('rootReducer — category/delete', () => {
  it('odpina kategorię od zadań zamiast je kasować', () => {
    const withTask = addTask(
      seedState(),
      makeInput({ categoryId: 'cat-studia' }),
    );
    const id = Object.keys(withTask.tasks)[0]!;
    expect(withTask.tasks[id]?.categoryId).toBe('cat-studia');

    const next = rootReducer(withTask, {
      type: 'category/delete',
      payload: { id: 'cat-studia' },
    });
    expect(next.categories['cat-studia']).toBeUndefined();
    expect(next.tasks[id]).toBeDefined();
    expect(next.tasks[id] && 'categoryId' in next.tasks[id]!).toBe(false);
  });
});

describe('rootReducer — ui/setTheme', () => {
  it('zmienia motyw', () => {
    const next = rootReducer(seedState(), {
      type: 'ui/setTheme',
      payload: { theme: 'dark' },
    });
    expect(next.ui.theme).toBe('dark');
  });
});

describe('selectVisibleTasks', () => {
  function fixture(): AppState {
    let state = seedState();
    state = addTask(state, makeInput({ title: 'Alfa', priority: 'low' }));
    state = addTask(
      state,
      makeInput({ title: 'Beta', priority: 'urgent', categoryId: 'cat-praca' }),
    );
    state = addTask(state, makeInput({ title: 'Gamma', status: 'done' }));
    return state;
  }

  it('filtruje po wyszukiwarce (case-insensitive)', () => {
    const result = selectVisibleTasks(fixture(), {
      ...defaultViewFilters,
      search: 'bet',
    });
    expect(result.map((t) => t.title)).toEqual(['Beta']);
  });

  it('filtruje po statusie', () => {
    const result = selectVisibleTasks(fixture(), {
      ...defaultViewFilters,
      status: 'done',
    });
    expect(result.map((t) => t.title)).toEqual(['Gamma']);
  });

  it('filtruje po kategorii', () => {
    const result = selectVisibleTasks(fixture(), {
      ...defaultViewFilters,
      categoryId: 'cat-praca',
    });
    expect(result.map((t) => t.title)).toEqual(['Beta']);
  });

  it('sortuje po priorytecie malejąco', () => {
    const result = selectVisibleTasks(fixture(), {
      ...defaultViewFilters,
      sortBy: 'priority',
      sortDir: 'desc',
    });
    expect(result[0]?.title).toBe('Beta'); // urgent najwyżej
  });

  it('łączy filtry: status=todo + wyszukiwarka zawężają jednocześnie', () => {
    let state = seedState();
    state = addTask(
      state,
      makeInput({ title: 'Raport roczny', status: 'todo' }),
    );
    state = addTask(
      state,
      makeInput({ title: 'Raport miesięczny', status: 'done' }),
    );
    state = addTask(state, makeInput({ title: 'Spotkanie', status: 'todo' }));

    const result = selectVisibleTasks(state, {
      ...defaultViewFilters,
      status: 'todo',
      search: 'raport',
    });
    // tylko todo + zawierające „raport" → odpada done („Raport miesięczny") i „Spotkanie"
    expect(result.map((t) => t.title)).toEqual(['Raport roczny']);
  });

  it('zwraca pustą listę, gdy żadne zadanie nie pasuje (wariant „brak wyników")', () => {
    const result = selectVisibleTasks(fixture(), {
      ...defaultViewFilters,
      search: 'nieistniejące-zapytanie',
    });
    expect(result).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';
import {
  rootReducer,
  selectVisibleTasks,
  selectStreak,
  selectTodayProgress,
  defaultViewFilters,
} from './store';
import { seedState } from './storage';
import type { AppState, Task, TaskInput } from './model';

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

// Wstawia gotowe zadania do stanu z determinowanymi polami (omija now() reducera).
function withTasks(tasks: Task[]): AppState {
  const state = seedState();
  const map: Record<string, Task> = {};
  for (const task of tasks) map[task.id] = task;
  return { ...state, tasks: map };
}

function task(overrides: Partial<Task> & Pick<Task, 'id'>): Task {
  return {
    title: 'X',
    status: 'todo',
    priority: 'medium',
    createdAt: '2026-06-01T09:00:00.000Z',
    updatedAt: '2026-06-01T09:00:00.000Z',
    ...overrides,
  };
}

// Lokalny timestamp w południe danego dnia — bez „Z", więc bez przesunięcia strefowego dnia.
function completedOn(day: string): string {
  return `${day}T12:00:00`;
}

describe('rootReducer — user/setName', () => {
  it('ustawia imię usera', () => {
    const next = rootReducer(seedState(), {
      type: 'user/setName',
      payload: { name: 'Kasia' },
    });
    expect(next.user.name).toBe('Kasia');
  });

  it('nadpisuje istniejące imię', () => {
    let state = rootReducer(seedState(), {
      type: 'user/setName',
      payload: { name: 'Kasia' },
    });
    state = rootReducer(state, {
      type: 'user/setName',
      payload: { name: 'Marek' },
    });
    expect(state.user.name).toBe('Marek');
  });
});

describe('selectStreak', () => {
  const today = '2026-06-02';

  it('liczy serię kolejnych dni wstecz z ukończeniem', () => {
    const state = withTasks([
      task({
        id: 'a',
        status: 'done',
        completedAt: completedOn('2026-06-02'),
      }),
      task({
        id: 'b',
        status: 'done',
        completedAt: completedOn('2026-06-01'),
      }),
      task({
        id: 'c',
        status: 'done',
        completedAt: completedOn('2026-05-31'),
      }),
    ]);
    expect(selectStreak(state, today)).toBe(3);
  });

  it('przerywa serię na pierwszym dniu bez ukończenia (luka)', () => {
    const state = withTasks([
      task({
        id: 'a',
        status: 'done',
        completedAt: completedOn('2026-06-02'),
      }),
      // brak 2026-06-01 → seria = 1
      task({
        id: 'c',
        status: 'done',
        completedAt: completedOn('2026-05-31'),
      }),
    ]);
    expect(selectStreak(state, today)).toBe(1);
  });

  it('zwraca 0, gdy dziś nic nie ukończono (mimo wczorajszego)', () => {
    const state = withTasks([
      task({
        id: 'b',
        status: 'done',
        completedAt: completedOn('2026-06-01'),
      }),
    ]);
    expect(selectStreak(state, today)).toBe(0);
  });

  it('zwraca 0 dla pustego stanu i ignoruje zadania bez completedAt', () => {
    expect(selectStreak(seedState(), today)).toBe(0);
    const state = withTasks([task({ id: 'a', status: 'todo' })]);
    expect(selectStreak(state, today)).toBe(0);
  });

  it('liczy wiele ukończeń tego samego dnia jako jeden dzień serii', () => {
    const state = withTasks([
      task({
        id: 'a',
        status: 'done',
        completedAt: completedOn('2026-06-02'),
      }),
      task({
        id: 'b',
        status: 'done',
        completedAt: completedOn('2026-06-02'),
      }),
    ]);
    expect(selectStreak(state, today)).toBe(1);
  });
});

describe('selectTodayProgress', () => {
  const today = '2026-06-02';

  it('liczy ukończone vs wszystkie zadania z dueDate === dziś', () => {
    const state = withTasks([
      task({ id: 'a', dueDate: today, status: 'done' }),
      task({ id: 'b', dueDate: today, status: 'todo' }),
      task({ id: 'c', dueDate: today, status: 'todo' }),
      // inny dzień — nie liczy się
      task({ id: 'd', dueDate: '2026-06-03', status: 'done' }),
      // bez daty — nie liczy się
      task({ id: 'e', status: 'done' }),
    ]);
    expect(selectTodayProgress(state, today)).toEqual({
      done: 1,
      total: 3,
      pct: 33,
    });
  });

  it('zwraca zera, gdy brak zadań na dziś (bez dzielenia przez 0)', () => {
    const state = withTasks([
      task({ id: 'a', dueDate: '2026-06-05', status: 'todo' }),
    ]);
    expect(selectTodayProgress(state, today)).toEqual({
      done: 0,
      total: 0,
      pct: 0,
    });
  });

  it('100% gdy wszystkie dzisiejsze ukończone', () => {
    const state = withTasks([
      task({ id: 'a', dueDate: today, status: 'done' }),
      task({ id: 'b', dueDate: today, status: 'done' }),
    ]);
    expect(selectTodayProgress(state, today)).toEqual({
      done: 2,
      total: 2,
      pct: 100,
    });
  });
});

describe('selectVisibleTasks — datePreset', () => {
  // środa 2026-06-03; tydzień ISO pon–niedz = 2026-06-01 .. 2026-06-07
  const today = '2026-06-03';

  function fixture(): AppState {
    return withTasks([
      task({ id: 'today', title: 'Dziś', dueDate: '2026-06-03' }),
      task({ id: 'mon', title: 'Poniedziałek', dueDate: '2026-06-01' }),
      task({ id: 'sun', title: 'Niedziela', dueDate: '2026-06-07' }),
      task({
        id: 'nextweek',
        title: 'Przyszły tydzień',
        dueDate: '2026-06-08',
      }),
      task({ id: 'lastweek', title: 'Zeszły tydzień', dueDate: '2026-05-30' }),
      task({ id: 'nodate', title: 'Bez daty' }),
      task({ id: 'done', title: 'Zrobione', status: 'done' }),
    ]);
  }

  it('today: tylko zadania z dueDate === dziś', () => {
    const result = selectVisibleTasks(
      fixture(),
      { ...defaultViewFilters, datePreset: 'today' },
      today,
    );
    expect(result.map((t) => t.title)).toEqual(['Dziś']);
  });

  it('week: zadania z bieżącego tygodnia ISO (pon–niedz), łapie zaległe z tego tygodnia', () => {
    const result = selectVisibleTasks(
      fixture(),
      { ...defaultViewFilters, datePreset: 'week' },
      today,
    );
    const titles = result.map((t) => t.title).sort();
    expect(titles).toEqual(['Dziś', 'Niedziela', 'Poniedziałek']);
    // poza tygodniem / bez daty odpadają
    expect(titles).not.toContain('Przyszły tydzień');
    expect(titles).not.toContain('Zeszły tydzień');
    expect(titles).not.toContain('Bez daty');
  });

  it('done: tylko zadania o statusie done', () => {
    const result = selectVisibleTasks(
      fixture(),
      { ...defaultViewFilters, datePreset: 'done' },
      today,
    );
    expect(result.map((t) => t.title)).toEqual(['Zrobione']);
  });

  it('all / brak presetu: bez zawężania po dacie', () => {
    const all = selectVisibleTasks(
      fixture(),
      { ...defaultViewFilters, datePreset: 'all' },
      today,
    );
    const none = selectVisibleTasks(fixture(), defaultViewFilters, today);
    expect(all).toHaveLength(7);
    expect(none).toHaveLength(7);
  });
});

describe('rootReducer — task/saveEdit (P-F)', () => {
  it('zapisuje zmienione pola i zachowuje id/createdAt/status', () => {
    const withTask = addTask(seedState(), makeInput({ dueDate: '2026-06-10' }));
    const id = Object.keys(withTask.tasks)[0]!;
    const createdAt = withTask.tasks[id]!.createdAt;

    const edited = rootReducer(withTask, {
      type: 'task/saveEdit',
      payload: {
        id,
        input: {
          title: 'Nowy tytuł',
          priority: 'high',
          status: 'todo',
          dueDate: '2026-06-11',
          dueTime: '18:00',
        },
      },
    });
    expect(edited.tasks[id]!.title).toBe('Nowy tytuł');
    expect(edited.tasks[id]!.priority).toBe('high');
    expect(edited.tasks[id]!.dueTime).toBe('18:00');
    expect(edited.tasks[id]!.id).toBe(id);
    expect(edited.tasks[id]!.createdAt).toBe(createdAt);
  });

  it('czyszczenie Terminu/Godziny USUWA pola z zadania (dług Build 1)', () => {
    const withTask = addTask(
      seedState(),
      makeInput({
        dueDate: '2026-06-10',
        dueTime: '12:00',
        description: 'notatka',
        categoryId: 'cat-praca',
      }),
    );
    const id = Object.keys(withTask.tasks)[0]!;

    // Edycja bez dueDate/dueTime/description/categoryId = wyczyszczenie tych pól.
    const cleared = rootReducer(withTask, {
      type: 'task/saveEdit',
      payload: {
        id,
        input: { title: 'Bez terminu', priority: 'medium', status: 'todo' },
      },
    });
    const t = cleared.tasks[id]!;
    expect('dueDate' in t).toBe(false);
    expect('dueTime' in t).toBe(false);
    expect('description' in t).toBe(false);
    expect('categoryId' in t).toBe(false);
  });

  it('nieistniejące id → stan bez zmian', () => {
    const base = seedState();
    const next = rootReducer(base, {
      type: 'task/saveEdit',
      payload: {
        id: 'brak',
        input: { title: 'x', priority: 'low', status: 'todo' },
      },
    });
    expect(next).toBe(base);
  });
});

describe('rootReducer — ui/setNotification + state/reset (P-H)', () => {
  it('ui/setNotification ustawia przełącznik powiadomień', () => {
    const next = rootReducer(seedState(), {
      type: 'ui/setNotification',
      payload: { key: 'dailySummary', value: true },
    });
    expect(next.ui.notifications?.dailySummary).toBe(true);
  });

  it('state/reset podmienia stan na przekazany', () => {
    const withTask = addTask(seedState(), makeInput());
    const fresh = { ...seedState(), user: { name: 'Kasia' } };
    const next = rootReducer(withTask, {
      type: 'state/reset',
      payload: { state: fresh },
    });
    expect(Object.keys(next.tasks)).toHaveLength(0);
    expect(next.user.name).toBe('Kasia');
  });
});

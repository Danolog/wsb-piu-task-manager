import { v4 as uuidv4 } from 'uuid';
import {
  startOfWeek,
  endOfWeek,
  parseISO,
  isWithinInterval,
  subDays,
} from 'date-fns';
import type {
  AppState,
  Status,
  Task,
  TaskId,
  TaskInput,
  Category,
  Theme,
} from './model';

// ---------- Akcje (discriminated union) ----------

export type Action =
  | { type: 'task/add'; payload: TaskInput }
  | {
      type: 'task/update';
      payload: { id: TaskId; changes: Partial<TaskInput> };
    }
  | { type: 'task/delete'; payload: { id: TaskId } }
  | { type: 'task/restore'; payload: { task: Task } }
  | { type: 'task/toggle'; payload: { id: TaskId } }
  | { type: 'category/add'; payload: { name: string; color: string } }
  | {
      type: 'category/update';
      payload: { id: string; changes: Partial<Omit<Category, 'id'>> };
    }
  | { type: 'category/delete'; payload: { id: string } }
  | { type: 'ui/setTheme'; payload: { theme: Theme } }
  | { type: 'user/setName'; payload: { name: string } }
  | { type: 'state/hydrate'; payload: AppState };

function now(): string {
  return new Date().toISOString();
}

// ---------- Reducer ----------

export function rootReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'task/add': {
      const id = uuidv4();
      const timestamp = now();
      const input = action.payload;
      const task: Task = {
        id,
        title: input.title,
        status: input.status,
        priority: input.priority,
        createdAt: timestamp,
        updatedAt: timestamp,
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
        ...(input.dueTime !== undefined && { dueTime: input.dueTime }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.status === 'done' && { completedAt: timestamp }),
      };
      return { ...state, tasks: { ...state.tasks, [id]: task } };
    }

    case 'task/update': {
      const existing = state.tasks[action.payload.id];
      if (!existing) return state;
      const { changes } = action.payload;
      const updated: Task = {
        ...existing,
        ...stripUndefined(changes),
        updatedAt: now(),
      };
      return { ...state, tasks: { ...state.tasks, [existing.id]: updated } };
    }

    case 'task/delete': {
      if (!state.tasks[action.payload.id]) return state;
      const next = { ...state.tasks };
      delete next[action.payload.id];
      return { ...state, tasks: next };
    }

    case 'task/restore': {
      // Wstawia z powrotem usunięte zadanie z ORYGINALNYM id i polami (undo po task/delete).
      const { task } = action.payload;
      return { ...state, tasks: { ...state.tasks, [task.id]: task } };
    }

    case 'task/toggle': {
      const existing = state.tasks[action.payload.id];
      if (!existing) return state;
      const nextStatus: Status = existing.status === 'done' ? 'todo' : 'done';
      const timestamp = now();
      // exactOptionalPropertyTypes: completedAt dokładamy tylko gdy 'done',
      // przy powrocie do 'todo' destrukturyzujemy je z obiektu (klucz znika).
      const { completedAt: _wasCompleted, ...base } = existing;
      const toggled: Task =
        nextStatus === 'done'
          ? {
              ...base,
              status: nextStatus,
              updatedAt: timestamp,
              completedAt: timestamp,
            }
          : { ...base, status: nextStatus, updatedAt: timestamp };
      return { ...state, tasks: { ...state.tasks, [existing.id]: toggled } };
    }

    case 'category/add': {
      const id = `cat-${uuidv4()}`;
      const category: Category = {
        id,
        name: action.payload.name,
        color: action.payload.color,
      };
      return {
        ...state,
        categories: { ...state.categories, [id]: category },
      };
    }

    case 'category/update': {
      const existing = state.categories[action.payload.id];
      if (!existing) return state;
      const updated: Category = {
        ...existing,
        ...stripUndefined(action.payload.changes),
      };
      return {
        ...state,
        categories: { ...state.categories, [existing.id]: updated },
      };
    }

    case 'category/delete': {
      if (!state.categories[action.payload.id]) return state;
      const nextCategories = { ...state.categories };
      delete nextCategories[action.payload.id];
      // Odpinamy usuwaną kategorię od zadań (nie kasujemy zadań).
      const nextTasks: Record<TaskId, Task> = {};
      for (const task of Object.values(state.tasks)) {
        if (task.categoryId === action.payload.id) {
          const { categoryId: _removed, ...rest } = task;
          nextTasks[task.id] = rest;
        } else {
          nextTasks[task.id] = task;
        }
      }
      return { ...state, categories: nextCategories, tasks: nextTasks };
    }

    case 'ui/setTheme':
      return { ...state, ui: { ...state.ui, theme: action.payload.theme } };

    case 'user/setName':
      return { ...state, user: { ...state.user, name: action.payload.name } };

    case 'state/hydrate':
      return action.payload;

    default:
      return assertNever(action);
  }
}

// Usuwa klucze o wartości undefined. Typ wyniku gubi `undefined` z wartości,
// dzięki czemu spread jest zgodny z exactOptionalPropertyTypes.
type DefinedPartial<T> = { [K in keyof T]?: Exclude<T[K], undefined> };

function stripUndefined<T extends object>(obj: T): DefinedPartial<T> {
  const out: DefinedPartial<T> = {};
  for (const key of Object.keys(obj) as (keyof T)[]) {
    const value = obj[key];
    if (value !== undefined) {
      out[key] = value as Exclude<T[typeof key], undefined>;
    }
  }
  return out;
}

function assertNever(_action: never): never {
  throw new Error('Nieobsłużony typ akcji w rootReducer.');
}

// ---------- Selektor widoku (czysty, testowalny) ----------

/** Preset zakresu dat nad listą (mapuje trasy /dzis /tydzien /zrobione /wszystkie). */
export type DatePreset = 'today' | 'week' | 'done' | 'all';

export interface ViewFilters {
  search: string;
  categoryId: string | 'all';
  status: Status | 'all';
  /** Preset zakresu dat; gdy obecny, zawęża listę niezależnie od pozostałych filtrów. */
  datePreset?: DatePreset;
  sortBy: 'createdAt' | 'dueDate' | 'priority';
  sortDir: 'asc' | 'desc';
}

export const defaultViewFilters: ViewFilters = {
  search: '',
  categoryId: 'all',
  status: 'all',
  sortBy: 'createdAt',
  sortDir: 'desc',
};

const PRIORITY_RANK: Record<Task['priority'], number> = {
  low: 0,
  medium: 1,
  high: 2,
  urgent: 3,
};

/** Domyślne „dzisiaj" w formacie YYYY-MM-DD (czas lokalny) — fallback dla selektorów. */
function todayISODefault(): string {
  const now = new Date();
  const year = now.getFullYear().toString().padStart(4, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Sprawdza, czy zadanie pasuje do presetu zakresu dat.
 * - today: dueDate === dziś (decyzja 11.2)
 * - week: dueDate w bieżącym tygodniu ISO (pon–niedz), łapie też zaległe z tego tygodnia (11.3)
 * - done: status === 'done'
 * - all / brak: zawsze true
 */
function matchesDatePreset(
  task: Task,
  preset: DatePreset | undefined,
  todayISO: string,
): boolean {
  switch (preset) {
    case 'today':
      return task.dueDate === todayISO;
    case 'week': {
      if (!task.dueDate) return false;
      const today = parseISO(todayISO);
      const start = startOfWeek(today, { weekStartsOn: 1 });
      const end = endOfWeek(today, { weekStartsOn: 1 });
      return isWithinInterval(parseISO(task.dueDate), { start, end });
    }
    case 'done':
      return task.status === 'done';
    case 'all':
    case undefined:
      return true;
  }
}

/**
 * Zwraca zadania widoczne po zastosowaniu filtrów widoku (poza globalnym stanem).
 * Czysta funkcja — łatwa do testów jednostkowych.
 * `todayISO` (YYYY-MM-DD) wstrzykiwany dla presetów today/week — domyślnie bieżący dzień.
 */
export function selectVisibleTasks(
  state: AppState,
  filters: ViewFilters,
  todayISO: string = todayISODefault(),
): Task[] {
  const query = filters.search.trim().toLowerCase();

  let result = Object.values(state.tasks).filter((task) => {
    if (!matchesDatePreset(task, filters.datePreset, todayISO)) {
      return false;
    }
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }
    if (
      filters.categoryId !== 'all' &&
      task.categoryId !== filters.categoryId
    ) {
      return false;
    }
    if (query.length > 0) {
      const haystack = `${task.title} ${task.description ?? ''}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });

  result = result.sort((a, b) => {
    let cmp = 0;
    switch (filters.sortBy) {
      case 'priority':
        cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        break;
      case 'dueDate':
        cmp = (a.dueDate ?? '').localeCompare(b.dueDate ?? '');
        break;
      case 'createdAt':
        cmp = a.createdAt.localeCompare(b.createdAt);
        break;
    }
    return filters.sortDir === 'asc' ? cmp : -cmp;
  });

  return result;
}

// ---------- Selektory derived (czyste, bez nowych pól stanu) ----------

/** Lokalna data (YYYY-MM-DD) z timestampu ISO — dzień wg strefy przeglądarki. */
function localDayFromISO(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return toLocalISO(date);
}

function toLocalISO(date: Date): string {
  const year = date.getFullYear().toString().padStart(4, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Seria (streak): liczba kolejnych dni wstecz od dziś, w których ukończono
 * co najmniej 1 zadanie (po dacie `completedAt`). Pierwszy dzień bez ukończenia
 * przerywa serię. Zadanie bez `completedAt` nie liczy się. Decyzja 11.5.
 * Czysta funkcja — `todayISO` (YYYY-MM-DD) wstrzykiwany dla determinizmu.
 */
export function selectStreak(state: AppState, todayISO: string): number {
  // Zbiór dni (YYYY-MM-DD), w których cokolwiek ukończono.
  const completedDays = new Set<string>();
  for (const task of Object.values(state.tasks)) {
    if (task.completedAt) {
      const day = localDayFromISO(task.completedAt);
      if (day) completedDays.add(day);
    }
  }

  let streak = 0;
  let cursor = parseISO(todayISO);
  // Idziemy w tył dzień po dniu, dopóki dzień ma ukończenie.
  while (completedDays.has(toLocalISO(cursor))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export interface TodayProgress {
  done: number;
  total: number;
  /** Procent ukończenia 0–100 (zaokrąglony); 0 gdy brak zadań na dziś. */
  pct: number;
}

/**
 * Postęp dnia: zadania z `dueDate === dziś`, ile ukończonych vs wszystkich.
 * Decyzja 11.2 („Dziś" = dueDate === dzisiaj). Czysta funkcja.
 */
export function selectTodayProgress(
  state: AppState,
  todayISO: string,
): TodayProgress {
  const todays = Object.values(state.tasks).filter(
    (task) => task.dueDate === todayISO,
  );
  const total = todays.length;
  const done = todays.filter((task) => task.status === 'done').length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, pct };
}

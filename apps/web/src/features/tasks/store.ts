import { v4 as uuidv4 } from 'uuid';
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

export interface ViewFilters {
  search: string;
  categoryId: string | 'all';
  status: Status | 'all';
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

/**
 * Zwraca zadania widoczne po zastosowaniu filtrów widoku (poza globalnym stanem).
 * Czysta funkcja — łatwa do testów jednostkowych.
 */
export function selectVisibleTasks(
  state: AppState,
  filters: ViewFilters,
): Task[] {
  const query = filters.search.trim().toLowerCase();

  let result = Object.values(state.tasks).filter((task) => {
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

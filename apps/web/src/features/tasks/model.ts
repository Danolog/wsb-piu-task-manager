import { z } from 'zod';

// ---------- Typy domenowe ----------

export type TaskId = string; // UUID v4
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'todo' | 'in_progress' | 'done';
export type Theme = 'light' | 'dark' | 'system';

export interface Category {
  id: string;
  name: string;
  color: string; // token semantyczny (nie hex) — swap w dark mode
}

export interface Task {
  id: TaskId;
  title: string; // 1..120
  description?: string; // 0..1000
  status: Status;
  priority: Priority;
  dueDate?: string; // 'YYYY-MM-DD'
  categoryId?: Category['id'];
  createdAt: string; // ISO
  updatedAt: string; // ISO
  completedAt?: string; // ISO
}

export const SCHEMA_VERSION = 1 as const;

export interface AppState {
  schemaVersion: typeof SCHEMA_VERSION;
  tasks: Record<TaskId, Task>;
  categories: Record<string, Category>;
  ui: { theme: Theme };
}

// ---------- Stałe walidacji ----------

export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 1000;

export const PRIORITIES: readonly Priority[] = [
  'low',
  'medium',
  'high',
  'urgent',
];
export const STATUSES: readonly Status[] = ['todo', 'in_progress', 'done'];

// ---------- Schematy zod (komunikaty PO POLSKU) ----------

const prioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
const statusSchema = z.enum(['todo', 'in_progress', 'done']);
const themeSchema = z.enum(['light', 'dark', 'system']);

// Data dzienna w formacie YYYY-MM-DD; sprawdzamy też realność daty.
const dueDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data musi być w formacie RRRR-MM-DD.')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime()) && value === toISODate(date);
  }, 'To nie jest poprawna data w kalendarzu.');

function toISODate(date: Date): string {
  const year = date.getFullYear().toString().padStart(4, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Schemat danych wpisywanych przez użytkownika w formularzu zadania.
 * Spina się z react-hook-form przez @hookform/resolvers/zod.
 * Puste pola opcjonalne traktujemy jako "brak" (undefined), nie pusty string.
 */
export const taskInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Proszę wpisać nazwę zadania.')
    .max(TITLE_MAX, `Nazwa może mieć maksymalnie ${TITLE_MAX} znaków.`),
  description: z
    .string()
    .trim()
    .max(
      DESCRIPTION_MAX,
      `Opis może mieć maksymalnie ${DESCRIPTION_MAX} znaków.`,
    )
    .optional()
    .or(z.literal('').transform(() => undefined)),
  priority: prioritySchema,
  status: statusSchema.default('todo'),
  dueDate: dueDateSchema
    .optional()
    .or(z.literal('').transform(() => undefined)),
  categoryId: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type TaskInput = z.infer<typeof taskInputSchema>;

export const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Proszę podać nazwę kategorii.').max(40),
  color: z.string().min(1),
});

const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(TITLE_MAX),
  description: z.string().max(DESCRIPTION_MAX).optional(),
  status: statusSchema,
  priority: prioritySchema,
  dueDate: z.string().optional(),
  categoryId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
});

/** Schemat całego stanu w localStorage — walidacja po odczycie. */
export const appStateSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  tasks: z.record(z.string(), taskSchema),
  categories: z.record(z.string(), categorySchema),
  ui: z.object({ theme: themeSchema }),
});

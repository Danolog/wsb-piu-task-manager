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
  dueTime?: string; // 'HH:mm' (24h) — dozwolone tylko, gdy dueDate obecne
  categoryId?: Category['id'];
  createdAt: string; // ISO
  updatedAt: string; // ISO
  completedAt?: string; // ISO
}

export const SCHEMA_VERSION = 2 as const;

export interface User {
  name: string; // '' przed onboardingiem
}

export interface AppState {
  schemaVersion: typeof SCHEMA_VERSION;
  tasks: Record<TaskId, Task>;
  categories: Record<string, Category>;
  user: User;
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

// Godzina w formacie 24h HH:mm (00:00–23:59).
const dueTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Godzina musi być w formacie GG:MM.');

/**
 * Schemat danych wpisywanych przez użytkownika w formularzu zadania.
 * Spina się z react-hook-form przez @hookform/resolvers/zod.
 * Puste pola opcjonalne traktujemy jako "brak" (undefined), nie pusty string.
 */
export const taskInputSchema = z
  .object({
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
    dueTime: dueTimeSchema
      .optional()
      .or(z.literal('').transform(() => undefined)),
    categoryId: z
      .string()
      .optional()
      .or(z.literal('').transform(() => undefined)),
  })
  // Godzina ma sens tylko z datą — sama godzina bez terminu jest błędem.
  .refine(
    (data) => !(data.dueTime !== undefined && data.dueDate === undefined),
    {
      message: 'Godzinę można podać tylko razem z datą.',
      path: ['dueTime'],
    },
  );

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
  dueTime: z.string().optional(),
  categoryId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
});

const userSchema = z.object({ name: z.string() });

/** Schemat całego stanu w localStorage — walidacja po odczycie. */
export const appStateSchema = z.object({
  schemaVersion: z.literal(2),
  tasks: z.record(z.string(), taskSchema),
  categories: z.record(z.string(), categorySchema),
  user: userSchema,
  // Zod domyślnie pomija (strip) nieznane klucze, więc starszy stan z
  // `ui.notifications` (usunięta funkcja) zwaliduje się bez migracji — zbędne
  // pole jest po cichu odrzucane z wyniku.
  ui: z.object({
    theme: themeSchema,
  }),
});

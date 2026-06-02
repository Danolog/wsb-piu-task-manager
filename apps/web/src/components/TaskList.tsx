import { Fragment } from 'react';
import { CalendarDays, Inbox, SearchX } from 'lucide-react';
import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/lib/utils';
import type { Category, Task } from '@/features/tasks/model';
import { categoryDotClass, formatDueDate } from '@/features/tasks/presentation';

export interface TaskListProps {
  tasks: Task[];
  categories: Record<string, Category>;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  /** true → użytkownik filtruje/szuka, więc pusta lista to „brak wyników", nie „brak zadań". */
  filtered?: boolean;
  /** Akcja w pustym stanie (np. przycisk „Dodaj zadanie"). */
  emptyAction?: React.ReactNode;
}

const NO_CATEGORY_KEY = '__none__';

interface Group {
  key: string;
  label: string;
  color?: string | undefined;
  tasks: Task[];
}

/**
 * Grupuje zadania:
 *  - sekcja „Dzisiaj" na górze (zadania z terminem dziś, niezależnie od kategorii),
 *  - następnie grupy po kategorii (z nagłówkiem w kolorze kategorii),
 *  - na końcu „Bez kategorii".
 * Kolejność WEWNĄTRZ grup zachowuje wejściową (selektor już posortował).
 */
function buildGroups(
  tasks: Task[],
  categories: Record<string, Category>,
): Group[] {
  const today: Task[] = [];
  const byCategory = new Map<string, Task[]>();

  for (const task of tasks) {
    const due = formatDueDate(task.dueDate);
    if (due?.today && task.status !== 'done') {
      today.push(task);
      continue;
    }
    const key = task.categoryId ?? NO_CATEGORY_KEY;
    const bucket = byCategory.get(key);
    if (bucket) {
      bucket.push(task);
    } else {
      byCategory.set(key, [task]);
    }
  }

  const groups: Group[] = [];
  if (today.length > 0) {
    groups.push({ key: '__today__', label: 'Dzisiaj', tasks: today });
  }

  // Najpierw realne kategorie (w kolejności zdefiniowanej), potem „bez kategorii".
  for (const category of Object.values(categories)) {
    const bucket = byCategory.get(category.id);
    if (bucket && bucket.length > 0) {
      groups.push({
        key: category.id,
        label: category.name,
        color: category.color,
        tasks: bucket,
      });
    }
  }
  const noCategory = byCategory.get(NO_CATEGORY_KEY);
  if (noCategory && noCategory.length > 0) {
    groups.push({
      key: NO_CATEGORY_KEY,
      label: 'Bez kategorii',
      tasks: noCategory,
    });
  }

  return groups;
}

export function TaskList({
  tasks,
  categories,
  onToggle,
  onEdit,
  onDelete,
  filtered = false,
  emptyAction,
}: TaskListProps) {
  if (tasks.length === 0) {
    return filtered ? (
      <EmptyState
        icon={SearchX}
        title="Brak wyników"
        description="Żadne zadanie nie pasuje do filtrów lub wyszukiwania. Zmień kryteria, aby zobaczyć więcej."
      />
    ) : (
      <EmptyState
        icon={Inbox}
        title="Brak zadań"
        description="Nie masz jeszcze żadnych zadań. Dodaj pierwsze, aby zacząć planowanie."
        {...(emptyAction ? { action: emptyAction } : {})}
      />
    );
  }

  const groups = buildGroups(tasks, categories);

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const isToday = group.key === '__today__';
        return (
          <Fragment key={group.key}>
            <section aria-label={group.label}>
              <h2 className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-wide text-ink-soft uppercase">
                {isToday ? (
                  <CalendarDays
                    className="size-3.5 text-category-orange"
                    aria-hidden="true"
                  />
                ) : group.color ? (
                  <span
                    className={cn(
                      'size-2.5 rounded-full',
                      categoryDotClass(group.color),
                    )}
                    aria-hidden="true"
                  />
                ) : null}
                {group.label}
                <span className="text-ink-muted">({group.tasks.length})</span>
              </h2>
              <ul className="space-y-2">
                {group.tasks.map((task) => (
                  <li key={task.id}>
                    <TaskCard
                      task={task}
                      category={
                        task.categoryId
                          ? categories[task.categoryId]
                          : undefined
                      }
                      onToggle={onToggle}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </li>
                ))}
              </ul>
            </section>
          </Fragment>
        );
      })}
    </div>
  );
}

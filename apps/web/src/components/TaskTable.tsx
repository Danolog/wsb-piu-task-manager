import { Checkbox } from '@/components/ui/checkbox';
import { PriorityBadge } from '@/components/PriorityBadge';
import { cn } from '@/lib/utils';
import type { Category, Task } from '@/features/tasks/model';
import {
  categoryDotClass,
  formatDueShort,
} from '@/features/tasks/presentation';

export interface TaskTableProps {
  tasks: Task[];
  categories: Record<string, Category>;
  onToggle: (id: string) => void;
  /** Klik wiersza (poza checkboxem) → edycja zadania. */
  onOpen: (id: string) => void;
}

/**
 * Tabela zadań — widok „Wszystkie" na desktopie (D 20:110).
 * Semantyczny <table>: kolumny Zadanie / Termin / Priorytet / Kategoria,
 * checkbox po lewej, done = przekreślenie + przyciemnienie wiersza.
 * Renderowana tylko ≥ md (klasy widoczności po stronie wołającego: hidden md:block).
 */
export function TaskTable({
  tasks,
  categories,
  onToggle,
  onOpen,
}: TaskTableProps) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-field)] border border-line">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line bg-surface-alt/50">
            <th
              scope="col"
              className="w-10 py-2.5 pl-4"
              aria-label="Ukończone"
            />
            <th
              scope="col"
              className="py-2.5 pr-4 text-[11px] font-medium tracking-wide text-ink-muted uppercase"
            >
              Zadanie
            </th>
            <th
              scope="col"
              className="py-2.5 pr-4 text-[11px] font-medium tracking-wide text-ink-muted uppercase"
            >
              Termin
            </th>
            <th
              scope="col"
              className="py-2.5 pr-4 text-[11px] font-medium tracking-wide text-ink-muted uppercase"
            >
              Priorytet
            </th>
            <th
              scope="col"
              className="py-2.5 pr-4 text-[11px] font-medium tracking-wide text-ink-muted uppercase"
            >
              Kategoria
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const done = task.status === 'done';
            const due = formatDueShort(task.dueDate, task.dueTime);
            const category = task.categoryId
              ? categories[task.categoryId]
              : undefined;
            return (
              <tr
                key={task.id}
                className={cn(
                  'group cursor-pointer border-b border-line bg-surface transition-colors last:border-b-0 hover:bg-surface-alt/40',
                  done && 'opacity-60',
                )}
                onClick={() => onOpen(task.id)}
              >
                <td
                  className="py-3 pl-4 align-middle"
                  // Checkbox nie ma otwierać edycji wiersza.
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    checked={done}
                    onCheckedChange={() => onToggle(task.id)}
                    className="size-5"
                    aria-label={`${done ? 'Oznacz jako niewykonane' : 'Oznacz jako wykonane'}: ${task.title}`}
                  />
                </td>
                <td className="py-3 pr-4 align-middle">
                  <span
                    className={cn(
                      'text-[15px] text-ink',
                      done && 'text-ink-muted line-through',
                    )}
                  >
                    {task.title}
                  </span>
                </td>
                <td className="py-3 pr-4 align-middle">
                  {due ? (
                    <span
                      className={cn(
                        'font-mono text-[13px]',
                        due.overdue
                          ? 'font-medium text-danger'
                          : due.today
                            ? 'font-medium text-category-orange'
                            : 'text-ink-muted',
                      )}
                    >
                      {due.label}
                      {due.overdue ? (
                        <span className="sr-only"> (po terminie)</span>
                      ) : null}
                    </span>
                  ) : (
                    <span className="text-ink-muted" aria-hidden="true">
                      —
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4 align-middle">
                  {task.priority === 'low' ? (
                    <span className="text-ink-muted" aria-hidden="true">
                      —
                    </span>
                  ) : (
                    <PriorityBadge priority={task.priority} />
                  )}
                </td>
                <td className="py-3 pr-4 align-middle">
                  {category ? (
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft">
                      <span
                        className={cn(
                          'size-2 shrink-0 rounded-full',
                          categoryDotClass(category.color),
                        )}
                        aria-hidden="true"
                      />
                      {category.name}
                    </span>
                  ) : (
                    <span className="text-ink-muted" aria-hidden="true">
                      —
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

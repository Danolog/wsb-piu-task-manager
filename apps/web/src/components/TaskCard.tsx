import { CalendarClock, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Category, Task } from '@/features/tasks/model';
import {
  PRIORITY_LABEL,
  categoryDotClass,
  formatDueDate,
} from '@/features/tasks/presentation';

export interface TaskCardProps {
  task: Task;
  category?: Category | undefined;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Wariant Badge priorytetu (wysoki/pilny mocniej wyróżnione).
const PRIORITY_VARIANT: Record<
  Task['priority'],
  'secondary' | 'outline' | 'destructive'
> = {
  low: 'outline',
  medium: 'secondary',
  high: 'secondary',
  urgent: 'destructive',
};

/**
 * Karta pojedynczego zadania.
 * Stan „done" sygnalizowany dwoma kanałami (nie tylko kolorem — deuteranopia):
 * przekreślenie tytułu + przyciemnienie całej karty.
 */
export function TaskCard({
  task,
  category,
  onToggle,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const done = task.status === 'done';
  const due = formatDueDate(task.dueDate);
  const titleId = `task-title-${task.id}`;

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-[var(--radius-field)] border border-line bg-surface px-3 py-3 transition-colors',
        // Done = przekreślenie + wyciszony tytuł (niżej), bez opacity na całej karcie —
        // globalna przezroczystość zbijała kontrast tekstu poniżej WCAG AA.
        done && 'bg-surface-alt/30',
      )}
      data-status={task.status}
    >
      <Checkbox
        checked={done}
        onCheckedChange={() => onToggle(task.id)}
        // Min 32×32 px klikalnej powierzchni (checkbox + ::after w prymitywie powiększa hit-area).
        className="mt-0.5 size-5"
        aria-label={`${done ? 'Oznacz jako niewykonane' : 'Oznacz jako wykonane'}: ${task.title}`}
      />

      <button
        type="button"
        onClick={() => onEdit(task.id)}
        className="min-w-0 flex-1 cursor-pointer text-left focus-visible:outline-none"
      >
        {/* Akcesyjny opis akcji jako sr-only prefiks — nazwa przycisku liczona
            z treści widocznej (tytuł + odznaki), więc zawiera widoczny tekst
            (WCAG 2.5.3 label-in-name), a nie tylko aria-label z samym tytułem. */}
        <span className="sr-only">Edytuj zadanie: </span>
        <span
          id={titleId}
          className={cn(
            'block truncate text-[15px] font-medium text-ink group-focus-within:underline',
            done && 'text-ink-muted line-through',
          )}
        >
          {task.title}
        </span>

        {task.description ? (
          <span className="mt-0.5 block truncate text-[13px] text-ink-muted">
            {task.description}
          </span>
        ) : null}

        <span className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={PRIORITY_VARIANT[task.priority]}>
            {PRIORITY_LABEL[task.priority]}
          </Badge>

          {category ? (
            <Badge variant="outline" className="gap-1.5">
              <span
                className={cn(
                  'size-2 shrink-0 rounded-full',
                  categoryDotClass(category.color),
                )}
                aria-hidden="true"
              />
              {category.name}
            </Badge>
          ) : null}

          {due ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs',
                due.overdue && 'font-medium text-danger',
                due.today && 'font-medium text-category-orange',
                !due.overdue && !due.today && 'text-ink-muted',
              )}
            >
              <CalendarClock className="size-3.5" aria-hidden="true" />
              {due.label}
              {due.overdue ? (
                <span className="sr-only"> (po terminie)</span>
              ) : null}
              {due.today ? <span className="sr-only"> (dzisiaj)</span> : null}
            </span>
          ) : null}
        </span>
      </button>

      {/* Kosz jest rodzeństwem przycisku edycji (nie zagnieżdżony), więc klik
          kosza nie wyzwala onEdit — bez potrzeby stopPropagation. Hit-area ≥ 44×44
          (WCAG 2.5.5): ikona 32×32 + ::after rozszerza klikalny obszar do 44px. */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Usuń zadanie: ${task.title}`}
        onClick={() => onDelete(task.id)}
        className="relative shrink-0 text-ink-muted after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] hover:text-danger"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

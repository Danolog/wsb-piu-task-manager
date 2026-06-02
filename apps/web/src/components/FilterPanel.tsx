import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { categoryDotClass } from '@/features/tasks/presentation';
import {
  PRIORITIES,
  type Priority,
  type Category,
} from '@/features/tasks/model';
import type { ViewFilters } from '@/features/tasks/store';
import {
  emptyListFilters,
  hasActiveFilters,
  type ListFilterState,
} from '@/features/tasks/list-filters';

const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: 'pilne',
  high: 'wysoki',
  medium: 'średni',
  low: 'niski',
};

// Kolejność wyświetlania wg Figmy (D 26:2): pilne, wysoki, średni, niski.
const PRIORITY_ORDER: Priority[] = ['urgent', 'high', 'medium', 'low'];

const SORT_OPTIONS: Array<{ value: ViewFilters['sortBy']; label: string }> = [
  { value: 'dueDate', label: 'Termin' },
  { value: 'priority', label: 'Priorytet' },
  { value: 'title', label: 'Nazwa' },
];

const PRIORITY_ACTIVE: Record<Priority, string> = {
  urgent: 'border-danger bg-danger/10 text-danger',
  high: 'border-category-orange bg-category-orange/10 text-category-orange',
  medium: 'border-category-blue bg-category-blue/10 text-category-blue',
  low: 'border-ink bg-surface-alt text-ink',
};

export interface FilterPanelProps {
  categories: Category[];
  value: ListFilterState;
  onChange: (next: ListFilterState) => void;
  /** Liczba zadań po zastosowaniu filtrów (z selectVisibleTasks). */
  count: number;
  /** Zamknij panel po „Pokaż N". */
  onApply?: () => void;
}

function Chip({
  active,
  onClick,
  activeClass,
  children,
}: {
  active: boolean;
  onClick: () => void;
  activeClass?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1 text-[13px] transition-colors',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
        active
          ? (activeClass ?? 'border-ink bg-surface-alt font-medium text-ink')
          : 'border-line bg-surface text-ink-soft hover:bg-surface-alt',
      )}
    >
      {children}
    </button>
  );
}

/**
 * Treść panelu filtrów: chipy Priorytet (wielokrotny wybór), chipy Kategoria,
 * wybór sortowania, „Wyczyść" + „Pokaż N zadań". Wspólna dla desktopowego
 * Popovera i mobilnego Sheeta (warstwa prezentacyjna bez własnego stanu).
 */
export function FilterPanel({
  categories,
  value,
  onChange,
  count,
  onApply,
}: FilterPanelProps) {
  function togglePriority(p: Priority) {
    const next = value.priorities.includes(p)
      ? value.priorities.filter((x) => x !== p)
      : [...value.priorities, p];
    onChange({ ...value, priorities: next });
  }

  function toggleCategory(id: string) {
    const next = value.categoryIds.includes(id)
      ? value.categoryIds.filter((x) => x !== id)
      : [...value.categoryIds, id];
    onChange({ ...value, categoryIds: next });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-ink">Filtry</span>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-category-teal"
          onClick={() => onChange(emptyListFilters)}
          disabled={!hasActiveFilters(value) && value.sortBy === 'dueDate'}
        >
          Wyczyść
        </Button>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="pb-1.5 text-xs font-medium tracking-wide text-ink-muted uppercase">
          Priorytet
        </legend>
        <div
          className="flex flex-wrap gap-2"
          aria-label="Filtruj po priorytecie"
        >
          {PRIORITY_ORDER.filter((p) => PRIORITIES.includes(p)).map((p) => (
            <Chip
              key={p}
              active={value.priorities.includes(p)}
              onClick={() => togglePriority(p)}
              activeClass={`${PRIORITY_ACTIVE[p]} font-medium`}
            >
              <span
                className={cn(
                  'size-2 shrink-0 rounded-full',
                  p === 'urgent' && 'bg-danger',
                  p === 'high' && 'bg-category-orange',
                  p === 'medium' && 'bg-category-blue',
                  p === 'low' && 'bg-ink-muted',
                )}
                aria-hidden="true"
              />
              {PRIORITY_LABEL[p]}
            </Chip>
          ))}
        </div>
      </fieldset>

      {categories.length > 0 ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="pb-1.5 text-xs font-medium tracking-wide text-ink-muted uppercase">
            Kategoria
          </legend>
          <div
            className="flex flex-wrap gap-2"
            aria-label="Filtruj po kategorii"
          >
            {categories.map((c) => (
              <Chip
                key={c.id}
                active={value.categoryIds.includes(c.id)}
                onClick={() => toggleCategory(c.id)}
              >
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    categoryDotClass(c.color),
                  )}
                  aria-hidden="true"
                />
                {c.name}
              </Chip>
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset className="flex flex-col gap-2">
        <legend className="pb-1.5 text-xs font-medium tracking-wide text-ink-muted uppercase">
          Sortuj
        </legend>
        <div
          role="radiogroup"
          aria-label="Sortuj"
          className="flex flex-wrap gap-2"
        >
          {SORT_OPTIONS.map((opt) => {
            const active = value.sortBy === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ ...value, sortBy: opt.value })}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1 text-[13px] transition-colors',
                  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                  active
                    ? 'border-ink bg-surface-alt font-medium text-ink'
                    : 'border-line bg-surface text-ink-soft hover:bg-surface-alt',
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Button type="button" size="lg" className="w-full" onClick={onApply}>
        Pokaż {count} {pluralTasks(count)}
      </Button>
    </div>
  );
}

/** Polska odmiana „zadań/zadanie/zadania". */
function pluralTasks(n: number): string {
  if (n === 1) return 'zadanie';
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return 'zadania';
  return 'zadań';
}

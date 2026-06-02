import { cn } from '@/lib/utils';
import type { Category } from '@/features/tasks/model';
import { categoryDotClass } from '@/features/tasks/presentation';

export interface CategoryPillsProps {
  categories: Category[];
  /** 'all' = bez filtra kategorii. */
  value: string | 'all';
  onChange: (value: string | 'all') => void;
}

/**
 * Filtr listy po kategorii (in-place, nie zmienia globalnego stanu).
 * „Wszystkie" + pigułka na każdą kategorię. radiogroup → obsługa klawiaturą.
 */
export function CategoryPills({
  categories,
  value,
  onChange,
}: CategoryPillsProps) {
  const options: Array<{ id: string | 'all'; label: string; color?: string }> =
    [
      { id: 'all', label: 'Wszystkie' },
      ...categories.map((c) => ({ id: c.id, label: c.name, color: c.color })),
    ];

  return (
    <div
      role="radiogroup"
      aria-label="Filtruj po kategorii"
      className="flex flex-wrap gap-2"
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1 text-[13px] transition-colors',
              'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              active
                ? 'border-ink bg-surface-alt font-medium text-ink'
                : 'border-line bg-surface text-ink-soft hover:bg-surface-alt',
            )}
          >
            {opt.color ? (
              <span
                className={cn(
                  'size-2 shrink-0 rounded-full',
                  categoryDotClass(opt.color),
                )}
                aria-hidden="true"
              />
            ) : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

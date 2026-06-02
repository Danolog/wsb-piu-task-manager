import { cn } from '@/lib/utils';
import type { Category } from '@/features/tasks/model';
import { categoryDotClass } from '@/features/tasks/presentation';

export interface CategoryPickerProps {
  categories: Category[];
  /** Wybrana kategoria; undefined = żadna (dozwolone — kategoria jest opcjonalna). */
  value?: string | undefined;
  onChange: (id: string | undefined) => void;
  'aria-labelledby'?: string;
}

/**
 * Wybór kategorii jako „pigułki" z kolorową kropką.
 * Pojedynczy wybór, ponowne kliknięcie aktywnej pigułki = odznaczenie (kategoria opcjonalna).
 * radiogroup/radio — obsługa klawiaturą gratis z semantyki ARIA + tabIndex.
 */
export function CategoryPicker({
  categories,
  value,
  onChange,
  'aria-labelledby': labelledBy,
}: CategoryPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="flex flex-wrap gap-2"
    >
      {categories.map((category) => {
        const active = category.id === value;
        return (
          <button
            key={category.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? undefined : category.id)}
            className={cn(
              // Wymiary chipa wg Figmy D 133-2 (chip): px-12 py-7, gap-6, dot 8px, text 13px, radius pill.
              'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-[7px] text-[13px] transition-colors',
              'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              active
                ? 'border-ink bg-surface-alt font-medium text-ink'
                : 'border-line bg-surface text-ink-soft hover:bg-surface-alt',
            )}
          >
            <span
              className={cn(
                'size-2 shrink-0 rounded-full',
                categoryDotClass(category.color),
              )}
              aria-hidden="true"
            />
            {category.name}
          </button>
        );
      })}
    </div>
  );
}

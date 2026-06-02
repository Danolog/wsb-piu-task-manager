import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/features/tasks/model';
import { categoryTextClass } from '@/features/tasks/presentation';

export interface OnboardingCategoryTilesProps {
  categories: Category[];
  /** Zbiór id zaznaczonych kategorii. */
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
  'aria-labelledby'?: string;
}

/** Pierwsza litera nazwy kategorii jako odręczny inicjał kafla (Caveat). */
function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '·';
}

/**
 * Kafle wyboru kategorii w onboardingu (M 8:7): grid 3-kolumnowy.
 * Zaznaczony kafel — pełna obwódka + odręczny inicjał w kolorze kategorii + check.
 * Odznaczony — przerywana obwódka, wyciszony. Multi-select (toggle); odznaczenie
 * NIE kasuje kategorii ze stanu (zostaje dostępna) — decyzja 11.4.
 * Każdy kafel to checkbox (aria-checked) → obsługa klawiaturą gratis.
 */
export function OnboardingCategoryTiles({
  categories,
  selected,
  onToggle,
  'aria-labelledby': labelledBy,
}: OnboardingCategoryTilesProps) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      className="grid grid-cols-3 gap-3"
    >
      {categories.map((category) => {
        const active = selected.has(category.id);
        return (
          <button
            key={category.id}
            type="button"
            role="checkbox"
            aria-checked={active}
            aria-label={category.name}
            onClick={() => onToggle(category.id)}
            className={cn(
              'relative flex aspect-[3/4] flex-col justify-between rounded-[var(--radius-field)] border p-3 text-left transition-colors',
              'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              active
                ? 'border-line bg-surface'
                : 'border-dashed border-line bg-surface-alt/40 opacity-70 hover:opacity-100',
            )}
          >
            <span
              className={cn(
                'font-handwriting text-2xl leading-none',
                active ? categoryTextClass(category.color) : 'text-ink-muted',
              )}
              aria-hidden="true"
            >
              {initial(category.name)}
            </span>
            <span
              className={cn(
                'text-[13px]',
                active ? 'text-ink' : 'text-ink-muted',
              )}
            >
              {category.name}
            </span>
            <span
              className={cn(
                'absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full transition-colors',
                active
                  ? 'bg-cta text-cta-foreground'
                  : 'border border-line bg-transparent',
              )}
              aria-hidden="true"
            >
              {active ? <Check className="size-3" strokeWidth={3} /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

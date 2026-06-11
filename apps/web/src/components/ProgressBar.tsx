import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  /** Liczba ukończonych zadań dnia. */
  done: number;
  /** Liczba wszystkich zadań dnia. */
  total: number;
  /** Procent ukończenia 0–100. */
  pct: number;
  className?: string;
}

/**
 * Pasek postępu dnia (D 20:2 / M 11:2): „X z Y zrobione · Z%".
 * Wypełnienie w kolorze CTA (ciemne na light, jasne na dark — token bg-cta).
 * a11y: role=progressbar z aria-valuenow/min/max + opis tekstowy obok.
 */
export function ProgressBar({ done, total, pct, className }: ProgressBarProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-field)] border border-line bg-surface px-4 py-3.5',
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-ink-soft">
          <span className="font-semibold text-ink tabular-nums">{done}</span> z{' '}
          <span className="tabular-nums">{total}</span> zrobione dzisiaj
        </p>
        <span className="font-handwriting text-2xl text-category-green tabular-nums">
          {pct}%
        </span>
      </div>
      <div
        className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-surface-alt"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Postęp dnia: ${done} z ${total} zadań ukończonych`}
      >
        <span
          className="block h-full rounded-full bg-cta transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

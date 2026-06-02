import { cn } from '@/lib/utils';
import type { Priority } from '@/features/tasks/model';

/**
 * Kolorowe pigułki priorytetu wg Figmy (D 20:110 / kokpit): pilne (czerwony),
 * wysoki (pomarańcz), średni (niebieski), niski (wyciszony). Kolor to kanał
 * pomocniczy — etykieta tekstowa niesie znaczenie (deuteranopia).
 * Klasy pełne (nie sklejane dynamicznie) — bezpieczne dla tree-shakingu Tailwind.
 */
const PRIORITY_PILL: Record<Priority, { label: string; className: string }> = {
  urgent: {
    label: 'pilne',
    className: 'bg-category-red/15 text-category-red',
  },
  high: {
    label: 'wysoki',
    className: 'bg-category-orange/15 text-category-orange',
  },
  medium: {
    label: 'średni',
    className: 'bg-category-blue/15 text-category-blue',
  },
  low: {
    label: 'niski',
    className: 'bg-surface-alt text-ink-muted',
  },
};

/** Niski priorytet w niektórych widokach renderujemy jako „—" (brak wyróżnienia). */
export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  const { label, className: tone } = PRIORITY_PILL[priority];
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center rounded-[var(--radius-pill)] px-2 text-xs font-medium',
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}

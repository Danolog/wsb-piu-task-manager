import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StreakBadgeProps {
  /** Liczba kolejnych dni z ukończonym zadaniem (selectStreak). */
  streak: number;
  className?: string;
}

/** Polska odmiana „dzień/dni" dla serii. */
function dayWord(n: number): string {
  return n === 1 ? 'dzień' : 'dni';
}

/**
 * Odznaka serii: „seria N dni". Ukrywa się przy zerowej serii (nic do pokazania).
 * Czysto prezentacyjny — wartość liczy selectStreak.
 */
export function StreakBadge({ streak, className }: StreakBadgeProps) {
  if (streak <= 0) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-line bg-surface px-3 py-1 text-sm text-ink-soft',
        className,
      )}
    >
      <Flame className="size-4 text-category-orange" aria-hidden="true" />
      <span>
        seria{' '}
        <span className="font-medium text-ink tabular-nums">{streak}</span>{' '}
        {dayWord(streak)}
      </span>
    </span>
  );
}

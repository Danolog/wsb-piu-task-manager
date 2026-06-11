import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  disabled?: boolean;
}

/**
 * Przełącznik on/off (role="switch"). Stan sygnalizowany pozycją kciuka + kolorem toru.
 * Tylko tokeny (dark-mode dziedziczy automatycznie). Sterowanie klawiaturą gratis (button).
 */
export function Switch({
  checked,
  onCheckedChange,
  id,
  disabled,
  ...aria
}: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={aria['aria-label']}
      aria-labelledby={aria['aria-labelledby']}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors',
        'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        checked ? 'bg-cta' : 'bg-surface-alt ring-1 ring-line',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block size-5 rounded-full bg-surface shadow-sm transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

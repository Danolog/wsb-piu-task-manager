import { forwardRef } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { PRIORITIES, type Priority } from '@/features/tasks/model';

const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Niski',
  medium: 'Średni',
  high: 'Wysoki',
  urgent: 'Pilny',
};

export interface PriorityControlProps {
  value?: Priority;
  onChange?: (value: Priority) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
  'aria-labelledby'?: string;
}

/**
 * Segmentowany wybór priorytetu (nad ToggleGroup w trybie single).
 * forwardRef + onChange/onBlur/name → kompatybilny z react-hook-form Controller.
 * Wymusza zawsze jedną wybraną wartość (puste kliknięcie nie odznacza).
 */
export const PriorityControl = forwardRef<HTMLDivElement, PriorityControlProps>(
  function PriorityControl(
    { value, onChange, onBlur, name, id, ...aria },
    ref,
  ) {
    return (
      <ToggleGroup
        ref={ref}
        id={id}
        type="single"
        // Wariant default (nie outline): obramowanie nosi wrapper grupy, jak w Figmie
        // D 133-2 (seg). Aktywny segment dostaje białe tło + obwódkę przez PRIORITY_ACTIVE.
        value={value ?? ''}
        onValueChange={(next) => {
          // ToggleGroup single zwraca '' przy odznaczeniu — ignorujemy, by zawsze trzymać wartość.
          if (next) onChange?.(next as Priority);
        }}
        onBlur={onBlur}
        aria-label={aria['aria-labelledby'] ? undefined : 'Priorytet'}
        aria-labelledby={aria['aria-labelledby']}
        // Wrapper segmentu wg Figmy: tło surface-alt, obwódka line, padding 4px, gap 4px, radius 11px.
        spacing={4}
        className="w-full rounded-[var(--radius-segment)] border border-line bg-surface-alt p-1"
      >
        {PRIORITIES.map((priority) => (
          <ToggleGroupItem
            key={priority}
            value={priority}
            aria-label={PRIORITY_LABEL[priority]}
            data-priority={priority}
            name={name}
            // Każdy segment: rozciągnięty, py-9, radius 8px, text 13px (Figma D 133-2 opt).
            // Aktywny segment: białe tło + obwódka + ciemny tekst (Figma — bez akcentu koloru).
            className={cn(
              'flex-1 rounded-[8px] py-[9px] text-[13px] text-ink-muted',
              'data-[state=on]:border data-[state=on]:border-line data-[state=on]:bg-field data-[state=on]:text-ink',
            )}
          >
            {PRIORITY_LABEL[priority]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  },
);

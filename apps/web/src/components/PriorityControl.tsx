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

// Kolor akcentu priorytetu (klasa tła aktywnego segmentu).
const PRIORITY_ACTIVE: Record<Priority, string> = {
  low: 'data-[state=on]:bg-category-green/15 data-[state=on]:text-category-green',
  medium:
    'data-[state=on]:bg-category-blue/15 data-[state=on]:text-category-blue',
  high: 'data-[state=on]:bg-category-orange/15 data-[state=on]:text-category-orange',
  urgent: 'data-[state=on]:bg-danger/15 data-[state=on]:text-danger',
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
        variant="outline"
        value={value ?? ''}
        onValueChange={(next) => {
          // ToggleGroup single zwraca '' przy odznaczeniu — ignorujemy, by zawsze trzymać wartość.
          if (next) onChange?.(next as Priority);
        }}
        onBlur={onBlur}
        aria-label={aria['aria-labelledby'] ? undefined : 'Priorytet'}
        aria-labelledby={aria['aria-labelledby']}
        className="w-full"
      >
        {PRIORITIES.map((priority) => (
          <ToggleGroupItem
            key={priority}
            value={priority}
            aria-label={PRIORITY_LABEL[priority]}
            data-priority={priority}
            name={name}
            className={cn('flex-1', PRIORITY_ACTIVE[priority])}
          >
            {PRIORITY_LABEL[priority]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  },
);

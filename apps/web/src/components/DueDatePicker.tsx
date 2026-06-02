import { useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DueDatePickerProps {
  /** Data jako 'YYYY-MM-DD' lub undefined (brak terminu). */
  value?: string | undefined;
  onChange: (value: string | undefined) => void;
  id?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
}

/** 'YYYY-MM-DD' string ↔ Date (lokalna północ) — bez przesunięć stref. */
function toDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Wybór terminu: przycisk-wyzwalacz + Popover z kalendarzem (react-day-picker, PL).
 * Pusty stan pokazuje placeholder „Dzisiaj". Kontrakt wartości to string 'YYYY-MM-DD'
 * (zgodny z modelem i zodem), nie obiekt Date.
 */
export function DueDatePicker({
  value,
  onChange,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': describedBy,
  'aria-labelledby': labelledBy,
}: DueDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = toDate(value);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={ariaInvalid}
            aria-describedby={describedBy}
            // Nazwa dostępna = etykieta „Termin" + bieżąca wartość (tekst w przycisku).
            aria-labelledby={
              labelledBy && id ? `${labelledBy} ${id}` : labelledBy
            }
            className={cn(
              'h-9 flex-1 justify-start gap-2 font-normal',
              !selected && 'text-ink-muted',
            )}
          >
            <CalendarIcon className="size-4" aria-hidden="true" />
            {selected ? (
              format(selected, 'd MMMM yyyy', { locale: pl })
            ) : (
              <span>Dzisiaj</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={pl}
            autoFocus
            {...(selected ? { selected, defaultMonth: selected } : {})}
            onSelect={(date) => {
              onChange(date ? toISODate(date) : undefined);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      {selected ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Wyczyść termin"
          onClick={() => onChange(undefined)}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}

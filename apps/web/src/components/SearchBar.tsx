import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface SearchBarProps {
  /** Aktualna wartość zatwierdzona (po debounce) — kontrolowana z TasksPage. */
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

/**
 * Pole wyszukiwania z debounce (~250 ms) — nie filtruje na każde naciśnięcie,
 * tylko po krótkiej pauzie w pisaniu (mniej re-renderów listy).
 * Lokalny stan trzyma to, co widać w polu; onChange wysyła wartość po pauzie.
 */
export function SearchBar({
  value,
  onChange,
  debounceMs = 250,
}: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const onChangeRef = useRef(onChange);
  // Aktualny onChange w refie (efekt nie zależy od jego tożsamości — stabilny debounce).
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Synchronizacja prop→stan BEZ efektu (wzorzec React „adjust state while rendering"):
  // gdy wartość zewnętrzna zmieni się niezależnie (np. „wyczyść filtry"), nadpisujemy local.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setLocal(value);
  }

  // Debounce: emituj dopiero po pauzie. Pomijaj, gdy local == value (brak realnej zmiany).
  useEffect(() => {
    if (local === value) return;
    const timer = setTimeout(() => onChangeRef.current(local), debounceMs);
    return () => clearTimeout(timer);
  }, [local, value, debounceMs]);

  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-muted"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Szukaj zadań..."
        aria-label="Szukaj zadań"
        className="py-2 pr-9 pl-8"
      />
      {local ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Wyczyść wyszukiwanie"
          onClick={() => {
            setLocal('');
            onChangeRef.current('');
          }}
          className="absolute top-1/2 right-1 -translate-y-1/2"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}

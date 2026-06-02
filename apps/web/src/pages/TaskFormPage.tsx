import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useMemo } from 'react';
import { useAppState } from '@/app/app-context';
import { Button } from '@/components/ui/button';
import { TaskForm } from '@/components/TaskForm';
import type { TaskInput } from '@/features/tasks/model';

/**
 * Strona tworzenia zadania (/nowe). Pełna strona z formularzem (bez modalu).
 * Desktop: w AppShell obok sidebara; mobile: pełna strona z nagłówkiem „× NOWE ZADANIE".
 */
export function TaskFormPage() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const categories = useMemo(
    () => Object.values(state.categories),
    [state.categories],
  );

  function handleSubmit(input: TaskInput) {
    dispatch({ type: 'task/add', payload: input });
    // Wracamy do listy — gdy zadanie ma termin „dziś", widać je też na kokpicie.
    navigate('/wszystkie');
  }

  return (
    <div className="w-full max-w-3xl px-4 py-6 md:px-10 md:py-8 2xl:px-14">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-[11px] font-medium tracking-wide text-ink-soft uppercase">
          Nowe zadanie
        </h1>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Zamknij"
          onClick={() => navigate(-1)}
        >
          <X className="size-5" aria-hidden="true" />
        </Button>
      </div>

      <TaskForm
        categories={categories}
        onSubmit={handleSubmit}
        submitLabel="Dodaj zadanie"
        footerSlot={
          <Button
            type="button"
            variant="outline"
            // Wymiary „Anuluj" wg Figmy D 133-2 (btn): obwódka, px-18 py-12, radius pill, 14px semibold.
            className="rounded-[var(--radius-pill)] px-[18px] py-[12px] text-sm font-semibold tracking-[0.1px] text-ink-muted"
            onClick={() => navigate(-1)}
          >
            Anuluj
          </Button>
        }
      />
    </div>
  );
}

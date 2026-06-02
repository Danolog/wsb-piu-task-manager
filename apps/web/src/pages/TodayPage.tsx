import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAppState } from '@/app/app-context';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { ProgressBar } from '@/components/ProgressBar';
import { StreakBadge } from '@/components/StreakBadge';
import {
  selectVisibleTasks,
  selectStreak,
  selectTodayProgress,
  defaultViewFilters,
} from '@/features/tasks/store';

/** Bieżący dzień YYYY-MM-DD (czas lokalny). */
function todayISO(): string {
  const now = new Date();
  const year = now.getFullYear().toString().padStart(4, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Kokpit „Dziś" (P-D, /dzis): powitanie, data, pasek postępu, seria,
 * lista zadań na dziś (dueDate === dzisiaj — decyzja 11.2), pusty stan,
 * toast „Cofnij" po odhaczeniu. Zastępuje tymczasowy TasksPage na tej trasie.
 */
export function TodayPage() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const today = todayISO();

  const tasks = useMemo(
    () =>
      selectVisibleTasks(
        state,
        {
          ...defaultViewFilters,
          datePreset: 'today',
          sortBy: 'dueDate',
          sortDir: 'asc',
        },
        today,
      ),
    [state, today],
  );
  const progress = useMemo(
    () => selectTodayProgress(state, today),
    [state, today],
  );
  const streak = useMemo(() => selectStreak(state, today), [state, today]);

  const greetingName = state.user.name.trim() || 'Cześć';
  const dateLabel = format(new Date(), 'EEEE · d MMMM', { locale: pl });

  /**
   * Toggle z toastem „Cofnij" po ukończeniu (D 43:2 / M 41:2).
   * Cofnięcie = ponowny toggle tego samego zadania (wraca do todo).
   */
  function handleToggle(id: string) {
    const before = state.tasks[id];
    dispatch({ type: 'task/toggle', payload: { id } });
    if (before && before.status !== 'done') {
      toast.success('Zadanie ukończone', {
        duration: 5000,
        action: {
          label: 'Cofnij',
          onClick: () => dispatch({ type: 'task/toggle', payload: { id } }),
        },
      });
    }
  }

  function handleDelete(id: string) {
    const task = state.tasks[id];
    if (!task) return;
    dispatch({ type: 'task/delete', payload: { id } });
    toast('Usunięto zadanie.', {
      duration: 5000,
      action: {
        label: 'Cofnij',
        onClick: () => dispatch({ type: 'task/restore', payload: { task } }),
      },
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
            {dateLabel}
          </p>
          <h1 className="mt-1 font-handwriting text-3xl text-ink">
            {state.user.name.trim() ? `Cześć, ${greetingName}` : 'Cześć'}
          </h1>
        </div>
        <Button
          type="button"
          onClick={() => navigate('/nowe')}
          className="h-9 shrink-0"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nowe zadanie
        </Button>
      </div>

      <div className="mb-6 space-y-3">
        <ProgressBar
          done={progress.done}
          total={progress.total}
          pct={progress.pct}
        />
        <StreakBadge streak={streak} />
      </div>

      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-handwriting text-2xl text-ink">Dziś</h2>
        {tasks.length > 0 ? (
          <span className="text-sm text-ink-muted tabular-nums">
            {tasks.length} {tasks.length === 1 ? 'zadanie' : 'zadania'}
          </span>
        ) : null}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Czysto na dziś"
          description="Nie masz dziś żadnych zadań. Dodaj pierwsze i zacznij dzień z planem."
          action={
            <Button type="button" onClick={() => navigate('/nowe')}>
              <Plus className="size-4" aria-hidden="true" />
              Dodaj pierwsze zadanie
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                category={
                  task.categoryId
                    ? state.categories[task.categoryId]
                    : undefined
                }
                onToggle={handleToggle}
                onEdit={(id) => navigate(`/zadanie/${id}`)}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

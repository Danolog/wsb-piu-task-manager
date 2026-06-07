import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CalendarCheck, SlidersHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAppState } from '@/app/app-context';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { FilterPanel } from '@/components/FilterPanel';
import { TaskCard } from '@/components/TaskCard';
import { TaskTable } from '@/components/TaskTable';
import { EmptyState } from '@/components/EmptyState';
import { ProgressBar } from '@/components/ProgressBar';
import { StreakBadge } from '@/components/StreakBadge';
import { DeleteTaskDialog } from '@/components/DeleteTaskDialog';
import {
  emptyListFilters,
  hasActiveFilters,
  type ListFilterState,
} from '@/features/tasks/list-filters';
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
 * toast „Cofnij" po odhaczeniu. Filtr (priorytet/kategoria/sort) jak w „Wszystkie"
 * — ten sam FilterPanel (popover desktop / sheet mobile), stan lokalny widoku.
 */
export function TodayPage() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const today = todayISO();

  const [filters, setFilters] = useState<ListFilterState>(emptyListFilters);
  // Osobne stany otwarcia: Popover (desktop) i Sheet (mobile) portalowane do body —
  // wspólny stan otwierałby obie warstwy naraz (spójnie z AllTasksPage).
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Zadanie wskazane do usunięcia — otwiera modal potwierdzenia (spójnie z edycją).
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const categories = useMemo(
    () => Object.values(state.categories),
    [state.categories],
  );

  const tasks = useMemo(() => {
    const base = selectVisibleTasks(
      state,
      {
        ...defaultViewFilters,
        datePreset: 'today',
        sortBy: filters.sortBy,
        sortDir: 'asc',
      },
      today,
    );
    return base.filter((task) => {
      if (
        filters.priorities.length > 0 &&
        !filters.priorities.includes(task.priority)
      ) {
        return false;
      }
      if (
        filters.categoryIds.length > 0 &&
        (!task.categoryId || !filters.categoryIds.includes(task.categoryId))
      ) {
        return false;
      }
      return true;
    });
  }, [state, today, filters]);
  const progress = useMemo(
    () => selectTodayProgress(state, today),
    [state, today],
  );
  const streak = useMemo(() => selectStreak(state, today), [state, today]);

  const greetingName = state.user.name.trim() || 'Cześć';
  const dateLabel = format(new Date(), 'EEEE · d MMMM', { locale: pl });
  const filtersActive = hasActiveFilters(filters);

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

  /** Po potwierdzeniu w modalu: usuń + zostaw toast „Cofnij" (undo) jako bonus. */
  function confirmDelete(id: string) {
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

  const pendingTask = pendingDelete ? state.tasks[pendingDelete] : undefined;

  const renderPanel = (onApply: () => void) => (
    <FilterPanel
      categories={categories}
      value={filters}
      onChange={setFilters}
      count={tasks.length}
      onApply={onApply}
    />
  );

  return (
    <div className="w-full max-w-[100rem] px-4 py-6 md:px-10 md:py-8 2xl:px-14">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
            {dateLabel}
          </p>
          <h1 className="mt-1 font-handwriting text-3xl text-ink">
            {state.user.name.trim() ? `Cześć, ${greetingName}` : 'Cześć'}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* Desktop: Popover z filtrami (ten sam FilterPanel co „Wszystkie"). */}
          <div className="hidden md:block">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="h-9">
                  <SlidersHorizontal className="size-4" aria-hidden="true" />
                  Filtruj
                  {filtersActive ? (
                    <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-cta text-xs text-cta-foreground tabular-nums">
                      {filters.priorities.length + filters.categoryIds.length}
                    </span>
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                {renderPanel(() => setPopoverOpen(false))}
              </PopoverContent>
            </Popover>
          </div>

          {/* Mobile: wyzwalacz bottom-sheeta z filtrami. */}
          <div className="md:hidden">
            <Button
              type="button"
              variant="outline"
              className="h-9"
              onClick={() => setSheetOpen(true)}
              aria-haspopup="dialog"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Filtruj
              {filtersActive ? (
                <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-cta text-xs text-cta-foreground tabular-nums">
                  {filters.priorities.length + filters.categoryIds.length}
                </span>
              ) : null}
            </Button>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetContent>
                <SheetTitle className="sr-only">Filtry</SheetTitle>
                {renderPanel(() => setSheetOpen(false))}
              </SheetContent>
            </Sheet>
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
        filtersActive ? (
          <EmptyState
            icon={CalendarCheck}
            title="Brak zadań dla tych filtrów"
            description="Zmień filtry, aby zobaczyć inne zadania dnia."
          />
        ) : (
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
        )
      ) : (
        <>
          {/* Desktop: ta sama tabela z kolumnami co „Wszystkie" (Zadanie / Termin /
              Priorytet / Kategoria) — spójne rozmieszczenie etykiet między widokami. */}
          <div className="hidden md:block">
            <TaskTable
              tasks={tasks}
              categories={state.categories}
              onToggle={handleToggle}
              onOpen={(id) => navigate(`/zadanie/${id}`)}
              onDelete={(id) => setPendingDelete(id)}
              onUpdateNote={(id, description) =>
                dispatch({
                  type: 'task/update',
                  payload: { id, changes: { description } },
                })
              }
            />
          </div>

          {/* Mobile: kartki (TaskCard), bez kolumn — jak dotychczas. */}
          <ul className="space-y-2 md:hidden">
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
                  onDelete={(id) => setPendingDelete(id)}
                  onUpdateNote={(id, description) =>
                    dispatch({
                      type: 'task/update',
                      payload: { id, changes: { description } },
                    })
                  }
                />
              </li>
            ))}
          </ul>
        </>
      )}

      <DeleteTaskDialog
        open={pendingDelete !== null}
        taskTitle={pendingTask?.title}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onConfirm={() => {
          if (pendingDelete) confirmDelete(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

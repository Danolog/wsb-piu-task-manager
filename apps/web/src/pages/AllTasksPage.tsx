import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, SlidersHorizontal, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAppState } from '@/app/app-context';
import { Button } from '@/components/ui/button';
import { TaskTable } from '@/components/TaskTable';
import { TaskList } from '@/components/TaskList';
import { cn } from '@/lib/utils';
import {
  selectVisibleTasks,
  defaultViewFilters,
  type DatePreset,
} from '@/features/tasks/store';
import { categoryDotClass } from '@/features/tasks/presentation';

/** Tytuł nagłówka per preset trasy. */
const PRESET_TITLE: Record<DatePreset, string> = {
  all: 'Wszystkie zadania',
  week: 'Ten tydzień',
  done: 'Zrobione',
  today: 'Dziś',
};

/** Param ?kat=<slug> mapujemy na id kategorii w seedzie: 'prywatne' → 'cat-prywatne'. */
function categoryIdFromParam(slug: string | null): string | null {
  if (!slug) return null;
  return `cat-${slug}`;
}

export interface AllTasksPageProps {
  /** Preset zakresu z trasy: /wszystkie=all, /tydzien=week, /zrobione=done. */
  preset: DatePreset;
}

/**
 * Widok listy (P-E): desktop = TaskTable (kolumny), mobile = kartki (TaskList).
 * Oba z selectVisibleTasks + datePreset z trasy. Filtr kategorii przez query
 * param ?kat= + zdejmowalny chip (pełny panel filtrów dopiero w P-G).
 */
export function AllTasksPage({ preset }: AllTasksPageProps) {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const catSlug = searchParams.get('kat');
  const activeCategoryId = categoryIdFromParam(catSlug);
  const activeCategory = activeCategoryId
    ? state.categories[activeCategoryId]
    : undefined;
  // Param wskazujący nieistniejącą kategorię traktujemy jak brak filtra.
  const effectiveCategoryId =
    activeCategory !== undefined ? activeCategoryId! : 'all';

  const visibleTasks = useMemo(
    () =>
      selectVisibleTasks(state, {
        ...defaultViewFilters,
        datePreset: preset,
        categoryId: effectiveCategoryId,
        sortBy: 'dueDate',
        sortDir: 'asc',
      }),
    [state, preset, effectiveCategoryId],
  );

  function clearCategoryFilter() {
    const next = new URLSearchParams(searchParams);
    next.delete('kat');
    setSearchParams(next, { replace: true });
  }

  function handleToggle(id: string) {
    dispatch({ type: 'task/toggle', payload: { id } });
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
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="font-handwriting text-3xl text-ink">
            {PRESET_TITLE[preset]}
          </h1>
          {activeCategory ? (
            <button
              type="button"
              onClick={clearCategoryFilter}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-line bg-surface px-2.5 py-1 text-[13px] text-ink-soft transition-colors hover:bg-surface-alt',
                'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              )}
              aria-label={`Usuń filtr kategorii: ${activeCategory.name}`}
            >
              <span
                className={cn(
                  'size-2 shrink-0 rounded-full',
                  categoryDotClass(activeCategory.color),
                )}
                aria-hidden="true"
              />
              {activeCategory.name}
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled
            title="Filtry pojawią się wkrótce"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filtruj
          </Button>
          <Button type="button" size="lg" onClick={() => navigate('/nowe')}>
            <Plus className="size-4" aria-hidden="true" />
            Nowe zadanie
          </Button>
        </div>
      </div>

      {/* Desktop: tabela z kolumnami. */}
      <div className="hidden md:block">
        {visibleTasks.length === 0 ? (
          <EmptyAll filtered={activeCategory !== undefined} />
        ) : (
          <TaskTable
            tasks={visibleTasks}
            categories={state.categories}
            onToggle={handleToggle}
            onOpen={(id) => navigate(`/zadanie/${id}`)}
          />
        )}
      </div>

      {/* Mobile: kartki. */}
      <div className="md:hidden">
        <TaskList
          tasks={visibleTasks}
          categories={state.categories}
          onToggle={handleToggle}
          onEdit={(id) => navigate(`/zadanie/${id}`)}
          onDelete={handleDelete}
          filtered={activeCategory !== undefined}
        />
      </div>
    </div>
  );
}

/** Pusty stan tabeli desktop (TaskList ma własny dla mobile). */
function EmptyAll({ filtered }: { filtered: boolean }) {
  return (
    <div
      className="rounded-[var(--radius-field)] border border-dashed border-line bg-surface px-6 py-12 text-center"
      role="status"
    >
      <p className="text-base font-semibold text-ink">
        {filtered ? 'Brak zadań w tej kategorii' : 'Brak zadań'}
      </p>
      <p className="mt-1 text-sm text-ink-muted">
        {filtered
          ? 'Zmień filtr, aby zobaczyć inne zadania.'
          : 'Dodaj pierwsze zadanie, aby zacząć.'}
      </p>
    </div>
  );
}

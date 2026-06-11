import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, SlidersHorizontal, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAppState } from '@/app/app-context';
import { Button } from '@/components/ui/button';
import { TaskTable } from '@/components/TaskTable';
import { TaskList } from '@/components/TaskList';
import { SearchBar } from '@/components/SearchBar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { FilterPanel } from '@/components/FilterPanel';
import { DeleteTaskDialog } from '@/components/DeleteTaskDialog';
import {
  emptyListFilters,
  hasActiveFilters,
  type ListFilterState,
} from '@/features/tasks/list-filters';
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
 * Widok listy (P-E + P-G): desktop = TaskTable (kolumny), mobile = kartki (TaskList).
 * Filtry: desktop Popover, mobile Sheet (FilterPanel). Search: desktop pole w topbarze
 * (decyzja 11.1). Stan filtrów lokalny dla widoku (nie globalny reducer).
 */
export function AllTasksPage({ preset }: AllTasksPageProps) {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<ListFilterState>(emptyListFilters);
  const [search, setSearch] = useState('');
  // Osobne stany otwarcia: Popover (desktop) i Sheet (mobile) są portalowane do
  // body, więc współdzielony stan otwierałby obie warstwy naraz. Wyzwalacze i tak
  // żyją w rozłącznych wrapperach breakpointu, więc per widok dotykalny jest jeden.
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Zadanie wskazane do usunięcia — kosz otwiera modal potwierdzenia (spójnie z edycją).
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const catSlug = searchParams.get('kat');
  const activeCategoryId = categoryIdFromParam(catSlug);
  const activeCategory = activeCategoryId
    ? state.categories[activeCategoryId]
    : undefined;

  const categories = useMemo(
    () => Object.values(state.categories),
    [state.categories],
  );

  const visibleTasks = useMemo(() => {
    // Baza: preset trasy + sort + wyszukiwanie (selectVisibleTasks).
    const base = selectVisibleTasks(state, {
      ...defaultViewFilters,
      datePreset: preset,
      search,
      sortBy: filters.sortBy,
      sortDir: 'asc',
    });
    // Nakładamy filtry panelu: priorytet (wielokrotny) + kategoria (wielokrotna)
    // oraz starszy filtr ?kat= (chip nad listą), jeśli aktywny.
    return base.filter((task) => {
      if (
        filters.priorities.length > 0 &&
        !filters.priorities.includes(task.priority)
      ) {
        return false;
      }
      const catSet = new Set(filters.categoryIds);
      if (activeCategory) catSet.add(activeCategory.id);
      if (catSet.size > 0) {
        if (!task.categoryId || !catSet.has(task.categoryId)) return false;
      }
      return true;
    });
  }, [state, preset, search, filters, activeCategory]);

  function clearCategoryFilter() {
    const next = new URLSearchParams(searchParams);
    next.delete('kat');
    setSearchParams(next, { replace: true });
  }

  function handleToggle(id: string) {
    dispatch({ type: 'task/toggle', payload: { id } });
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

  function handleUpdateNote(id: string, description: string) {
    dispatch({
      type: 'task/update',
      payload: { id, changes: { description } },
    });
  }

  const pendingTask = pendingDelete ? state.tasks[pendingDelete] : undefined;

  const filtersActive = hasActiveFilters(filters);

  // Spójność z filtrem z sidebara: kategoria wskazana w URL (?kat=, np. klik
  // „Studia" w lewym panelu) jest tym samym filtrem co zaznaczenie kategorii w
  // FilterPanel. Pokazujemy ją jako zaznaczoną w panelu (jedno źródło prawdy w
  // UI). Gdy user przełącza kategorie w panelu, migrujemy filtr z URL do stanu
  // panelu, żeby nie mieć dwóch konkurujących znaczników tej samej kategorii.
  const panelValue: ListFilterState =
    activeCategory && !filters.categoryIds.includes(activeCategory.id)
      ? { ...filters, categoryIds: [...filters.categoryIds, activeCategory.id] }
      : filters;

  const handlePanelChange = (next: ListFilterState) => {
    // Gdy filtr przyszedł z URL (?kat=), pierwsza interakcja w panelu przejmuje
    // go: panel widzi kategorię jako zaznaczoną (panelValue), więc `next` już
    // niesie pełną decyzję usera. Zapisujemy `next` do stanu panelu i zdejmujemy
    // ?kat=, żeby ta sama kategoria nie była trzymana w dwóch kanałach naraz.
    setFilters(next);
    if (activeCategory) {
      const params = new URLSearchParams(searchParams);
      params.delete('kat');
      setSearchParams(params, { replace: true });
    }
  };

  const renderPanel = (onApply: () => void) => (
    <FilterPanel
      categories={categories}
      value={panelValue}
      onChange={handlePanelChange}
      count={visibleTasks.length}
      onApply={onApply}
    />
  );

  return (
    <div className="w-full max-w-[120rem] px-4 py-6 md:px-10 md:py-8 2xl:px-14">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
          {/* Desktop: pole szukania w topbarze (decyzja 11.1). */}
          <div className="hidden w-56 md:block">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          {/* Desktop: Popover z filtrami. */}
          <div className="hidden md:block">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="lg">
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
              size="lg"
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

          <Button type="button" size="lg" onClick={() => navigate('/nowe')}>
            <Plus className="size-4" aria-hidden="true" />
            Nowe zadanie
          </Button>
        </div>
      </div>

      {/* Desktop: tabela z kolumnami. */}
      <div className="hidden md:block">
        {visibleTasks.length === 0 ? (
          <EmptyAll filtered={activeCategory !== undefined || filtersActive} />
        ) : (
          <TaskTable
            tasks={visibleTasks}
            categories={state.categories}
            onToggle={handleToggle}
            onOpen={(id) => navigate(`/zadanie/${id}`)}
            onDelete={(id) => setPendingDelete(id)}
            onUpdateNote={handleUpdateNote}
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
          onDelete={(id) => setPendingDelete(id)}
          onUpdateNote={handleUpdateNote}
          filtered={activeCategory !== undefined || filtersActive}
        />
      </div>

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

/** Pusty stan tabeli desktop (TaskList ma własny dla mobile). */
function EmptyAll({ filtered }: { filtered: boolean }) {
  return (
    <div
      className="rounded-[var(--radius-field)] border border-dashed border-line bg-surface px-6 py-12 text-center"
      role="status"
    >
      <p className="text-base font-semibold text-ink">
        {filtered ? 'Brak zadań dla tych filtrów' : 'Brak zadań'}
      </p>
      <p className="mt-1 text-sm text-ink-muted">
        {filtered
          ? 'Zmień filtry, aby zobaczyć inne zadania.'
          : 'Dodaj pierwsze zadanie, aby zacząć.'}
      </p>
    </div>
  );
}

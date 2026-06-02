import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/AppShell';
import { SearchBar } from '@/components/SearchBar';
import { CategoryPills } from '@/components/CategoryPills';
import { StatusTabs } from '@/components/StatusTabs';
import { SortControl } from '@/components/SortControl';
import { TaskList } from '@/components/TaskList';
import { TaskFormDialog } from '@/components/TaskFormDialog';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/app/app-context';
import {
  selectVisibleTasks,
  defaultViewFilters,
  type ViewFilters,
} from '@/features/tasks/store';
import type { Task, TaskInput } from '@/features/tasks/model';

export function TasksPage() {
  const { state, dispatch } = useAppState();

  // Stan widoku (filtry/sort/search) — lokalny, NIE w globalnym reducerze.
  const [filters, setFilters] = useState<ViewFilters>(defaultViewFilters);

  // Stan modalu formularza: zamknięty / tworzenie / edycja konkretnego zadania.
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const categories = useMemo(
    () => Object.values(state.categories),
    [state.categories],
  );

  const visibleTasks = useMemo(
    () => selectVisibleTasks(state, filters),
    [state, filters],
  );

  const isFiltered =
    filters.search.trim() !== '' ||
    filters.categoryId !== 'all' ||
    filters.status !== 'all';

  function openCreate() {
    setEditingTask(undefined);
    setDialogOpen(true);
  }

  function openEdit(id: string) {
    const task = state.tasks[id];
    if (!task) return;
    setEditingTask(task);
    setDialogOpen(true);
  }

  function handleSubmit(input: TaskInput) {
    if (editingTask) {
      dispatch({
        type: 'task/update',
        payload: { id: editingTask.id, changes: input },
      });
      toast.success('Zapisano zmiany.');
    } else {
      dispatch({ type: 'task/add', payload: input });
      toast.success('Dodano zadanie.');
    }
  }

  function handleToggle(id: string) {
    dispatch({ type: 'task/toggle', payload: { id } });
  }

  /**
   * Usuwanie z możliwością cofnięcia (5 s).
   * Trzymamy kopię usuwanego zadania w domknięciu — „Cofnij" odtwarza je przez task/restore
   * z oryginalnym id i timestampami (task/add wygenerowałby nowe id).
   */
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
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Lista zadań</h1>
          <Button type="button" onClick={openCreate} className="h-9">
            <Plus className="size-4" aria-hidden="true" />
            Dodaj zadanie
          </Button>
        </div>

        {/* Toolbar: szukaj, status, sort, kategorie */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar
              value={filters.search}
              onChange={(search) => setFilters((f) => ({ ...f, search }))}
            />
            <div className="flex items-center justify-between gap-3">
              <StatusTabs
                value={filters.status}
                onChange={(status) => setFilters((f) => ({ ...f, status }))}
              />
              <SortControl
                sortBy={filters.sortBy}
                sortDir={filters.sortDir}
                onSortByChange={(sortBy) =>
                  setFilters((f) => ({ ...f, sortBy }))
                }
                onSortDirChange={(sortDir) =>
                  setFilters((f) => ({ ...f, sortDir }))
                }
              />
            </div>
          </div>
          <CategoryPills
            categories={categories}
            value={filters.categoryId}
            onChange={(categoryId) => setFilters((f) => ({ ...f, categoryId }))}
          />
        </div>

        <TaskList
          tasks={visibleTasks}
          categories={state.categories}
          onToggle={handleToggle}
          onEdit={openEdit}
          onDelete={handleDelete}
          filtered={isFiltered}
          emptyAction={
            <Button type="button" onClick={openCreate}>
              <Plus className="size-4" aria-hidden="true" />
              Dodaj zadanie
            </Button>
          }
        />
      </div>

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        task={editingTask}
        onSubmit={handleSubmit}
      />
    </AppShell>
  );
}

import { useMemo, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAppState } from '@/app/app-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { TaskForm } from '@/components/TaskForm';
import { selectVisibleTasks, defaultViewFilters } from '@/features/tasks/store';
import { formatDueShort } from '@/features/tasks/presentation';
import { cn } from '@/lib/utils';
import type { TaskInput, Task } from '@/features/tasks/model';

/**
 * Strona edycji zadania (/zadanie/:id).
 * Desktop ≥ md: układ 3-kolumnowy (sidebar AppShell + lista zadań + panel edycji).
 * Mobile: pełna strona z formularzem. Brak zadania o danym id → redirect 404.
 */
export function TaskEditPage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Po usunięciu zadanie znika ze stanu — flaga zapobiega błyskowi 404 zanim
  // zadziała nawigacja na listę (guard 404 dotyczy tylko realnie nieznanego id).
  const [deleted, setDeleted] = useState(false);

  const task = id ? state.tasks[id] : undefined;

  const categories = useMemo(
    () => Object.values(state.categories),
    [state.categories],
  );

  // Lista do środkowej kolumny (desktop) — wszystkie zadania, najnowsze wg terminu.
  const listTasks = useMemo(
    () =>
      selectVisibleTasks(state, {
        ...defaultViewFilters,
        datePreset: 'all',
        sortBy: 'dueDate',
        sortDir: 'asc',
      }),
    [state],
  );

  // :id nie istnieje → 404 (zgodnie z DoD P-F). Po usunięciu nawigujemy na listę,
  // więc nie pokazujemy wtedy 404.
  if (!task) {
    return <Navigate to={deleted ? '/wszystkie' : '/404'} replace />;
  }

  function handleSubmit(input: TaskInput) {
    if (!task) return;
    dispatch({ type: 'task/saveEdit', payload: { id: task.id, input } });
    navigate('/wszystkie');
  }

  function handleDelete() {
    if (!task) return;
    setDeleted(true);
    setConfirmDelete(false);
    dispatch({ type: 'task/delete', payload: { id: task.id } });
    navigate('/wszystkie');
  }

  const deleteButton = (
    <Button
      type="button"
      variant="ghost"
      className="text-danger hover:text-danger"
      onClick={() => setConfirmDelete(true)}
    >
      Usuń zadanie
    </Button>
  );

  // Klucz wymusza remount formularza przy zmianie zadania (świeży prefill z defaultValues).
  const formNode = (
    <TaskForm
      key={task.id}
      task={task}
      categories={categories}
      onSubmit={handleSubmit}
      submitLabel="Zapisz zmiany"
      footerSlot={deleteButton}
    />
  );

  return (
    <>
      {/* Mobile: pełna strona z nagłówkiem. */}
      <div className="mx-auto max-w-2xl px-4 py-6 md:hidden">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-[11px] font-medium tracking-wide text-ink-soft uppercase">
            Edytujesz zadanie
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
        {formNode}
      </div>

      {/* Desktop ≥ md: lista zadań (środek) + panel edycji (prawo). */}
      <div className="hidden md:grid md:grid-cols-[20rem_1fr] md:gap-0">
        <div className="border-r border-line px-4 py-8">
          <h2 className="mb-4 font-handwriting text-2xl text-ink">
            Wszystkie · {listTasks.length}
          </h2>
          <ul className="flex flex-col gap-1">
            {listTasks.map((item) => (
              <EditListRow
                key={item.id}
                task={item}
                active={item.id === task.id}
                onSelect={() => navigate(`/zadanie/${item.id}`)}
              />
            ))}
          </ul>
        </div>
        <div className="px-8 py-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h1 className="text-[11px] font-medium tracking-wide text-ink-soft uppercase">
              Edytujesz zadanie
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
          {formNode}
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Usunąć zadanie?</DialogTitle>
            <DialogDescription>
              Zadanie „{task.title}" zostanie trwale usunięte. Tej operacji nie
              można cofnąć z tego ekranu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmDelete(false)}
            >
              Anuluj
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Usuń zadanie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Wiersz listy w środkowej kolumnie desktopowego widoku edycji. */
function EditListRow({
  task,
  active,
  onSelect,
}: {
  task: Task;
  active: boolean;
  onSelect: () => void;
}) {
  const due = formatDueShort(task.dueDate, task.dueTime);
  const done = task.status === 'done';
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? 'true' : undefined}
        className={cn(
          'flex w-full flex-col items-start gap-0.5 rounded-[var(--radius-field)] border px-3 py-2.5 text-left transition-colors',
          'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
          active
            ? 'border-ink bg-surface-alt'
            : 'border-transparent hover:bg-surface-alt',
        )}
      >
        <span
          className={cn(
            'text-[15px] font-medium text-ink',
            done && 'text-ink-muted line-through',
          )}
        >
          {task.title}
        </span>
        {due ? (
          <span className="text-xs text-ink-muted">{due.label}</span>
        ) : null}
      </button>
    </li>
  );
}

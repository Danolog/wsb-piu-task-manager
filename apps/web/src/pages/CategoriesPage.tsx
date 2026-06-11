import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
import { CategoryEditDialog } from '@/components/CategoryEditDialog';
import { categoryDotClass } from '@/features/tasks/presentation';
import { cn } from '@/lib/utils';
import type { Category } from '@/features/tasks/model';

/** Polska odmiana „zadań/zadanie/zadania". */
function pluralTasks(n: number): string {
  if (n === 1) return 'zadanie';
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return 'zadania';
  }
  return 'zadań';
}

/**
 * Strona kategorii (/kategorie) wg D 24:90: lista kategorii z kolorową kropką,
 * liczbą zadań i akcją „Edytuj" + „+ Nowa kategoria". Usunięcie odpina kategorię
 * od zadań (reducer category/delete), nie kasuje zadań.
 */
export function CategoriesPage() {
  const { state, dispatch } = useAppState();
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  const categories = useMemo(
    () => Object.values(state.categories),
    [state.categories],
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const task of Object.values(state.tasks)) {
      if (task.categoryId)
        map[task.categoryId] = (map[task.categoryId] ?? 0) + 1;
    }
    return map;
  }, [state.tasks]);

  function handleSave(data: { name: string; color: string }) {
    if (editing && editing !== 'new') {
      dispatch({
        type: 'category/update',
        payload: { id: editing.id, changes: data },
      });
    } else {
      dispatch({ type: 'category/add', payload: data });
    }
  }

  return (
    <div className="w-full max-w-4xl px-4 py-6 md:px-10 md:py-8 2xl:px-14">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-handwriting text-3xl text-ink">Kategorie</h1>
        <Button type="button" size="lg" onClick={() => setEditing('new')}>
          <Plus className="size-4" aria-hidden="true" />
          Nowa kategoria
        </Button>
      </div>

      {categories.length > 0 ? (
        <ul className="overflow-hidden rounded-[var(--radius-field)] border border-line bg-surface">
          {categories.map((category, idx) => (
            <li
              key={category.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3',
                idx > 0 && 'border-t border-line',
              )}
            >
              <span
                className={cn(
                  'size-3 shrink-0 rounded-full',
                  categoryDotClass(category.color),
                )}
                aria-hidden="true"
              />
              <span className="flex-1 truncate text-[15px] text-ink">
                {category.name}
              </span>
              <span className="text-sm text-ink-muted tabular-nums">
                {counts[category.id] ?? 0}{' '}
                {pluralTasks(counts[category.id] ?? 0)}
              </span>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-category-teal"
                onClick={() => setEditing(category)}
              >
                Edytuj
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Usuń kategorię ${category.name}`}
                onClick={() => setConfirmDelete(category)}
                className="text-ink-muted hover:text-danger"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">
          Brak kategorii. Dodaj pierwszą przyciskiem „Nowa kategoria".
        </p>
      )}

      <CategoryEditDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        category={editing && editing !== 'new' ? editing : undefined}
        onSave={handleSave}
      />

      <Dialog
        open={confirmDelete !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Usunąć kategorię?</DialogTitle>
            <DialogDescription>
              {confirmDelete
                ? `Kategoria „${confirmDelete.name}" zostanie usunięta. Przypisane zadania pozostaną, ale stracą tę kategorię.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmDelete(null)}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (confirmDelete) {
                  dispatch({
                    type: 'category/delete',
                    payload: { id: confirmDelete.id },
                  });
                }
                setConfirmDelete(null);
              }}
            >
              Usuń kategorię
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

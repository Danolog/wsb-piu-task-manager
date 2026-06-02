import { useId, useState } from 'react';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAppState } from '@/app/app-context';
import {
  categoryDotClass,
  CATEGORY_COLOR_TOKENS,
} from '@/features/tasks/presentation';
import type { Category } from '@/features/tasks/model';

const COLOR_LABEL: Record<string, string> = {
  'category-green': 'zielony',
  'category-blue': 'niebieski',
  'category-purple': 'fioletowy',
  'category-orange': 'pomarańczowy',
  'category-red': 'czerwony',
};

/** Wybór koloru z palety jako kropki-radio. */
function ColorPicker({
  value,
  onChange,
  labelledBy,
}: {
  value: string;
  onChange: (color: string) => void;
  labelledBy: string;
}) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex gap-2">
      {CATEGORY_COLOR_TOKENS.map((token) => {
        const active = token === value;
        return (
          <button
            key={token}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`Kolor ${COLOR_LABEL[token] ?? token}`}
            onClick={() => onChange(token)}
            className={cn(
              'flex size-7 items-center justify-center rounded-full border-2 transition-colors',
              'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              active ? 'border-ink' : 'border-transparent',
            )}
          >
            <span
              className={cn('size-4 rounded-full', categoryDotClass(token))}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}

/** Pojedynczy wiersz kategorii z trybem podglądu / edycji inline. */
function CategoryRow({ category }: { category: Category }) {
  const { dispatch } = useAppState();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ids = useId();
  const colorLabelId = `${ids}-color`;

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({
      type: 'category/update',
      payload: { id: category.id, changes: { name: trimmed, color } },
    });
    setEditing(false);
  }

  function cancel() {
    setName(category.name);
    setColor(category.color);
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-3 rounded-[var(--radius-field)] border border-line bg-surface p-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${ids}-name`}>Nazwa</Label>
          <Input
            id={`${ids}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span id={colorLabelId} className="text-sm font-medium">
            Kolor
          </span>
          <ColorPicker
            value={color}
            onChange={setColor}
            labelledBy={colorLabelId}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={cancel}>
            <X className="size-4" aria-hidden="true" />
            Anuluj
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={save}
            disabled={!name.trim()}
          >
            <Check className="size-4" aria-hidden="true" />
            Zapisz
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 rounded-[var(--radius-field)] border border-line bg-surface px-3 py-2.5">
      <span
        className={cn(
          'size-3 shrink-0 rounded-full',
          categoryDotClass(category.color),
        )}
        aria-hidden="true"
      />
      <span className="flex-1 text-[15px] text-ink">{category.name}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Edytuj kategorię ${category.name}`}
        onClick={() => setEditing(true)}
      >
        <Pencil className="size-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Usuń kategorię ${category.name}`}
        onClick={() => setConfirmDelete(true)}
      >
        <Trash2 className="size-4 text-danger" aria-hidden="true" />
      </Button>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Usunąć kategorię?</DialogTitle>
            <DialogDescription>
              Kategoria „{category.name}" zostanie usunięta. Przypisane zadania
              pozostaną, ale stracą tę kategorię.
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
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                dispatch({
                  type: 'category/delete',
                  payload: { id: category.id },
                });
                setConfirmDelete(false);
              }}
            >
              Usuń kategorię
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}

/** Formularz dodawania nowej kategorii. */
function AddCategoryForm() {
  const { dispatch } = useAppState();
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(CATEGORY_COLOR_TOKENS[0]!);
  const ids = useId();
  const colorLabelId = `${ids}-color`;

  function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({ type: 'category/add', payload: { name: trimmed, color } });
    setName('');
    setColor(CATEGORY_COLOR_TOKENS[0]!);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        add();
      }}
      className="flex flex-col gap-3 rounded-[var(--radius-field)] border border-dashed border-line bg-surface p-3"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${ids}-name`}>Nowa kategoria</Label>
        <Input
          id={`${ids}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nazwa kategorii..."
          maxLength={40}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span id={colorLabelId} className="text-sm font-medium">
          Kolor
        </span>
        <ColorPicker
          value={color}
          onChange={setColor}
          labelledBy={colorLabelId}
        />
      </div>
      <Button
        type="submit"
        size="sm"
        className="self-start"
        disabled={!name.trim()}
      >
        <Plus className="size-4" aria-hidden="true" />
        Dodaj kategorię
      </Button>
    </form>
  );
}

/** Sekcja zarządzania kategoriami w Ustawieniach: lista + edycja/usuwanie + dodawanie. */
export function CategoryManager() {
  const { state } = useAppState();
  const categories = Object.values(state.categories);

  return (
    <div className="space-y-3">
      {categories.length > 0 ? (
        <ul className="space-y-2">
          {categories.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">
          Brak kategorii. Dodaj pierwszą poniżej.
        </p>
      )}
      <AddCategoryForm />
    </div>
  );
}

import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  'category-teal': 'morski',
};

/** Wybór koloru z palety jako kropki-radio. */
export function ColorPicker({
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

export interface CategoryEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Kategoria do edycji; brak = tryb dodawania. */
  category?: Category | undefined;
  onSave: (data: { name: string; color: string }) => void;
}

/** Modal dodania/edycji kategorii (nazwa + kolor). Wspólny dla Ustawień i strony Kategorie. */
export function CategoryEditDialog({
  open,
  onOpenChange,
  category,
  onSave,
}: CategoryEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {open ? (
          <CategoryEditForm
            key={category?.id ?? 'new'}
            category={category}
            onSave={(data) => {
              onSave(data);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CategoryEditForm({
  category,
  onSave,
  onCancel,
}: {
  category: Category | undefined;
  onSave: (data: { name: string; color: string }) => void;
  onCancel: () => void;
}) {
  const isEdit = category !== undefined;
  const [name, setName] = useState(category?.name ?? '');
  const [color, setColor] = useState<string>(
    category?.color ?? CATEGORY_COLOR_TOKENS[0]!,
  );
  const ids = useId();
  const colorLabelId = `${ids}-color`;

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ name: trimmed, color });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <DialogHeader>
        <DialogTitle>
          {isEdit ? 'Edytuj kategorię' : 'Nowa kategoria'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Podaj nazwę i kolor kategorii.
        </DialogDescription>
      </DialogHeader>

      <div className="my-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${ids}-name`}>Nazwa</Label>
          <Input
            id={`${ids}-name`}
            autoFocus
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
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Anuluj
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          {isEdit ? 'Zapisz' : 'Dodaj kategorię'}
        </Button>
      </DialogFooter>
    </form>
  );
}

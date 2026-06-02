import { useEffect, useRef, useState } from 'react';
import { CalendarClock, Trash2, Pencil } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  DESCRIPTION_MAX,
  type Category,
  type Task,
} from '@/features/tasks/model';
import {
  PRIORITY_LABEL,
  categoryDotClass,
  formatDueDate,
} from '@/features/tasks/presentation';

export interface TaskCardProps {
  task: Task;
  category?: Category | undefined;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  /** Zapis notatki edytowanej inline z listy (description). Brak = notatka tylko do odczytu. */
  onUpdateNote?: (id: string, description: string) => void;
}

// Wariant Badge priorytetu (wysoki/pilny mocniej wyróżnione).
const PRIORITY_VARIANT: Record<
  Task['priority'],
  'secondary' | 'outline' | 'destructive'
> = {
  low: 'outline',
  medium: 'secondary',
  high: 'secondary',
  urgent: 'destructive',
};

/**
 * Karta pojedynczego zadania.
 * Stan „done" sygnalizowany dwoma kanałami (nie tylko kolorem — deuteranopia):
 * przekreślenie tytułu + przyciemnienie całej karty.
 * Notatka (description) widoczna pod tytułem i edytowalna inline (gdy `onUpdateNote`):
 * klik notatki/„Dodaj notatkę" → Textarea → zapis aktualizuje description.
 */
export function TaskCard({
  task,
  category,
  onToggle,
  onEdit,
  onDelete,
  onUpdateNote,
}: TaskCardProps) {
  const done = task.status === 'done';
  const due = formatDueDate(task.dueDate);
  const titleId = `task-title-${task.id}`;

  const editable = onUpdateNote !== undefined;
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(task.description ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Wejście w edycję → fokus na końcu tekstu (draft ustawia openNoteEditor).
  useEffect(() => {
    if (editingNote) {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
    }
  }, [editingNote]);

  /** Otwiera inline-edycję notatki ze świeżym draftem z bieżącej wartości. */
  function openNoteEditor() {
    setNoteDraft(task.description ?? '');
    setEditingNote(true);
  }

  function saveNote() {
    const trimmed = noteDraft.trim();
    // Zapis tylko gdy realna zmiana — pusty draft kasuje notatkę (description '').
    if (trimmed !== (task.description ?? '')) {
      onUpdateNote?.(task.id, trimmed);
    }
    setEditingNote(false);
  }

  function cancelNote() {
    setNoteDraft(task.description ?? '');
    setEditingNote(false);
  }

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-[var(--radius-field)] border border-line bg-surface px-3 py-3 transition-colors',
        // Done = przekreślenie + wyciszony tytuł (niżej), bez opacity na całej karcie —
        // globalna przezroczystość zbijała kontrast tekstu poniżej WCAG AA.
        done && 'bg-surface-alt/30',
      )}
      data-status={task.status}
    >
      <Checkbox
        checked={done}
        onCheckedChange={() => onToggle(task.id)}
        // Min 32×32 px klikalnej powierzchni (checkbox + ::after w prymitywie powiększa hit-area).
        className="mt-0.5 size-5"
        aria-label={`${done ? 'Oznacz jako niewykonane' : 'Oznacz jako wykonane'}: ${task.title}`}
      />

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onEdit(task.id)}
          className="block w-full cursor-pointer text-left focus-visible:outline-none"
        >
          {/* Akcesyjny opis akcji jako sr-only prefiks — nazwa przycisku liczona
              z treści widocznej (tytuł), więc zawiera widoczny tekst
              (WCAG 2.5.3 label-in-name), a nie tylko aria-label z samym tytułem. */}
          <span className="sr-only">Edytuj zadanie: </span>
          <span
            id={titleId}
            className={cn(
              'block truncate text-[15px] font-medium text-ink group-focus-within:underline',
              done && 'text-ink-muted line-through',
            )}
          >
            {task.title}
          </span>
        </button>

        {/* Notatka (description): pod tytułem, stonowana (Figma D 22:2).
            Edytowalna inline gdy przekazano onUpdateNote — klik otwiera Textarea.
            Poza przyciskiem edycji zadania (rodzeństwo), więc bez button-in-button. */}
        {editingNote ? (
          <div className="mt-1.5">
            <Textarea
              ref={textareaRef}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  cancelNote();
                }
                // Ctrl/Cmd+Enter zapisuje (Enter sam = nowa linia w notatce).
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  saveNote();
                }
              }}
              maxLength={DESCRIPTION_MAX}
              rows={2}
              className="min-h-0 text-[13px]"
              placeholder="Dodaj szczegóły, linki..."
              aria-label={`Notatka zadania: ${task.title}`}
            />
            <div className="mt-1.5 flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                className="h-7"
                onClick={saveNote}
              >
                Zapisz
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7"
                onClick={cancelNote}
              >
                Anuluj
              </Button>
            </div>
          </div>
        ) : task.description ? (
          editable ? (
            <button
              type="button"
              onClick={openNoteEditor}
              className="mt-0.5 flex w-full items-start gap-1.5 text-left text-[13px] text-ink-muted transition-colors hover:text-ink-soft focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              aria-label={`Edytuj notatkę zadania: ${task.title}`}
            >
              <span className="line-clamp-2 min-w-0 flex-1">
                {task.description}
              </span>
              <Pencil
                className="mt-0.5 size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </button>
          ) : (
            <span className="mt-0.5 block truncate text-[13px] text-ink-muted">
              {task.description}
            </span>
          )
        ) : editable ? (
          <button
            type="button"
            onClick={openNoteEditor}
            className="mt-1 inline-flex items-center gap-1 rounded-sm text-[13px] text-ink-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-ink-soft focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            aria-label={`Dodaj notatkę do zadania: ${task.title}`}
          >
            <Pencil className="size-3" aria-hidden="true" />
            Dodaj notatkę
          </button>
        ) : null}

        <span className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={PRIORITY_VARIANT[task.priority]}>
            {PRIORITY_LABEL[task.priority]}
          </Badge>

          {category ? (
            <Badge variant="outline" className="gap-1.5">
              <span
                className={cn(
                  'size-2 shrink-0 rounded-full',
                  categoryDotClass(category.color),
                )}
                aria-hidden="true"
              />
              {category.name}
            </Badge>
          ) : null}

          {due ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs',
                due.overdue && 'font-medium text-danger',
                due.today && 'font-medium text-category-orange',
                !due.overdue && !due.today && 'text-ink-muted',
              )}
            >
              <CalendarClock className="size-3.5" aria-hidden="true" />
              {due.label}
              {due.overdue ? (
                <span className="sr-only"> (po terminie)</span>
              ) : null}
              {due.today ? <span className="sr-only"> (dzisiaj)</span> : null}
            </span>
          ) : null}
        </span>
      </div>

      {/* Kosz jest rodzeństwem przycisku edycji (nie zagnieżdżony), więc klik
          kosza nie wyzwala onEdit — bez potrzeby stopPropagation. Hit-area ≥ 44×44
          (WCAG 2.5.5): ikona 32×32 + ::after rozszerza klikalny obszar do 44px. */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Usuń zadanie: ${task.title}`}
        onClick={() => onDelete(task.id)}
        className="relative shrink-0 text-ink-muted after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] hover:text-danger"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

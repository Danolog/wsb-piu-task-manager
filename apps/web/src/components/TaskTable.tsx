import { useEffect, useRef, useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PriorityBadge } from '@/components/PriorityBadge';
import { cn } from '@/lib/utils';
import {
  DESCRIPTION_MAX,
  type Category,
  type Task,
} from '@/features/tasks/model';
import {
  categoryDotClass,
  formatDueShort,
} from '@/features/tasks/presentation';

export interface TaskTableProps {
  tasks: Task[];
  categories: Record<string, Category>;
  onToggle: (id: string) => void;
  /** Klik wiersza (poza checkboxem i koszem) → edycja zadania. */
  onOpen: (id: string) => void;
  /** Klik kosza → usunięcie zadania (z undo po stronie wołającego). */
  onDelete: (id: string) => void;
  /** Zapis notatki edytowanej inline w wierszu (description). Brak = notatka tylko do odczytu. */
  onUpdateNote?: (id: string, description: string) => void;
}

/**
 * Tabela zadań — widok „Wszystkie" na desktopie (D 20:110).
 * Semantyczny <table>: kolumny Zadanie / Termin / Priorytet / Kategoria,
 * checkbox po lewej, done = przekreślenie + przyciemnienie wiersza.
 * Notatka (description) jako druga linia pod tytułem w kolumnie „Zadanie":
 * widoczna gdy istnieje, edytowalna inline gdy przekazano `onUpdateNote`
 * (spójnie z TaskCard na mobile). Renderowana tylko ≥ md (klasy widoczności
 * po stronie wołającego: hidden md:block).
 */
export function TaskTable({
  tasks,
  categories,
  onToggle,
  onOpen,
  onDelete,
  onUpdateNote,
}: TaskTableProps) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-field)] border border-line">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line bg-surface-alt/50">
            <th
              scope="col"
              className="w-10 py-2.5 pl-4"
              aria-label="Ukończone"
            />
            <th
              scope="col"
              className="py-2.5 pr-4 text-[11px] font-medium tracking-wide text-ink-muted uppercase"
            >
              Zadanie
            </th>
            <th
              scope="col"
              className="py-2.5 pr-4 text-[11px] font-medium tracking-wide text-ink-muted uppercase"
            >
              Termin
            </th>
            <th
              scope="col"
              className="py-2.5 pr-4 text-[11px] font-medium tracking-wide text-ink-muted uppercase"
            >
              Priorytet
            </th>
            <th
              scope="col"
              className="py-2.5 pr-4 text-[11px] font-medium tracking-wide text-ink-muted uppercase"
            >
              Kategoria
            </th>
            <th scope="col" className="w-12 py-2.5 pr-2" aria-label="Akcje" />
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <TaskTableRow
              key={task.id}
              task={task}
              category={
                task.categoryId ? categories[task.categoryId] : undefined
              }
              onToggle={onToggle}
              onOpen={onOpen}
              onDelete={onDelete}
              {...(onUpdateNote ? { onUpdateNote } : {})}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TaskTableRowProps {
  task: Task;
  category: Category | undefined;
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateNote?: (id: string, description: string) => void;
}

/**
 * Pojedynczy wiersz tabeli. Wydzielony z TaskTable, bo trzyma własny stan
 * inline-edycji notatki (Textarea + draft) — hooki nie mogą żyć w callbacku .map.
 * Notatka i jej edycja zachowują się jak w TaskCard (stopPropagation, Esc/Ctrl+Enter,
 * pusty draft kasuje description), więc desktop i mobile są spójne.
 */
function TaskTableRow({
  task,
  category,
  onToggle,
  onOpen,
  onDelete,
  onUpdateNote,
}: TaskTableRowProps) {
  const done = task.status === 'done';
  const due = formatDueShort(task.dueDate, task.dueTime);

  const editable = onUpdateNote !== undefined;
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(task.description ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  function openNoteEditor() {
    setNoteDraft(task.description ?? '');
    setEditingNote(true);
  }

  function saveNote() {
    const trimmed = noteDraft.trim();
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
    <tr
      className={cn(
        'group cursor-pointer border-b border-line bg-surface transition-colors last:border-b-0 hover:bg-surface-alt/40',
        // Done sygnalizowane przekreśleniem + wyciszonym tekstem (poniżej),
        // bez opacity na wierszu — globalna przezroczystość zbijała kontrast
        // tekstu poniżej WCAG AA (axe color-contrast).
        done && 'bg-surface-alt/30',
      )}
      onClick={() => onOpen(task.id)}
    >
      <td
        className="py-3 pl-4 align-top"
        // Checkbox nie ma otwierać edycji wiersza.
        onClick={(event) => event.stopPropagation()}
      >
        <Checkbox
          checked={done}
          onCheckedChange={() => onToggle(task.id)}
          className="mt-0.5 size-5"
          aria-label={`${done ? 'Oznacz jako niewykonane' : 'Oznacz jako wykonane'}: ${task.title}`}
        />
      </td>
      <td className="py-3 pr-4 align-top">
        <span
          className={cn(
            'block text-[15px] text-ink',
            done && 'text-ink-muted line-through',
          )}
        >
          {task.title}
        </span>

        {/* Notatka (description) jako druga linia pod tytułem. Klik notatki/
            „Dodaj notatkę" otwiera inline-edycję i NIE otwiera pełnej edycji
            wiersza (stopPropagation), spójnie z TaskCard. */}
        {editingNote ? (
          <div
            className="mt-1.5 max-w-md"
            onClick={(event) => event.stopPropagation()}
          >
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
              onClick={(event) => {
                event.stopPropagation();
                openNoteEditor();
              }}
              className="mt-0.5 flex max-w-md items-start gap-1.5 text-left text-[13px] text-ink-muted transition-colors hover:text-ink-soft focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              aria-label={`Edytuj notatkę zadania: ${task.title}`}
            >
              <span className="line-clamp-2 min-w-0 flex-1">
                {task.description}
              </span>
              <Pencil
                className="mt-0.5 size-3 shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </button>
          ) : (
            <span className="mt-0.5 line-clamp-2 max-w-md text-[13px] text-ink-muted">
              {task.description}
            </span>
          )
        ) : editable ? (
          // „Dodaj notatkę" zawsze widoczne (nie tylko na hover) — spójnie z TaskCard.
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openNoteEditor();
            }}
            className="mt-1 inline-flex items-center gap-1 rounded-sm text-[13px] text-ink-muted underline decoration-dotted underline-offset-4 transition-colors hover:text-ink-soft focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            aria-label={`Dodaj notatkę do zadania: ${task.title}`}
          >
            <Pencil className="size-3" aria-hidden="true" />
            Dodaj notatkę
          </button>
        ) : null}
      </td>
      <td className="py-3 pr-4 align-top">
        {due ? (
          <span
            className={cn(
              'font-mono text-[13px] leading-6',
              due.overdue
                ? 'font-medium text-danger'
                : due.today
                  ? 'font-medium text-category-orange'
                  : 'text-ink-muted',
            )}
          >
            {due.label}
            {due.overdue ? (
              <span className="sr-only"> (po terminie)</span>
            ) : null}
          </span>
        ) : (
          <span className="leading-6 text-ink-muted" aria-hidden="true">
            —
          </span>
        )}
      </td>
      <td className="py-3 pr-4 align-top">
        {task.priority === 'low' ? (
          <span className="leading-6 text-ink-muted" aria-hidden="true">
            —
          </span>
        ) : (
          <PriorityBadge priority={task.priority} />
        )}
      </td>
      <td className="py-3 pr-4 align-top">
        {category ? (
          <span className="inline-flex items-center gap-1.5 text-[13px] leading-6 text-ink-soft">
            <span
              className={cn(
                'size-2 shrink-0 rounded-full',
                categoryDotClass(category.color),
              )}
              aria-hidden="true"
            />
            {category.name}
          </span>
        ) : (
          <span className="leading-6 text-ink-muted" aria-hidden="true">
            —
          </span>
        )}
      </td>
      <td
        className="py-3 pr-2 text-right align-top"
        // Kosz nie ma otwierać edycji wiersza (jak checkbox po lewej).
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Usuń zadanie: ${task.title}`}
          onClick={() => onDelete(task.id)}
          // Hit-area ≥ 44×44 (WCAG 2.5.5): ikona 32×32 + ::after rozszerza
          // klikalny obszar do 44px bez psucia layoutu wiersza.
          className="relative text-ink-muted after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] hover:text-danger"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </td>
    </tr>
  );
}

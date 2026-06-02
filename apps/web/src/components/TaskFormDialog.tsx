import { useId, useState } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PriorityControl } from '@/components/PriorityControl';
import { CategoryPicker } from '@/components/CategoryPicker';
import { DueDatePicker } from '@/components/DueDatePicker';
import { cn } from '@/lib/utils';
import {
  taskInputSchema,
  type TaskInput,
  type Task,
  type Category,
  type Status,
} from '@/features/tasks/model';

export interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  /** Zadanie do edycji; brak = tryb tworzenia. */
  task?: Task | undefined;
  onSubmit: (input: TaskInput) => void;
}

interface FormValues {
  title: string;
  description: string;
  priority: TaskInput['priority'];
  dueDate: string;
  categoryId: string;
}

function taskToValues(task: Task | undefined): FormValues {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    priority: task?.priority ?? 'medium',
    dueDate: task?.dueDate ?? '',
    categoryId: task?.categoryId ?? '',
  };
}

/**
 * Modal tworzenia/edycji zadania. Owns tylko Dialog + montaż formularza.
 * Wewnętrzny <TaskForm> jest montowany świeżo (key) dopiero gdy modal otwarty,
 * więc stan formularza i „więcej opcji" inicjalizują się z propsów przy montażu —
 * bez synchronizacji przez efekt (czystszy cykl życia, zero setState-in-effect).
 */
export function TaskFormDialog({
  open,
  onOpenChange,
  categories,
  task,
  onSubmit,
}: TaskFormDialogProps) {
  // Licznik wymusza remount formularza po „Zapisz i dodaj nowe" (czysty reset).
  const [formKey, setFormKey] = useState(0);
  const isEdit = task !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[11px] font-medium tracking-wide text-ink-soft uppercase">
            {isEdit ? 'Edytuj zadanie' : 'Nowe zadanie'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEdit
              ? 'Zmień szczegóły zadania i zapisz.'
              : 'Wypełnij pola, aby dodać nowe zadanie.'}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <TaskForm
            key={`${task?.id ?? 'new'}-${formKey}`}
            task={task}
            categories={categories}
            onSubmit={onSubmit}
            onClose={() => onOpenChange(false)}
            onSaveAndAddNew={() => setFormKey((k) => k + 1)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

interface TaskFormProps {
  task: Task | undefined;
  categories: Category[];
  onSubmit: (input: TaskInput) => void;
  onClose: () => void;
  onSaveAndAddNew: () => void;
}

function TaskForm({
  task,
  categories,
  onSubmit,
  onClose,
  onSaveAndAddNew,
}: TaskFormProps) {
  const isEdit = task !== undefined;
  const ids = useId();
  const titleFieldId = `${ids}-title`;
  const titleErrId = `${ids}-title-err`;
  const descId = `${ids}-desc`;
  const dueId = `${ids}-due`;
  const dueLabelId = `${ids}-due-label`;
  const priorityLabelId = `${ids}-priority-label`;
  const categoryLabelId = `${ids}-category-label`;

  // Inicjalizacja z propsów przy montażu — w edycji rozwijamy „więcej", jeśli są dane zaawansowane.
  const [showMore, setShowMore] = useState(
    () => isEdit && hasAdvancedData(task),
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    // resolver waliduje przez ten sam schemat co persystencja (DRY).
    // Cast: pod exactOptionalPropertyTypes wynik schematu ma pola opcjonalne jako
    // `string | undefined`, a FormValues trzyma konkretne stringi — strukturalnie zgodne,
    // zod uzupełnia/pomija pola, więc rzutowanie jest bezpieczne.
    resolver: zodResolver(taskInputSchema) as unknown as Resolver<FormValues>,
    defaultValues: taskToValues(task),
  });

  function submit(values: FormValues, keepOpen: boolean) {
    // W edycji zachowujemy bieżący status (done/todo); tworzenie startuje jako 'todo'.
    onSubmit(toInput(values, task?.status ?? 'todo'));
    if (keepOpen) {
      onSaveAndAddNew(); // remount → czysty formularz, focus wróci na tytuł (autoFocus).
    } else {
      onClose();
    }
  }

  return (
    <form
      onSubmit={handleSubmit((v) => submit(v, false))}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* Tytuł — zawsze widoczny */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={titleFieldId}>Tytuł</Label>
        <Input
          id={titleFieldId}
          autoFocus
          placeholder="Wpisz tytuł zadania..."
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? titleErrId : undefined}
          {...register('title')}
        />
        {errors.title ? (
          <p id={titleErrId} className="text-xs text-danger" role="alert">
            {errors.title.message}
          </p>
        ) : null}
      </div>

      {/* Termin — zawsze widoczny */}
      <div className="flex flex-col gap-1.5">
        <span id={dueLabelId} className="text-sm font-medium">
          Termin
        </span>
        <Controller
          control={control}
          name="dueDate"
          render={({ field }) => (
            <DueDatePicker
              id={dueId}
              aria-labelledby={dueLabelId}
              value={field.value || undefined}
              onChange={(v) => field.onChange(v ?? '')}
            />
          )}
        />
      </div>

      {/* Więcej opcji — progressive disclosure */}
      <button
        type="button"
        onClick={() => setShowMore((s) => !s)}
        aria-expanded={showMore}
        className="flex items-center gap-1 self-start text-[13px] font-medium text-ink-soft hover:text-ink focus-visible:underline focus-visible:outline-none"
      >
        <ChevronDown
          className={cn(
            'size-4 transition-transform',
            showMore && 'rotate-180',
          )}
          aria-hidden="true"
        />
        {showMore ? 'Mniej opcji' : 'Więcej opcji'}
      </button>

      {showMore ? (
        <div className="flex flex-col gap-5">
          {/* Priorytet */}
          <div className="flex flex-col gap-1.5">
            <span id={priorityLabelId} className="text-sm font-medium">
              Priorytet
            </span>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <PriorityControl
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-labelledby={priorityLabelId}
                />
              )}
            />
          </div>

          {/* Kategoria */}
          <div className="flex flex-col gap-1.5">
            <span id={categoryLabelId} className="text-sm font-medium">
              Kategoria
            </span>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <CategoryPicker
                  categories={categories}
                  value={field.value || undefined}
                  onChange={(v) => field.onChange(v ?? '')}
                  aria-labelledby={categoryLabelId}
                />
              )}
            />
          </div>

          {/* Opis */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={descId}>Notatka</Label>
            <Textarea
              id={descId}
              placeholder="Dodaj szczegóły, linki..."
              aria-invalid={errors.description ? true : undefined}
              {...register('description')}
            />
            {errors.description ? (
              <p className="text-xs text-danger" role="alert">
                {errors.description.message}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <DialogFooter className="gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Anuluj
        </Button>
        {!isEdit ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit((v) => submit(v, true))}
          >
            Zapisz i dodaj nowe
          </Button>
        ) : null}
        <Button type="submit">
          {isEdit ? 'Zapisz zmiany' : 'Dodaj zadanie'}
        </Button>
      </DialogFooter>
    </form>
  );
}

/** Czy zadanie ma dane spoza pól podstawowych — jeśli tak, otwórz „więcej" od razu w edycji. */
function hasAdvancedData(task: Task | undefined): boolean {
  if (!task) return false;
  return (
    task.priority !== 'medium' ||
    Boolean(task.categoryId) ||
    Boolean(task.description)
  );
}

/** Konwersja wartości formularza na TaskInput (puste stringi → pominięte pola). */
function toInput(values: FormValues, status: Status): TaskInput {
  return {
    title: values.title,
    priority: values.priority,
    status,
    ...(values.description.trim()
      ? { description: values.description.trim() }
      : {}),
    ...(values.dueDate ? { dueDate: values.dueDate } : {}),
    ...(values.categoryId ? { categoryId: values.categoryId } : {}),
  };
}

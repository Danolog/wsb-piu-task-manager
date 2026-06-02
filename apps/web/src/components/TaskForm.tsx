import { useId } from 'react';
import { useForm, useWatch, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PriorityControl } from '@/components/PriorityControl';
import { CategoryPicker } from '@/components/CategoryPicker';
import { DueDatePicker } from '@/components/DueDatePicker';
import {
  taskInputSchema,
  type TaskInput,
  type Task,
  type Category,
  type Status,
} from '@/features/tasks/model';

interface TaskFormValues {
  title: string;
  description: string;
  priority: TaskInput['priority'];
  dueDate: string;
  dueTime: string;
  categoryId: string;
}

/** Wartości formularza z zadania (edycja) lub pusty szkielet (tworzenie). */
function taskToValues(task: Task | undefined): TaskFormValues {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    priority: task?.priority ?? 'medium',
    dueDate: task?.dueDate ?? '',
    dueTime: task?.dueTime ?? '',
    categoryId: task?.categoryId ?? '',
  };
}

/**
 * Konwersja wartości formularza na TaskInput.
 * Puste pola opcjonalne → pominięte (undefined), nie pusty string. To domyka
 * dług z Build 1: gdy użytkownik wyczyści Termin/Godzinę, pole NIE trafia do
 * changes jako pusty string — czyszczenie usuwa dueDate/dueTime z zadania
 * (reducer task/update przez stripUndefined nie nadpisze, więc kasowanie robimy
 * po stronie wołającego — patrz onSubmit stron, które liczą pełen zestaw pól).
 */
function valuesToInput(values: TaskFormValues, status: Status): TaskInput {
  // Resolver zod transformuje puste pola opcjonalne na undefined — chronimy się ?? ''.
  const dueDate = (values.dueDate ?? '').trim();
  const dueTime = (values.dueTime ?? '').trim();
  const description = (values.description ?? '').trim();
  return {
    title: values.title,
    priority: values.priority,
    status,
    ...(description ? { description } : {}),
    ...(dueDate ? { dueDate } : {}),
    // Godzina tylko gdy jest też data (walidacja zod tego pilnuje; tu pas bezpieczeństwa).
    ...(dueDate && dueTime ? { dueTime } : {}),
    ...(values.categoryId ? { categoryId: values.categoryId } : {}),
  };
}

export interface TaskFormProps {
  /** Zadanie do edycji; brak = tryb tworzenia. */
  task?: Task | undefined;
  categories: Category[];
  /** Wywoływane z pełnym, walidnym zestawem pól (TaskInput). */
  onSubmit: (input: TaskInput) => void;
  /** Renderowane w stopce obok CTA (np. „Anuluj", „Usuń zadanie"). */
  footerSlot?: React.ReactNode;
  /** Etykieta przycisku zapisu; domyślnie zależna od trybu. */
  submitLabel?: string;
}

/**
 * Reużywalny formularz tworzenia/edycji zadania (RHF + zod, bez Dialogu).
 * Wszystkie pola widoczne (bez „Więcej opcji") — montowany na pełnych stronach
 * /nowe i /zadanie/:id. Walidacja przez ten sam schemat co persystencja (DRY).
 */
export function TaskForm({
  task,
  categories,
  onSubmit,
  footerSlot,
  submitLabel,
}: TaskFormProps) {
  const isEdit = task !== undefined;
  const ids = useId();
  const titleFieldId = `${ids}-title`;
  const titleErrId = `${ids}-title-err`;
  const descId = `${ids}-desc`;
  const dueId = `${ids}-due`;
  const dueLabelId = `${ids}-due-label`;
  const timeId = `${ids}-time`;
  const timeErrId = `${ids}-time-err`;
  const priorityLabelId = `${ids}-priority-label`;
  const categoryLabelId = `${ids}-category-label`;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(
      taskInputSchema,
    ) as unknown as Resolver<TaskFormValues>,
    defaultValues: taskToValues(task),
  });

  // Godzina dozwolona tylko z datą — bez daty pole jest wyłączone (decyzja 11.6).
  const dueDateValue = useWatch({ control, name: 'dueDate' });
  const hasDate = Boolean(dueDateValue);

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit(valuesToInput(values, task?.status ?? 'todo')),
      )}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* Tytuł */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={titleFieldId}
          className="text-[11px] font-medium tracking-wide text-ink-soft uppercase"
        >
          Tytuł zadania
        </Label>
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

      {/* Termin + Godzina (dwie kolumny od sm) */}
      <div className="flex flex-col gap-5 sm:flex-row sm:gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <span
            id={dueLabelId}
            className="text-[11px] font-medium tracking-wide text-ink-soft uppercase"
          >
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

        <div className="flex flex-1 flex-col gap-1.5">
          <Label
            htmlFor={timeId}
            className="text-[11px] font-medium tracking-wide text-ink-soft uppercase"
          >
            Godzina
          </Label>
          <Input
            id={timeId}
            type="time"
            disabled={!hasDate}
            placeholder="Wybierz godzinę"
            aria-invalid={errors.dueTime ? true : undefined}
            aria-describedby={errors.dueTime ? timeErrId : undefined}
            {...register('dueTime')}
          />
          {!hasDate ? (
            <p className="text-xs text-ink-muted">Najpierw wybierz termin.</p>
          ) : null}
          {errors.dueTime ? (
            <p id={timeErrId} className="text-xs text-danger" role="alert">
              {errors.dueTime.message}
            </p>
          ) : null}
        </div>
      </div>

      {/* Priorytet */}
      <div className="flex flex-col gap-1.5">
        <span
          id={priorityLabelId}
          className="text-[11px] font-medium tracking-wide text-ink-soft uppercase"
        >
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
      {categories.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span
            id={categoryLabelId}
            className="text-[11px] font-medium tracking-wide text-ink-soft uppercase"
          >
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
      ) : null}

      {/* Notatka */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={descId}
          className="text-[11px] font-medium tracking-wide text-ink-soft uppercase"
        >
          Notatka
        </Label>
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

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit">
          {submitLabel ?? (isEdit ? 'Zapisz zmiany' : 'Dodaj zadanie')}
        </Button>
        {footerSlot}
      </div>
    </form>
  );
}

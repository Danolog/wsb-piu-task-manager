import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskFormDialog } from './TaskFormDialog';
import type { Category, Task } from '@/features/tasks/model';

const categories: Category[] = [
  { id: 'cat-studia', name: 'Studia', color: 'category-green' },
  { id: 'cat-praca', name: 'Praca', color: 'category-blue' },
];

function renderDialog(
  props: Partial<Parameters<typeof TaskFormDialog>[0]> = {},
) {
  const onSubmit = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <TaskFormDialog
      open
      onOpenChange={onOpenChange}
      categories={categories}
      onSubmit={onSubmit}
      {...props}
    />,
  );
  return { onSubmit, onOpenChange };
}

describe('TaskFormDialog', () => {
  it('tryb tworzenia: pokazuje nagłówek „Nowe zadanie" i CTA „Dodaj zadanie"', () => {
    renderDialog();
    expect(screen.getByText('Nowe zadanie')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Dodaj zadanie' }),
    ).toBeInTheDocument();
  });

  it('submit pustego formularza → błąd walidacji po polsku, brak dispatch', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Dodaj zadanie' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /wpisać nazwę zadania/i,
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('poprawny submit → onSubmit z danymi zadania, modal zamknięty', async () => {
    const user = userEvent.setup();
    const { onSubmit, onOpenChange } = renderDialog();

    await user.type(
      screen.getByPlaceholderText('Wpisz tytuł zadania...'),
      'Kupić mleko',
    );
    await user.click(screen.getByRole('button', { name: 'Dodaj zadanie' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Kupić mleko', status: 'todo' }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('tryb edycji: prefill tytułu + CTA „Zapisz zmiany", bez „Zapisz i dodaj nowe"', () => {
    const task: Task = {
      id: 't1',
      title: 'Istniejące zadanie',
      status: 'todo',
      priority: 'high',
      categoryId: 'cat-praca',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    };
    renderDialog({ task });

    expect(screen.getByDisplayValue('Istniejące zadanie')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Zapisz zmiany' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Zapisz i dodaj nowe' }),
    ).not.toBeInTheDocument();
  });

  // Weryfikacja realnego działania date pickera (calendar był niezweryfikowany).
  it('date picker: otwiera kalendarz i wybiera dzień, ustawiając termin', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    await user.type(
      screen.getByPlaceholderText('Wpisz tytuł zadania...'),
      'Z terminem',
    );

    // Otwórz popover kalendarza (wyzwalacz pola Termin, placeholder „Dzisiaj").
    await user.click(screen.getByRole('button', { name: /Termin/ }));

    // react-day-picker renderuje grid; wybierz pierwszy dostępny dzień.
    const grid = await screen.findByRole('grid');
    const dayButtons = within(grid).getAllByRole('button');
    const targetDay = dayButtons.find((b) => /^\d+$/.test(b.textContent ?? ''));
    expect(targetDay).toBeDefined();
    await user.click(targetDay!);

    await user.click(screen.getByRole('button', { name: 'Dodaj zadanie' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const arg = onSubmit.mock.calls[0]![0];
    expect(arg.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

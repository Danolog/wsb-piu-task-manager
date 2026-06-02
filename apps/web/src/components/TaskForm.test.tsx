import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from './TaskForm';
import type { Category, Task } from '@/features/tasks/model';

const categories: Category[] = [
  { id: 'cat-studia', name: 'Studia', color: 'category-green' },
  { id: 'cat-praca', name: 'Praca', color: 'category-blue' },
];

function renderForm(props: Partial<Parameters<typeof TaskForm>[0]> = {}) {
  const onSubmit = vi.fn();
  render(<TaskForm categories={categories} onSubmit={onSubmit} {...props} />);
  return { onSubmit };
}

describe('TaskForm', () => {
  it('tryb tworzenia: wszystkie pola widoczne, CTA „Dodaj zadanie"', () => {
    renderForm();
    expect(
      screen.getByPlaceholderText('Wpisz tytuł zadania...'),
    ).toBeInTheDocument();
    // Pola, które w modalu były pod „Więcej opcji", tu są widoczne od razu.
    expect(screen.getByText('Priorytet')).toBeInTheDocument();
    expect(screen.getByText('Kategoria')).toBeInTheDocument();
    expect(screen.getByText('Notatka')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Dodaj zadanie' }),
    ).toBeInTheDocument();
  });

  it('submit pustego formularza → błąd walidacji po polsku, brak onSubmit', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Dodaj zadanie' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /wpisać nazwę zadania/i,
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('poprawny submit → onSubmit z danymi zadania (status todo)', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(
      screen.getByPlaceholderText('Wpisz tytuł zadania...'),
      'Kupić mleko',
    );
    await user.click(screen.getByRole('button', { name: 'Dodaj zadanie' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Kupić mleko', status: 'todo' }),
    );
  });

  it('tryb edycji: prefill tytułu + CTA „Zapisz zmiany"', () => {
    const task: Task = {
      id: 't1',
      title: 'Istniejące zadanie',
      status: 'todo',
      priority: 'high',
      categoryId: 'cat-praca',
      dueDate: '2026-06-11',
      dueTime: '18:00',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    };
    renderForm({ task, submitLabel: 'Zapisz zmiany' });

    expect(screen.getByDisplayValue('Istniejące zadanie')).toBeInTheDocument();
    // Godzina prefillowana w natywnym input[type=time].
    expect(screen.getByDisplayValue('18:00')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Zapisz zmiany' }),
    ).toBeInTheDocument();
  });

  it('pole Godzina jest wyłączone bez wybranego terminu', () => {
    renderForm();
    const time = screen.getByLabelText('Godzina');
    expect(time).toBeDisabled();
  });

  it('Godzina aktywuje się po wybraniu daty i trafia do onSubmit', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(
      screen.getByPlaceholderText('Wpisz tytuł zadania...'),
      'Z terminem',
    );

    // Wybór daty przez kalendarz (popover pola Termin).
    await user.click(screen.getByRole('button', { name: /Termin/ }));
    const grid = await screen.findByRole('grid');
    const dayButtons = within(grid).getAllByRole('button');
    const targetDay = dayButtons.find((b) => /^\d+$/.test(b.textContent ?? ''));
    expect(targetDay).toBeDefined();
    await user.click(targetDay!);

    // Po dacie pole Godzina jest aktywne.
    const time = screen.getByLabelText('Godzina');
    await waitFor(() => expect(time).toBeEnabled());
    await user.type(time, '09:30');

    await user.click(screen.getByRole('button', { name: 'Dodaj zadanie' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const arg = onSubmit.mock.calls[0]![0];
    expect(arg.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(arg.dueTime).toBe('09:30');
  });

  it('footerSlot renderuje dodatkowe akcje (np. „Anuluj")', () => {
    renderForm({ footerSlot: <button type="button">Anuluj</button> });
    expect(screen.getByRole('button', { name: 'Anuluj' })).toBeInTheDocument();
  });

  it('pola edytowalne mają białe tło (token bg-field, wierność Figmie D 133-2)', () => {
    renderForm();
    // Tytuł i Notatka to inputy edytowalne — w Figmie aktywne pole jest białe (--field).
    expect(screen.getByPlaceholderText('Wpisz tytuł zadania...')).toHaveClass(
      'bg-field',
    );
    expect(
      screen.getByPlaceholderText('Dodaj szczegóły, linki...'),
    ).toHaveClass('bg-field');
  });
});

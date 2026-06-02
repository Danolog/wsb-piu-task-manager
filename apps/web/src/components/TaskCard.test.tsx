import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from './TaskCard';
import type { Task, Category } from '@/features/tasks/model';

const category: Category = {
  id: 'cat-studia',
  name: 'Studia',
  color: 'category-green',
};

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: 'Napisać raport',
    status: 'todo',
    priority: 'high',
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('TaskCard', () => {
  it('renderuje zadanie todo: tytuł, priorytet, kategoria; checkbox niezaznaczony', () => {
    render(
      <TaskCard
        task={makeTask()}
        category={category}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Napisać raport')).toBeInTheDocument();
    expect(screen.getByText('Wysoki')).toBeInTheDocument();
    expect(screen.getByText('Studia')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('stan done: checkbox zaznaczony + tytuł przekreślony (nie tylko kolor)', () => {
    render(
      <TaskCard
        task={makeTask({ status: 'done' })}
        category={category}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByText('Napisać raport')).toHaveClass('line-through');
  });

  it('klik checkboxa wywołuje onToggle z id zadania', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TaskCard
        task={makeTask()}
        category={category}
        onToggle={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('t1');
  });

  it('klik treści karty wywołuje onEdit z id zadania', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <TaskCard
        task={makeTask()}
        category={category}
        onToggle={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Edytuj zadanie/ }));
    expect(onEdit).toHaveBeenCalledWith('t1');
  });

  it('klik kosza wywołuje onDelete z id zadania', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TaskCard
        task={makeTask()}
        category={category}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Usuń zadanie/ }));
    expect(onDelete).toHaveBeenCalledWith('t1');
  });

  it('pokazuje notatkę (description) pod tytułem (POPRAWKA 5)', () => {
    render(
      <TaskCard
        task={makeTask({ description: 'Rozdziały 4-6' })}
        category={category}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Rozdziały 4-6')).toBeInTheDocument();
  });

  it('inline edycja notatki: zapis wywołuje onUpdateNote z nowym description (POPRAWKA 5)', async () => {
    const user = userEvent.setup();
    const onUpdateNote = vi.fn();
    render(
      <TaskCard
        task={makeTask()}
        category={category}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onUpdateNote={onUpdateNote}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /Dodaj notatkę do zadania/ }),
    );
    await user.type(
      screen.getByRole('textbox', { name: /Notatka zadania/ }),
      'Nowa notatka',
    );
    await user.click(screen.getByRole('button', { name: 'Zapisz' }));

    expect(onUpdateNote).toHaveBeenCalledWith('t1', 'Nowa notatka');
  });

  it('klik notatki do edycji NIE wywołuje onEdit (stopPropagation — pełna edycja osobno)', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <TaskCard
        task={makeTask({ description: 'Istniejąca notatka' })}
        category={category}
        onToggle={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
        onUpdateNote={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /Edytuj notatkę zadania/ }),
    );
    // Otworzyła się inline-edycja notatki, nie pełna edycja zadania.
    expect(onEdit).not.toHaveBeenCalled();
    expect(
      screen.getByRole('textbox', { name: /Notatka zadania/ }),
    ).toBeInTheDocument();
  });
});

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
});

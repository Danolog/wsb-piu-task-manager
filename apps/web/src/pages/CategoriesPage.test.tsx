import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CategoriesPage } from './CategoriesPage';
import { AppProvider } from '@/app/AppProvider';
import { STORAGE_KEY, seedState } from '@/features/tasks/storage';
import type { AppState, Task } from '@/features/tasks/model';

function seedWith(tasks: Task[] = []): void {
  const state: AppState = {
    ...seedState(),
    user: { name: 'Kasia' },
    tasks: Object.fromEntries(tasks.map((t) => [t.id, t])),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderPage() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={['/kategorie']}>
        <CategoriesPage />
      </MemoryRouter>
    </AppProvider>,
  );
}

describe('CategoriesPage (P-H)', () => {
  beforeEach(() => localStorage.clear());

  it('listuje 6 seedowanych kategorii z licznikami', () => {
    seedWith([
      {
        id: 't1',
        title: 'Zadanie',
        status: 'todo',
        priority: 'medium',
        categoryId: 'cat-studia',
        createdAt: '2026-06-01T09:00:00.000Z',
        updatedAt: '2026-06-01T09:00:00.000Z',
      },
    ]);
    renderPage();
    expect(screen.getByText('Studia')).toBeInTheDocument();
    expect(screen.getByText('Finanse')).toBeInTheDocument();
    // Studia ma 1 zadanie.
    expect(screen.getByText('1 zadanie')).toBeInTheDocument();
  });

  it('dodaje nową kategorię przez dialog', async () => {
    const user = userEvent.setup();
    seedWith();
    renderPage();

    await user.click(screen.getByRole('button', { name: /Nowa kategoria/ }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Nazwa'), 'Projekty');
    await user.click(
      within(dialog).getByRole('button', { name: 'Dodaj kategorię' }),
    );

    await waitFor(() =>
      expect(screen.getByText('Projekty')).toBeInTheDocument(),
    );
  });

  it('usuwa kategorię z potwierdzeniem', async () => {
    const user = userEvent.setup();
    seedWith();
    renderPage();

    await user.click(
      screen.getByRole('button', { name: 'Usuń kategorię Finanse' }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Usuń kategorię' }),
    );

    await waitFor(() =>
      expect(screen.queryByText('Finanse')).not.toBeInTheDocument(),
    );
  });
});

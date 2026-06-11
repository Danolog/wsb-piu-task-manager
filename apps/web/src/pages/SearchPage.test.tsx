import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { SearchPage } from './SearchPage';
import { AppProvider } from '@/app/AppProvider';
import { STORAGE_KEY, seedState } from '@/features/tasks/storage';
import type { AppState, Task } from '@/features/tasks/model';

function task(partial: Partial<Task> & Pick<Task, 'id' | 'title'>): Task {
  return {
    status: 'todo',
    priority: 'medium',
    createdAt: '2026-06-01T09:00:00.000Z',
    updatedAt: '2026-06-01T09:00:00.000Z',
    ...partial,
  };
}

function seedWith(tasks: Task[]): void {
  const state: AppState = {
    ...seedState(),
    user: { name: 'Kasia' },
    tasks: Object.fromEntries(tasks.map((t) => [t.id, t])),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderSearch() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={['/szukaj']}>
        <SearchPage />
      </MemoryRouter>
    </AppProvider>,
  );
}

describe('SearchPage (P-G)', () => {
  beforeEach(() => localStorage.clear());

  it('pusta fraza → podpowiedź zamiast wyników', () => {
    seedWith([task({ id: 'a', title: 'Analiza' })]);
    renderSearch();
    expect(screen.getByText(/Wpisz frazę, aby przeszukać/)).toBeInTheDocument();
  });

  it('fraza z wynikami → nagłówek „WYNIKI · N" + lista', async () => {
    const user = userEvent.setup();
    seedWith([
      task({ id: 'a', title: 'Analiza danych' }),
      task({ id: 'b', title: 'Zakupy' }),
    ]);
    renderSearch();

    await user.type(
      screen.getByRole('searchbox', { name: 'Szukaj zadań' }),
      'Analiza',
    );

    await waitFor(() =>
      expect(screen.getByText(/Wyniki · 1/i)).toBeInTheDocument(),
    );
    expect(screen.getByText('Analiza danych')).toBeInTheDocument();
    expect(screen.queryByText('Zakupy')).not.toBeInTheDocument();
  });

  it('fraza bez trafień → stan pusty', async () => {
    const user = userEvent.setup();
    seedWith([task({ id: 'a', title: 'Analiza' })]);
    renderSearch();

    await user.type(
      screen.getByRole('searchbox', { name: 'Szukaj zadań' }),
      'xyz123',
    );
    await waitFor(() =>
      expect(screen.getByText('Brak wyników')).toBeInTheDocument(),
    );
  });
});

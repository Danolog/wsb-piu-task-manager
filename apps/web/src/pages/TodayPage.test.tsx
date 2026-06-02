import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TodayPage } from './TodayPage';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/app/AppProvider';
import { STORAGE_KEY, seedState } from '@/features/tasks/storage';
import type { AppState, Task } from '@/features/tasks/model';

/** Dzisiejsza data YYYY-MM-DD (lokalnie) — do seedowania zadań „na dziś". */
function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear().toString().padStart(4, '0');
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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
  const base = seedState();
  const state: AppState = {
    ...base,
    user: { name: 'Kasia' },
    tasks: Object.fromEntries(tasks.map((t) => [t.id, t])),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderToday() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={['/dzis']}>
        <Routes>
          <Route path="/dzis" element={<TodayPage />} />
          <Route path="/nowe" element={<h1>Formularz</h1>} />
        </Routes>
        <Toaster />
      </MemoryRouter>
    </AppProvider>,
  );
}

describe('TodayPage (P-D)', () => {
  beforeEach(() => localStorage.clear());

  it('liczy postęp dnia: X z Y zrobione + procent', () => {
    const t = todayISO();
    seedWith([
      task({
        id: 'a',
        title: 'Zrobione dziś',
        dueDate: t,
        status: 'done',
        completedAt: new Date().toISOString(),
      }),
      task({ id: 'b', title: 'Niezrobione dziś', dueDate: t }),
    ]);
    renderToday();

    // 1 z 2 = 50%.
    expect(
      screen.getByRole('progressbar', { name: /1 z 2/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('pusty stan „Czysto na dziś" gdy brak zadań na dziś', () => {
    seedWith([]);
    renderToday();
    expect(screen.getByText('Czysto na dziś')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Dodaj pierwsze zadanie/ }),
    ).toBeInTheDocument();
  });

  it('odhaczenie zadania pokazuje toast „Zadanie ukończone · Cofnij"', async () => {
    const user = userEvent.setup();
    const t = todayISO();
    seedWith([task({ id: 'a', title: 'Zadanie dnia', dueDate: t })]);
    renderToday();

    await user.click(screen.getByRole('checkbox'));
    expect(await screen.findByText('Zadanie ukończone')).toBeInTheDocument();

    // Cofnij wraca status do todo (checkbox odznaczony).
    await user.click(screen.getByRole('button', { name: 'Cofnij' }));
    await waitFor(() => expect(screen.getByRole('checkbox')).not.toBeChecked());
  });
});

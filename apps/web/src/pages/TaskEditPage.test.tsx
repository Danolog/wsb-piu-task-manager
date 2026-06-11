import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TaskEditPage } from './TaskEditPage';
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
  const base = seedState();
  const state: AppState = {
    ...base,
    user: { name: 'Kasia' },
    tasks: Object.fromEntries(tasks.map((t) => [t.id, t])),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderEdit(id: string) {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[`/zadanie/${id}`]}>
        <Routes>
          <Route path="/zadanie/:id" element={<TaskEditPage />} />
          <Route path="/wszystkie" element={<h1>Lista</h1>} />
          <Route path="*" element={<h1>Nie znaleziono</h1>} />
        </Routes>
      </MemoryRouter>
    </AppProvider>,
  );
}

describe('TaskEditPage (P-F)', () => {
  beforeEach(() => localStorage.clear());

  it('prefill: tytuł i godzina z zadania', () => {
    seedWith([
      task({
        id: 't1',
        title: 'Sprawdzian — analiza mat.',
        dueDate: '2026-06-11',
        dueTime: '18:00',
        priority: 'urgent',
      }),
    ]);
    renderEdit('t1');

    expect(
      screen.getAllByDisplayValue('Sprawdzian — analiza mat.').length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByDisplayValue('18:00').length).toBeGreaterThan(0);
  });

  it('zapis zmian → task/saveEdit, powrót na /wszystkie', async () => {
    const user = userEvent.setup();
    seedWith([task({ id: 't1', title: 'Stary tytuł' })]);
    renderEdit('t1');

    // Na desktopie i mobile montują się dwie kopie formularza (md:hidden / hidden md:…);
    // bierzemy pierwszy widoczny input tytułu.
    const titleInput = screen.getAllByDisplayValue('Stary tytuł')[0]!;
    await user.clear(titleInput);
    await user.type(titleInput, 'Zmieniony tytuł');
    await user.click(
      screen.getAllByRole('button', { name: 'Zapisz zmiany' })[0]!,
    );

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Lista' }),
      ).toBeInTheDocument(),
    );
  });

  it('usuwanie z potwierdzeniem: „Usuń zadanie" → modal → potwierdzenie', async () => {
    const user = userEvent.setup();
    seedWith([task({ id: 't1', title: 'Do usunięcia' })]);
    renderEdit('t1');

    await user.click(
      screen.getAllByRole('button', { name: 'Usuń zadanie' })[0]!,
    );
    // Modal potwierdzenia.
    expect(
      await screen.findByRole('heading', { name: 'Usunąć zadanie?' }),
    ).toBeInTheDocument();

    // Potwierdzenie w stopce dialogu.
    const dialog = screen.getByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Usuń zadanie' }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Lista' }),
      ).toBeInTheDocument(),
    );
  });

  it('nieistniejące id → 404 (NotFound)', () => {
    seedWith([task({ id: 't1', title: 'Istnieje' })]);
    renderEdit('brak-id');
    expect(
      screen.getByRole('heading', { name: 'Nie znaleziono' }),
    ).toBeInTheDocument();
  });
});

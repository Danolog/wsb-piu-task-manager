import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SettingsPage } from './SettingsPage';
import { AppProvider } from '@/app/AppProvider';
import { STORAGE_KEY, seedState } from '@/features/tasks/storage';
import type { AppState, Task } from '@/features/tasks/model';

function seedWith(tasks: Task[] = [], name = 'Kasia'): void {
  const state: AppState = {
    ...seedState(),
    user: { name },
    ui: { theme: 'light' },
    tasks: Object.fromEntries(tasks.map((t) => [t.id, t])),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function readState(): AppState {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)!) as AppState;
}

function renderSettings() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={['/ustawienia']}>
        <Routes>
          <Route path="/ustawienia" element={<SettingsPage />} />
          <Route path="/kategorie" element={<h1>Kategorie</h1>} />
        </Routes>
      </MemoryRouter>
    </AppProvider>,
  );
}

describe('SettingsPage / Ja (P-H)', () => {
  beforeEach(() => localStorage.clear());

  it('zmiana imienia zapisuje się w stanie', async () => {
    const user = userEvent.setup();
    seedWith([], 'Kasia');
    renderSettings();

    // Otwórz edycję imienia (przycisk pokazuje bieżące imię).
    await user.click(screen.getAllByRole('button', { name: /Kasia/ })[0]!);
    const dialog = await screen.findByRole('dialog');
    const input = within(dialog).getByLabelText('Imię');
    await user.clear(input);
    await user.type(input, 'Tomek');
    await user.click(within(dialog).getByRole('button', { name: 'Zapisz' }));

    await waitFor(() => expect(readState().user.name).toBe('Tomek'));
  });

  it('reset danych czyści zadania (z potwierdzeniem), zachowuje imię', async () => {
    const user = userEvent.setup();
    seedWith(
      [
        {
          id: 't1',
          title: 'Zadanie',
          status: 'todo',
          priority: 'medium',
          createdAt: '2026-06-01T09:00:00.000Z',
          updatedAt: '2026-06-01T09:00:00.000Z',
        },
      ],
      'Kasia',
    );
    renderSettings();

    await user.click(screen.getByRole('button', { name: 'Resetuj' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Resetuj dane' }),
    );

    await waitFor(() => expect(Object.keys(readState().tasks)).toHaveLength(0));
    expect(readState().user.name).toBe('Kasia');
  });

  it('tryb ciemny przełącza motyw na dark', async () => {
    const user = userEvent.setup();
    seedWith();
    renderSettings();

    await user.click(screen.getByRole('switch', { name: 'Tryb ciemny' }));
    await waitFor(() => expect(readState().ui.theme).toBe('dark'));
  });
});

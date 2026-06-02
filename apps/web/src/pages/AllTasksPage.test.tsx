import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AllTasksPage } from './AllTasksPage';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/app/AppProvider';
import { STORAGE_KEY, seedState } from '@/features/tasks/storage';
import type { AppState, Task } from '@/features/tasks/model';
import type { DatePreset as Preset } from '@/features/tasks/store';

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

function renderAll(preset: Preset, route = '/wszystkie') {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/wszystkie" element={<AllTasksPage preset={preset} />} />
          <Route path="/zadanie/:id" element={<h1>Edycja</h1>} />
        </Routes>
        <Toaster />
      </MemoryRouter>
    </AppProvider>,
  );
}

describe('AllTasksPage / TaskTable (P-E)', () => {
  beforeEach(() => localStorage.clear());

  it('desktop tabela ma kolumny Zadanie/Termin/Priorytet/Kategoria', () => {
    seedWith([task({ id: 'a', title: 'Zadanie A', categoryId: 'cat-praca' })]);
    renderAll('all');

    const table = screen.getByRole('table');
    expect(
      within(table).getByRole('columnheader', { name: 'Zadanie' }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole('columnheader', { name: 'Termin' }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole('columnheader', { name: 'Priorytet' }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole('columnheader', { name: 'Kategoria' }),
    ).toBeInTheDocument();
    expect(within(table).getByText('Zadanie A')).toBeInTheDocument();
  });

  it('preset „done" pokazuje tylko ukończone', () => {
    seedWith([
      task({
        id: 'a',
        title: 'Zrobione',
        status: 'done',
        completedAt: '2026-06-01T10:00:00.000Z',
      }),
      task({ id: 'b', title: 'W toku' }),
    ]);
    renderAll('done');

    const table = screen.getByRole('table');
    expect(within(table).getByText('Zrobione')).toBeInTheDocument();
    expect(within(table).queryByText('W toku')).not.toBeInTheDocument();
  });

  it('preset „week" pokazuje zadania z terminem w tym tygodniu', () => {
    const t = todayISO();
    seedWith([
      task({ id: 'a', title: 'W tym tygodniu', dueDate: t }),
      task({ id: 'b', title: 'Bez terminu' }),
    ]);
    renderAll('week');

    const table = screen.getByRole('table');
    expect(within(table).getByText('W tym tygodniu')).toBeInTheDocument();
    expect(within(table).queryByText('Bez terminu')).not.toBeInTheDocument();
  });

  it('filtr kategorii z ?kat= pokazuje chip i zawęża listę', async () => {
    const user = userEvent.setup();
    seedWith([
      task({ id: 'a', title: 'Zadanie prywatne', categoryId: 'cat-prywatne' }),
      task({ id: 'b', title: 'Zadanie pracowe', categoryId: 'cat-praca' }),
    ]);
    renderAll('all', '/wszystkie?kat=prywatne');

    const table = screen.getByRole('table');
    expect(within(table).getByText('Zadanie prywatne')).toBeInTheDocument();
    expect(
      within(table).queryByText('Zadanie pracowe'),
    ).not.toBeInTheDocument();

    // Chip filtra zdejmowalny → po kliknięciu wraca pełna lista.
    await user.click(
      screen.getByRole('button', { name: /Usuń filtr kategorii/ }),
    );
    expect(
      within(screen.getByRole('table')).getByText('Zadanie pracowe'),
    ).toBeInTheDocument();
  });
});

describe('AllTasksPage — filtry (P-G)', () => {
  beforeEach(() => localStorage.clear());

  it('Popover filtra zawęża po priorytecie i pokazuje liczbę w „Pokaż N"', async () => {
    const user = userEvent.setup();
    seedWith([
      task({ id: 'a', title: 'Pilne zadanie', priority: 'urgent' }),
      task({ id: 'b', title: 'Zwykłe zadanie', priority: 'medium' }),
    ]);
    renderAll('all');

    // Otwórz popover (desktopowy przycisk „Filtruj").
    await user.click(screen.getAllByRole('button', { name: /Filtruj/ })[0]!);
    // Zaznacz priorytet „pilne".
    await user.click(screen.getByRole('checkbox', { name: 'pilne' }));

    // Licznik w CTA odzwierciedla zawężenie do 1.
    expect(
      screen.getByRole('button', { name: /Pokaż 1 zadanie/ }),
    ).toBeInTheDocument();
  });

  it('„Wyczyść" resetuje filtry', async () => {
    const user = userEvent.setup();
    seedWith([
      task({ id: 'a', title: 'Pilne', priority: 'urgent' }),
      task({ id: 'b', title: 'Średnie', priority: 'medium' }),
    ]);
    renderAll('all');

    await user.click(screen.getAllByRole('button', { name: /Filtruj/ })[0]!);
    await user.click(screen.getByRole('checkbox', { name: 'pilne' }));
    expect(
      screen.getByRole('button', { name: /Pokaż 1 zadanie/ }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Wyczyść' }));
    expect(
      screen.getByRole('button', { name: /Pokaż 2 zadania/ }),
    ).toBeInTheDocument();
  });

  it('desktop search w topbarze filtruje listę po tytule', async () => {
    const user = userEvent.setup();
    seedWith([
      task({ id: 'a', title: 'Analiza danych' }),
      task({ id: 'b', title: 'Zakupy' }),
    ]);
    renderAll('all');

    const search = screen.getByRole('searchbox', { name: 'Szukaj zadań' });
    await user.type(search, 'Analiza');

    await waitFor(() =>
      expect(
        within(screen.getByRole('table')).queryByText('Zakupy'),
      ).not.toBeInTheDocument(),
    );
    expect(
      within(screen.getByRole('table')).getByText('Analiza danych'),
    ).toBeInTheDocument();
  });
});

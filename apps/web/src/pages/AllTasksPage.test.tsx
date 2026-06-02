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

  it('tabela pokazuje notatkę (description) pod tytułem (POPRAWKA 6)', () => {
    seedWith([
      task({ id: 'a', title: 'Zadanie A', description: 'Rozdziały 4-6' }),
    ]);
    renderAll('all');

    const table = screen.getByRole('table');
    expect(within(table).getByText('Rozdziały 4-6')).toBeInTheDocument();
  });

  it('tabela: „Dodaj notatkę" widoczne dla zadania bez notatki (bez hovera) (POPRAWKA 6)', () => {
    seedWith([task({ id: 'a', title: 'Zadanie A' })]);
    renderAll('all');

    const addNote = within(screen.getByRole('table')).getByRole('button', {
      name: 'Dodaj notatkę do zadania: Zadanie A',
    });
    expect(addNote).toBeInTheDocument();
    expect(addNote).not.toHaveClass('opacity-0');
  });

  it('tabela: inline edycja notatki zapisuje description i utrwala (POPRAWKA 6)', async () => {
    const user = userEvent.setup();
    seedWith([task({ id: 'a', title: 'Zadanie A' })]);
    renderAll('all');

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Dodaj notatkę do zadania: Zadanie A',
      }),
    );
    await user.type(
      screen.getByRole('textbox', { name: /Notatka zadania/ }),
      'Notatka z tabeli',
    );
    await user.click(screen.getByRole('button', { name: 'Zapisz' }));

    // Po zapisie notatka widoczna w wierszu (odczyt ze stanu).
    expect(
      within(screen.getByRole('table')).getByText('Notatka z tabeli'),
    ).toBeInTheDocument();

    // Utrwalenie: description trafiło do localStorage (reducer task/update).
    await waitFor(() => {
      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).toContain('Notatka z tabeli');
    });
  });

  it('tabela: klik notatki do edycji NIE otwiera pełnej edycji zadania (stopPropagation)', async () => {
    const user = userEvent.setup();
    seedWith([task({ id: 'a', title: 'Zadanie A', description: 'Istnieje' })]);
    renderAll('all');

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: /Edytuj notatkę zadania/,
      }),
    );
    // Otworzyła się inline-edycja, a nie ekran /zadanie/:id.
    expect(screen.queryByText('Edycja')).not.toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /Notatka zadania/ }),
    ).toBeInTheDocument();
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

  it('kosz w wierszu otwiera modal potwierdzenia → „Usuń zadanie" kasuje + toast „Cofnij" przywraca (POPRAWKA 4)', async () => {
    const user = userEvent.setup();
    seedWith([
      task({ id: 'a', title: 'Do usunięcia' }),
      task({ id: 'b', title: 'Zostaje' }),
    ]);
    renderAll('all');

    const table = screen.getByRole('table');
    await user.click(
      within(table).getByRole('button', { name: 'Usuń zadanie: Do usunięcia' }),
    );

    // Modal potwierdzenia (nie usuwa od razu) — pojawia się dialog z ostrzeżeniem.
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Usunąć zadanie?')).toBeInTheDocument();

    // Potwierdzenie kasuje.
    await user.click(
      within(dialog).getByRole('button', { name: 'Usuń zadanie' }),
    );
    await waitFor(() =>
      expect(
        within(screen.getByRole('table')).queryByText('Do usunięcia'),
      ).not.toBeInTheDocument(),
    );
    expect(
      within(screen.getByRole('table')).getByText('Zostaje'),
    ).toBeInTheDocument();

    // Undo przez toast przywraca zadanie.
    await user.click(screen.getByRole('button', { name: 'Cofnij' }));
    expect(
      within(screen.getByRole('table')).getByText('Do usunięcia'),
    ).toBeInTheDocument();
  });

  it('w modalu „Anuluj" NIE kasuje zadania (POPRAWKA 4)', async () => {
    const user = userEvent.setup();
    seedWith([task({ id: 'a', title: 'Do usunięcia' })]);
    renderAll('all');

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Usuń zadanie: Do usunięcia',
      }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Anuluj' }));

    // Zadanie nadal na liście — anulowanie nie usuwa.
    expect(
      within(screen.getByRole('table')).getByText('Do usunięcia'),
    ).toBeInTheDocument();
  });

  it('klik kosza w wierszu NIE otwiera edycji zadania (stopPropagation)', async () => {
    const user = userEvent.setup();
    seedWith([task({ id: 'a', title: 'Do usunięcia' })]);
    renderAll('all');

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Usuń zadanie: Do usunięcia',
      }),
    );

    // Klik kosza otwiera modal, ale nie nawiguje na /zadanie/:id (brak ekranu „Edycja").
    expect(screen.queryByText('Edycja')).not.toBeInTheDocument();
  });

  it('klik tytułu w wierszu (poza koszem) nadal otwiera edycję', async () => {
    const user = userEvent.setup();
    seedWith([task({ id: 'a', title: 'Edytowalne' })]);
    renderAll('all');

    await user.click(within(screen.getByRole('table')).getByText('Edytowalne'));
    expect(screen.getByText('Edycja')).toBeInTheDocument();
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

  it('deep-link ?kat= (filtr z sidebara) zaznacza kategorię też w FilterPanel — jedno źródło', async () => {
    const user = userEvent.setup();
    seedWith([
      task({ id: 'a', title: 'Zadanie prywatne', categoryId: 'cat-prywatne' }),
      task({ id: 'b', title: 'Zadanie pracowe', categoryId: 'cat-praca' }),
    ]);
    // Wejście jak po kliknięciu „Prywatne" w sidebarze (deep-link / odświeżenie).
    renderAll('all', '/wszystkie?kat=prywatne');

    // Chip kategorii nad listą obecny (kanał z URL).
    expect(
      screen.getByRole('button', { name: /Usuń filtr kategorii: Prywatne/ }),
    ).toBeInTheDocument();

    // Otwórz panel filtrów (desktop Popover) — kategoria Prywatne ma być
    // pokazana jako zaznaczona, czyli sidebar i panel to ten sam filtr.
    await user.click(screen.getAllByRole('button', { name: /Filtruj/ })[0]!);
    const prywatneChip = screen.getByRole('checkbox', { name: /Prywatne/ });
    expect(prywatneChip).toHaveAttribute('aria-checked', 'true');
  });

  it('odznaczenie kategorii z ?kat= w panelu zdejmuje filtr (migracja URL→panel, bez dublu)', async () => {
    const user = userEvent.setup();
    seedWith([
      task({ id: 'a', title: 'Zadanie prywatne', categoryId: 'cat-prywatne' }),
      task({ id: 'b', title: 'Zadanie pracowe', categoryId: 'cat-praca' }),
    ]);
    renderAll('all', '/wszystkie?kat=prywatne');

    // Lista zawężona do Prywatne.
    expect(
      within(screen.getByRole('table')).queryByText('Zadanie pracowe'),
    ).not.toBeInTheDocument();

    // Otwórz panel i odznacz Prywatne → filtr znika, wraca pełna lista,
    // a chip nad listą też znika (URL ?kat= zdjęty, nie ma drugiego kanału).
    await user.click(screen.getAllByRole('button', { name: /Filtruj/ })[0]!);
    await user.click(screen.getByRole('checkbox', { name: /Prywatne/ }));

    await waitFor(() =>
      expect(
        within(screen.getByRole('table')).getByText('Zadanie pracowe'),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole('button', { name: /Usuń filtr kategorii/ }),
    ).not.toBeInTheDocument();
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

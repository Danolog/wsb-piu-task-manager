import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { TasksPage } from './TasksPage';
import { Toaster } from '@/components/ui/sonner';
import { renderWithProviders } from '@/test/render';

function renderPage() {
  return renderWithProviders(
    <>
      <TasksPage />
      <Toaster />
    </>,
  );
}

describe('TasksPage', () => {
  it('renderuje nagłówek listy zadań i przycisk dodawania', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: 'Lista zadań' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /Dodaj zadanie/ }).length,
    ).toBeGreaterThan(0);
  });

  it('pełny przepływ: dodaj → oznacz wykonane → usuń → cofnij', async () => {
    const user = userEvent.setup();
    renderPage();

    // Dodaj zadanie przez modal.
    await user.click(
      screen.getAllByRole('button', { name: /Dodaj zadanie/ })[0]!,
    );
    const dialog = await screen.findByRole('dialog');
    await user.type(
      within(dialog).getByPlaceholderText('Wpisz tytuł zadania...'),
      'Zadanie testowe',
    );
    await user.click(
      within(dialog).getByRole('button', { name: 'Dodaj zadanie' }),
    );

    // Pojawia się na liście.
    const card = await screen.findByText('Zadanie testowe');
    expect(card).toBeInTheDocument();

    // Oznacz jako wykonane.
    await user.click(screen.getByRole('checkbox'));
    await waitFor(() => expect(screen.getByRole('checkbox')).toBeChecked());

    // Usuń → znika z listy, pojawia się toast z „Cofnij".
    await user.click(screen.getByRole('button', { name: /Usuń zadanie/ }));
    await waitFor(() =>
      expect(screen.queryByText('Zadanie testowe')).not.toBeInTheDocument(),
    );

    // Cofnij → wraca z zachowanym statusem „done".
    await user.click(await screen.findByRole('button', { name: 'Cofnij' }));
    expect(await screen.findByText('Zadanie testowe')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('checkbox')).toBeChecked());
  });

  it('filtruje zadania przez status (zakładka Zrobione)', async () => {
    const user = userEvent.setup();
    renderPage();

    // Dodaj jedno zadanie (todo).
    await user.click(
      screen.getAllByRole('button', { name: /Dodaj zadanie/ })[0]!,
    );
    const dialog = await screen.findByRole('dialog');
    await user.type(
      within(dialog).getByPlaceholderText('Wpisz tytuł zadania...'),
      'Tylko todo',
    );
    await user.click(
      within(dialog).getByRole('button', { name: 'Dodaj zadanie' }),
    );
    await screen.findByText('Tylko todo');

    // Przełącz na „Zrobione" — todo znika, pojawia się pusty stan filtra.
    await user.click(screen.getByRole('tab', { name: 'Zrobione' }));
    await waitFor(() =>
      expect(screen.queryByText('Tylko todo')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Brak wyników')).toBeInTheDocument();
  });
});

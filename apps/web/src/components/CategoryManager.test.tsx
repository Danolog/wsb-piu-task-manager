import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { CategoryManager } from './CategoryManager';
import { renderWithProviders } from '@/test/render';

describe('CategoryManager', () => {
  it('pokazuje seedowane kategorie', () => {
    renderWithProviders(<CategoryManager />);
    expect(screen.getByText('Studia')).toBeInTheDocument();
    expect(screen.getByText('Praca')).toBeInTheDocument();
  });

  it('dodaje nową kategorię', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoryManager />);

    await user.type(
      screen.getByPlaceholderText('Nazwa kategorii...'),
      'Projekt dyplomowy',
    );
    await user.click(screen.getByRole('button', { name: 'Dodaj kategorię' }));

    expect(screen.getByText('Projekt dyplomowy')).toBeInTheDocument();
  });

  it('usuwa kategorię po potwierdzeniu w modalu', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoryManager />);

    await user.click(
      screen.getByRole('button', { name: 'Usuń kategorię Dom' }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Usuń kategorię' }),
    );

    expect(screen.queryByText('Dom')).not.toBeInTheDocument();
  });
});

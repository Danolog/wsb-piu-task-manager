import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { OnboardingPage } from './OnboardingPage';
import { AppProvider } from '@/app/AppProvider';

/** Sonda ścieżki — do asercji nawigacji po zapisaniu imienia. */
function LocationProbe() {
  const location = useLocation();
  return <span data-testid="path">{location.pathname}</span>;
}

function renderOnboarding() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={['/onboarding']}>
        <LocationProbe />
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dzis" element={<h1>Kokpit Dziś</h1>} />
        </Routes>
      </MemoryRouter>
    </AppProvider>,
  );
}

describe('OnboardingPage (P-C)', () => {
  beforeEach(() => {
    localStorage.clear();
    // Desktop viewport → splash pominięty, od razu formularz.
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));
  });

  it('CTA jest zablokowane przy pustym imieniu', () => {
    renderOnboarding();
    expect(screen.getByRole('button', { name: /Zaczynamy/ })).toBeDisabled();
  });

  it('renderuje kafle kategorii z domyślnie zaznaczonymi Studia/Praca/Prywatne', () => {
    renderOnboarding();
    expect(screen.getByRole('checkbox', { name: 'Studia' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Praca' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Prywatne' })).toBeChecked();
    // Dom/Zdrowie/Finanse dostępne, ale niezaznaczone.
    expect(screen.getByRole('checkbox', { name: 'Dom' })).not.toBeChecked();
  });

  it('zapisuje imię i przekierowuje na /dzis', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.type(screen.getByLabelText('Twoje imię'), 'Kasia');
    await user.click(screen.getByRole('button', { name: /Zaczynamy/ }));

    expect(await screen.findByText('Kokpit Dziś')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId('path')).toHaveTextContent('/dzis'),
    );
  });

  it('odznaczenie kategorii nie blokuje przejścia dalej', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.click(screen.getByRole('checkbox', { name: 'Studia' }));
    expect(screen.getByRole('checkbox', { name: 'Studia' })).not.toBeChecked();

    await user.type(screen.getByLabelText('Twoje imię'), 'Marek');
    await user.click(screen.getByRole('button', { name: /Zaczynamy/ }));
    expect(await screen.findByText('Kokpit Dziś')).toBeInTheDocument();
  });
});

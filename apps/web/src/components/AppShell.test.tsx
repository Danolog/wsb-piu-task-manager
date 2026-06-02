import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  MemoryRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AppShell, BareLayout } from './AppShell';
import {
  RequireOnboarding,
  RedirectIfOnboarded,
} from '@/app/RequireOnboarding';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { AppProvider } from '@/app/AppProvider';
import { STORAGE_KEY, seedState } from '@/features/tasks/storage';

/** Sonda pokazująca bieżącą ścieżkę + query — do asercji przekierowań i ?kat=. */
function LocationProbe() {
  const location = useLocation();
  return (
    <>
      <span data-testid="path">{location.pathname}</span>
      <span data-testid="search">{location.search}</span>
    </>
  );
}

/** Mini-aplikacja odwzorowująca strukturę tras (gate + AppShell + onboarding). */
function TestApp() {
  return (
    <Routes>
      <Route
        path="/onboarding"
        element={
          <RedirectIfOnboarded>
            <BareLayout>
              <OnboardingPage />
            </BareLayout>
          </RedirectIfOnboarded>
        }
      />
      <Route
        element={
          <RequireOnboarding>
            <AppShell />
          </RequireOnboarding>
        }
      >
        <Route index element={<Navigate to="/dzis" replace />} />
        <Route path="dzis" element={<h1>Kokpit Dziś</h1>} />
        <Route path="wszystkie" element={<h1>Wszystkie</h1>} />
        <Route path="ustawienia" element={<h1>Ekran Ustawień</h1>} />
      </Route>
      <Route path="*" element={<h1>404</h1>} />
    </Routes>
  );
}

function renderApp(route: string) {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[route]}>
        <LocationProbe />
        <TestApp />
      </MemoryRouter>
    </AppProvider>,
  );
}

describe('Gate onboardingu (RequireOnboarding)', () => {
  beforeEach(() => localStorage.clear());

  it('bez imienia przekierowuje z /dzis na /onboarding', () => {
    renderApp('/dzis');
    expect(screen.getByLabelText('Twoje imię')).toBeInTheDocument();
    expect(screen.queryByText('Kokpit Dziś')).not.toBeInTheDocument();
  });

  it('po zapisaniu imienia wpuszcza do aplikacji (gate przestaje blokować)', async () => {
    const user = userEvent.setup();
    renderApp('/onboarding');

    await user.type(screen.getByLabelText('Twoje imię'), 'Kasia');
    await user.click(screen.getByRole('button', { name: /Zaczynamy/ }));

    // RedirectIfOnboarded przerzuca /onboarding → /dzis po ustawieniu imienia.
    expect(await screen.findByText('Kokpit Dziś')).toBeInTheDocument();
    expect(screen.getByTestId('path')).toHaveTextContent('/dzis');
  });

  it('z ustawionym imieniem wchodzi prosto na /dzis (gate przepuszcza)', () => {
    const state = { ...seedState(), user: { name: 'Marek' } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderApp('/dzis');
    expect(screen.getByText('Kokpit Dziś')).toBeInTheDocument();
  });

  it('/onboarding przy ustawionym imieniu przekierowuje na /dzis', () => {
    const state = { ...seedState(), user: { name: 'Marek' } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderApp('/onboarding');
    expect(screen.getByText('Kokpit Dziś')).toBeInTheDocument();
    expect(screen.queryByLabelText('Twoje imię')).not.toBeInTheDocument();
  });
});

describe('AppShell — nawigacja i liczniki', () => {
  beforeEach(() => localStorage.clear());

  function withUserAndTasks() {
    const base = seedState();
    const state = {
      ...base,
      user: { name: 'Kasia' },
      tasks: {
        t1: {
          id: 't1',
          title: 'Zrobione zadanie',
          status: 'done' as const,
          priority: 'medium' as const,
          categoryId: 'cat-studia',
          completedAt: new Date().toISOString(),
          createdAt: '2026-06-01T09:00:00.000Z',
          updatedAt: '2026-06-01T09:00:00.000Z',
        },
        t2: {
          id: 't2',
          title: 'Todo zadanie',
          status: 'todo' as const,
          priority: 'low' as const,
          categoryId: 'cat-studia',
          createdAt: '2026-06-01T09:00:00.000Z',
          updatedAt: '2026-06-01T09:00:00.000Z',
        },
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  it('logo sidebara to „Task Manager" (POPRAWKA 3)', () => {
    withUserAndTasks();
    renderApp('/dzis');
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
  });

  it('renderuje sidebar z sekcjami WIDOKI i KATEGORIE oraz kartą usera', () => {
    withUserAndTasks();
    renderApp('/dzis');

    const widoki = screen.getByRole('navigation', { name: 'Widoki' });
    expect(within(widoki).getByText('Dziś')).toBeInTheDocument();
    expect(within(widoki).getByText('Ten tydzień')).toBeInTheDocument();
    expect(within(widoki).getByText('Zrobione')).toBeInTheDocument();

    // Karta usera z imieniem.
    expect(screen.getByText('Kasia')).toBeInTheDocument();

    // Licznik kategorii Studia = 2 zadania.
    const studia = screen.getByText('Studia').closest('li');
    expect(studia).not.toBeNull();
    expect(within(studia!).getByText('2')).toBeInTheDocument();
  });

  it('mobilny tab-bar ma pozycje Dziś/Lista/Szukaj/Ja', () => {
    withUserAndTasks();
    renderApp('/dzis');
    const tabbar = screen.getByRole('navigation', {
      name: 'Nawigacja główna',
    });
    expect(within(tabbar).getByText('Lista')).toBeInTheDocument();
    expect(within(tabbar).getByText('Szukaj')).toBeInTheDocument();
    expect(within(tabbar).getByText('Ja')).toBeInTheDocument();
  });

  it('desktop: karta usera jest linkiem do Ustawień (POPRAWKA 1)', async () => {
    const user = userEvent.setup();
    withUserAndTasks();
    renderApp('/dzis');

    // Karta usera = link z dostępną nazwą zawierającą imię i pozycję „Ustawienia".
    const settingsLink = screen.getByRole('link', { name: /Ustawienia/ });
    expect(settingsLink).toBeInTheDocument();
    expect(settingsLink).toHaveTextContent('Kasia');

    await user.click(settingsLink);
    expect(screen.getByText('Ekran Ustawień')).toBeInTheDocument();
    expect(screen.getByTestId('path')).toHaveTextContent('/ustawienia');
  });

  it('mobile: tab-bar „Ja" prowadzi do Ustawień (potwierdzenie obu ścieżek)', async () => {
    const user = userEvent.setup();
    withUserAndTasks();
    renderApp('/dzis');

    const tabbar = screen.getByRole('navigation', {
      name: 'Nawigacja główna',
    });
    await user.click(within(tabbar).getByRole('link', { name: 'Ja' }));
    expect(screen.getByText('Ekran Ustawień')).toBeInTheDocument();
    expect(screen.getByTestId('path')).toHaveTextContent('/ustawienia');
  });

  it('desktop: pozycje KATEGORIE są klikalne i prowadzą do /wszystkie?kat=', async () => {
    const user = userEvent.setup();
    withUserAndTasks();
    renderApp('/dzis');

    // „Studia" w sekcji KATEGORIE to teraz link (a nie statyczny tekst).
    const studiaLink = screen.getByRole('link', { name: /Kategoria Studia/ });
    expect(studiaLink).toBeInTheDocument();

    await user.click(studiaLink);
    expect(screen.getByTestId('path')).toHaveTextContent('/wszystkie');
    expect(screen.getByTestId('search')).toHaveTextContent('kat=studia');
  });

  it('desktop: kliknięta kategoria ma aktywny stan (aria-current) na /wszystkie?kat=', () => {
    withUserAndTasks();
    renderApp('/wszystkie?kat=studia');

    const studiaLink = screen.getByRole('link', { name: /Kategoria Studia/ });
    expect(studiaLink).toHaveAttribute('aria-current', 'page');

    // Inna kategoria (Praca) nie jest aktywna przy ?kat=studia.
    const pracaLink = screen.getByRole('link', { name: /Kategoria Praca/ });
    expect(pracaLink).not.toHaveAttribute('aria-current');
  });

  it('desktop: bez ?kat= żadna kategoria nie jest aktywna', () => {
    withUserAndTasks();
    renderApp('/wszystkie');
    const studiaLink = screen.getByRole('link', { name: /Kategoria Studia/ });
    expect(studiaLink).not.toHaveAttribute('aria-current');
  });

  it('404 dla nieznanej trasy (z ustawionym imieniem)', () => {
    const state = { ...seedState(), user: { name: 'Marek' } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderApp('/nieistnieje');
    expect(screen.getByText('404')).toBeInTheDocument();
  });
});

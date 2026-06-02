import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '@/app/AppProvider';

/**
 * Render z pełnym kontekstem aplikacji (AppProvider + Router).
 * Używaj dla komponentów wołających useAppState / nawigację.
 * Stan startuje z seedState (localStorage czyszczony w setup po każdym teście).
 */
export function renderWithProvider(ui: ReactElement) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AppProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </AppProvider>
    );
  }
  return render(ui, { wrapper: Wrapper });
}

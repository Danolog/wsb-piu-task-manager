import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '@/app/AppProvider';

/** Render z providerami app (router in-memory + globalny stan) dla testów komponentów. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/' }: { route?: string } = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AppProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </AppProvider>
    );
  }
  return render(ui, { wrapper: Wrapper });
}

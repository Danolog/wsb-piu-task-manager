import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppState } from './app-context';

/**
 * Bramka onboardingu: gdy user nie ma imienia (`name === ''`), przekierowuje
 * na /onboarding. Owija layout aplikacji (wszystkie trasy w AppShell).
 */
export function RequireOnboarding({ children }: { children: ReactNode }) {
  const { state } = useAppState();
  if (state.user.name === '') {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

/**
 * Odwrotna bramka dla /onboarding: gdy imię JUŻ ustawione, przekierowuje
 * na /dzis (nie pokazujemy onboardingu po jego ukończeniu).
 */
export function RedirectIfOnboarded({ children }: { children: ReactNode }) {
  const { state } = useAppState();
  if (state.user.name !== '') {
    return <Navigate to="/dzis" replace />;
  }
  return <>{children}</>;
}

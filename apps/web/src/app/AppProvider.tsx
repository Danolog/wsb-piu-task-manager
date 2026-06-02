import { useEffect, useReducer, type ReactNode } from 'react';
import type { Theme } from '@/features/tasks/model';
import { rootReducer } from '@/features/tasks/store';
import { load, save } from '@/features/tasks/storage';
import { AppContext } from './app-context';

/** Wylicza efektywny motyw ('system' → preferencja OS) i ustawia data-theme na <html>. */
function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effective =
    theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
  document.documentElement.setAttribute('data-theme', effective);
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Lazy init: stan czytany ze storage tylko raz, przy montowaniu.
  const [state, dispatch] = useReducer(rootReducer, undefined, load);

  // Zapis przy każdej zmianie stanu (auto-save, bez przycisku "Zapisz").
  useEffect(() => {
    save(state);
  }, [state]);

  // Synchronizacja motywu z <html>; reaguje na zmianę preferencji OS w trybie 'system'.
  useEffect(() => {
    applyTheme(state.ui.theme);
    if (state.ui.theme !== 'system' || typeof window === 'undefined') {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [state.ui.theme]);

  return <AppContext value={{ state, dispatch }}>{children}</AppContext>;
}

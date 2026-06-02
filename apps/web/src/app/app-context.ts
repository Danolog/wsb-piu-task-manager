import { createContext, use, type Dispatch } from 'react';
import type { AppState } from '@/features/tasks/model';
import type { Action } from '@/features/tasks/store';

export interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppState(): AppContextValue {
  const ctx = use(AppContext);
  if (!ctx) {
    throw new Error('useAppState musi być użyte wewnątrz <AppProvider>.');
  }
  return ctx;
}

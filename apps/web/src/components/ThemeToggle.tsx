import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/app/app-context';
import type { Theme } from '@/features/tasks/model';

const ORDER: Theme[] = ['light', 'dark', 'system'];

const META: Record<Theme, { label: string; Icon: typeof Sun; next: string }> = {
  light: { label: 'Motyw jasny', Icon: Sun, next: 'ciemny' },
  dark: { label: 'Motyw ciemny', Icon: Moon, next: 'systemowy' },
  system: { label: 'Motyw systemowy', Icon: Monitor, next: 'jasny' },
};

/**
 * Cykliczny przełącznik motywu: jasny → ciemny → systemowy.
 * Zapis stanu (ui/setTheme) utrwala AppProvider w localStorage;
 * efektywny motyw nakładany jest jako data-theme na <html>.
 */
export function ThemeToggle() {
  const { state, dispatch } = useAppState();
  const current = state.ui.theme;
  const meta = META[current];
  const Icon = meta.Icon;

  function cycle() {
    const index = ORDER.indexOf(current);
    const next = ORDER[(index + 1) % ORDER.length]!;
    dispatch({ type: 'ui/setTheme', payload: { theme: next } });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={cycle}
      aria-label={`${meta.label}. Kliknij, aby przełączyć na ${meta.next}.`}
      title={meta.label}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}

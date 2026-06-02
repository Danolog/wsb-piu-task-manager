import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import { renderWithProviders } from '@/test/render';
import { load } from '@/features/tasks/storage';

describe('ThemeToggle', () => {
  it('cyklicznie przełącza motyw i utrwala go w localStorage', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeToggle />);

    // Stan początkowy: 'system' (seed). data-theme = light (mock matchMedia: brak dark).
    const button = screen.getByRole('button');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // system → light
    await user.click(button);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(load().ui.theme).toBe('light');

    // light → dark (utrwalone + data-theme przełączony)
    await user.click(button);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(load().ui.theme).toBe('dark');
  });
});

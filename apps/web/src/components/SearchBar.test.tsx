import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('emituje wartość po debounce (nie na każde naciśnięcie)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} debounceMs={50} />);

    await user.type(screen.getByRole('searchbox'), 'abc');
    // Przed upływem debounce — żadnej emisji finalnej wartości.
    expect(onChange).not.toHaveBeenCalledWith('abc');

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('abc'));
  });

  it('przycisk czyszczenia natychmiast resetuje wartość', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar value="raport" onChange={onChange} debounceMs={50} />);

    await user.click(
      screen.getByRole('button', { name: 'Wyczyść wyszukiwanie' }),
    );
    expect(onChange).toHaveBeenCalledWith('');
  });
});

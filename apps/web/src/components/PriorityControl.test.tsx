import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PriorityControl } from './PriorityControl';

describe('PriorityControl', () => {
  it('renderuje wszystkie 4 priorytety i zaznacza wybrany', () => {
    render(<PriorityControl value="high" />);
    expect(screen.getByRole('radio', { name: 'Niski' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Wysoki' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('wywołuje onChange z nową wartością po kliknięciu', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PriorityControl value="low" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: 'Pilny' }));
    expect(onChange).toHaveBeenCalledWith('urgent');
  });

  it('nie odznacza wartości po ponownym kliknięciu aktywnego (zawsze trzyma wybór)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PriorityControl value="medium" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: 'Średni' }));
    // ToggleGroup single zwróciłby '' — wrapper to ignoruje, onChange nie dostaje pustej wartości.
    expect(onChange).not.toHaveBeenCalledWith('');
  });
});

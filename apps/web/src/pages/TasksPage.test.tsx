import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TasksPage } from './TasksPage';
import { renderWithProviders } from '@/test/render';

describe('TasksPage (smoke)', () => {
  it('renderuje nagłówek listy zadań', () => {
    renderWithProviders(<TasksPage />);
    expect(
      screen.getByRole('heading', { name: 'Lista zadań' }),
    ).toBeInTheDocument();
  });
});

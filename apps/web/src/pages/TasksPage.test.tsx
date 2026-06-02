import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TasksPage } from './TasksPage';

describe('TasksPage (smoke P0)', () => {
  it('renderuje nagłówek listy zadań', () => {
    render(<TasksPage />);
    expect(
      screen.getByRole('heading', { name: 'Zadania' }),
    ).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { taskInputSchema, TITLE_MAX } from './model';

describe('taskInputSchema', () => {
  const valid = { title: 'Zadanie', priority: 'medium' as const };

  it('akceptuje poprawny minimalny input (status domyślnie todo)', () => {
    const parsed = taskInputSchema.parse(valid);
    expect(parsed.title).toBe('Zadanie');
    expect(parsed.status).toBe('todo');
  });

  it('odrzuca pusty tytuł z komunikatem po polsku', () => {
    const result = taskInputSchema.safeParse({ ...valid, title: '   ' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Proszę wpisać nazwę zadania.',
      );
    }
  });

  it('odrzuca tytuł dłuższy niż limit', () => {
    const result = taskInputSchema.safeParse({
      ...valid,
      title: 'x'.repeat(TITLE_MAX + 1),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('maksymalnie');
    }
  });

  it('odrzuca datę o złym formacie', () => {
    const result = taskInputSchema.safeParse({
      ...valid,
      dueDate: '31-12-2026',
    });
    expect(result.success).toBe(false);
  });

  it('odrzuca nieistniejącą datę w kalendarzu (np. 2026-02-30)', () => {
    const result = taskInputSchema.safeParse({
      ...valid,
      dueDate: '2026-02-30',
    });
    expect(result.success).toBe(false);
  });

  it('akceptuje poprawną datę i traktuje pusty string jako brak', () => {
    const ok = taskInputSchema.parse({ ...valid, dueDate: '2026-06-05' });
    expect(ok.dueDate).toBe('2026-06-05');
    const empty = taskInputSchema.parse({ ...valid, dueDate: '' });
    expect(empty.dueDate).toBeUndefined();
  });
});

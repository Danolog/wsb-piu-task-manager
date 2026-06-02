import { format, isToday, isPast, parseISO, isValid } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { Priority, Category } from './model';

/** Etykiety priorytetów po polsku (współdzielone przez kartę, formularz, filtry). */
export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Niski',
  medium: 'Średni',
  high: 'Wysoki',
  urgent: 'Pilny',
};

/**
 * Token koloru kategorii → klasa tła kropki/akcentu.
 * color w modelu to token semantyczny (np. 'category-green'); mapujemy go na
 * pełną klasę Tailwind, by uniknąć dynamicznego sklejania (które tree-shaking ucina).
 */
const CATEGORY_DOT_CLASS: Record<string, string> = {
  'category-green': 'bg-category-green',
  'category-blue': 'bg-category-blue',
  'category-purple': 'bg-category-purple',
  'category-orange': 'bg-category-orange',
  'category-red': 'bg-category-red',
};

export function categoryDotClass(color: string): string {
  return CATEGORY_DOT_CLASS[color] ?? 'bg-ink-muted';
}

const CATEGORY_TEXT_CLASS: Record<string, string> = {
  'category-green': 'text-category-green',
  'category-blue': 'text-category-blue',
  'category-purple': 'text-category-purple',
  'category-orange': 'text-category-orange',
  'category-red': 'text-category-red',
};

export function categoryTextClass(color: string): string {
  return CATEGORY_TEXT_CLASS[color] ?? 'text-ink-muted';
}

/** Lista tokenów kolorów dostępnych w palecie (do wyboru przy CRUD kategorii). */
export const CATEGORY_COLOR_TOKENS: readonly string[] = [
  'category-green',
  'category-blue',
  'category-purple',
  'category-orange',
  'category-red',
];

export interface DueDateView {
  /** Sformatowany tekst, np. „2 cze 2026". */
  label: string;
  /** Termin przypada dzisiaj. */
  today: boolean;
  /** Termin minął (i nie jest dzisiejszy). */
  overdue: boolean;
}

/**
 * Formatuje termin (YYYY-MM-DD) do polskiej etykiety z flagami dziś/po terminie.
 * Zwraca null dla braku/niepoprawnej daty — wołający nie renderuje wtedy nic.
 */
export function formatDueDate(dueDate: string | undefined): DueDateView | null {
  if (!dueDate) return null;
  const parsed = parseISO(dueDate);
  if (!isValid(parsed)) return null;
  const today = isToday(parsed);
  return {
    label: format(parsed, 'd MMM yyyy', { locale: pl }),
    today,
    // isPast jest prawdą także dla wcześniejszej godziny dziś — wykluczamy dzisiejszy dzień.
    overdue: !today && isPast(parsed),
  };
}

export function lookupCategory(
  categories: Record<string, Category>,
  categoryId: string | undefined,
): Category | undefined {
  if (!categoryId) return undefined;
  return categories[categoryId];
}

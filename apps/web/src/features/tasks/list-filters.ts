import type { Priority } from './model';
import type { ViewFilters } from './store';

/** Stan filtrów widoku listy — lokalny dla AllTasksPage (nie globalny reducer). */
export interface ListFilterState {
  /** Wybrane priorytety (puste = wszystkie). */
  priorities: Priority[];
  /** Wybrane kategorie (puste = wszystkie). */
  categoryIds: string[];
  sortBy: ViewFilters['sortBy'];
}

export const emptyListFilters: ListFilterState = {
  priorities: [],
  categoryIds: [],
  sortBy: 'dueDate',
};

export function hasActiveFilters(f: ListFilterState): boolean {
  return f.priorities.length > 0 || f.categoryIds.length > 0;
}

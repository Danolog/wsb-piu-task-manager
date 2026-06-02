import { ArrowDownNarrowWide, ArrowUpWideNarrow } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { ViewFilters } from '@/features/tasks/store';

export interface SortControlProps {
  sortBy: ViewFilters['sortBy'];
  sortDir: ViewFilters['sortDir'];
  onSortByChange: (value: ViewFilters['sortBy']) => void;
  onSortDirChange: (value: ViewFilters['sortDir']) => void;
}

const SORT_LABEL: Record<ViewFilters['sortBy'], string> = {
  createdAt: 'Data utworzenia',
  dueDate: 'Termin',
  priority: 'Priorytet',
  title: 'Nazwa',
};

/** Wybór klucza sortowania (Select) + przełącznik kierunku rosnąco/malejąco. */
export function SortControl({
  sortBy,
  sortDir,
  onSortByChange,
  onSortDirChange,
}: SortControlProps) {
  const asc = sortDir === 'asc';
  return (
    <div className="flex items-center gap-1.5">
      <Select
        value={sortBy}
        onValueChange={(v) => onSortByChange(v as ViewFilters['sortBy'])}
      >
        <SelectTrigger size="sm" aria-label="Sortuj według" className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">{SORT_LABEL.createdAt}</SelectItem>
          <SelectItem value="dueDate">{SORT_LABEL.dueDate}</SelectItem>
          <SelectItem value="priority">{SORT_LABEL.priority}</SelectItem>
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9"
        aria-label={
          asc
            ? 'Sortowanie rosnąco — kliknij, by zmienić na malejąco'
            : 'Sortowanie malejąco — kliknij, by zmienić na rosnąco'
        }
        onClick={() => onSortDirChange(asc ? 'desc' : 'asc')}
      >
        {asc ? (
          <ArrowUpWideNarrow className="size-4" aria-hidden="true" />
        ) : (
          <ArrowDownNarrowWide className="size-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}

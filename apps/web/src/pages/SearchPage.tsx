import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAppState } from '@/app/app-context';
import { SearchBar } from '@/components/SearchBar';
import { TaskCard } from '@/components/TaskCard';
import { selectVisibleTasks, defaultViewFilters } from '@/features/tasks/store';
import { lookupCategory } from '@/features/tasks/presentation';

/**
 * Strona wyszukiwania (mobile). Pole szukania na górze, nagłówek „WYNIKI · N",
 * lista wyników (reuse TaskCard). Pusta fraza → podpowiedź, brak wyników → empty.
 * Na desktopie wyszukiwanie żyje w topbarze /wszystkie (decyzja 11.1) — tu nie wchodzimy.
 */
export function SearchPage() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const trimmed = query.trim();

  const results = useMemo(() => {
    if (!trimmed) return [];
    return selectVisibleTasks(state, {
      ...defaultViewFilters,
      search: trimmed,
      sortBy: 'dueDate',
      sortDir: 'asc',
    });
  }, [state, trimmed]);

  function handleToggle(id: string) {
    dispatch({ type: 'task/toggle', payload: { id } });
  }

  function handleDelete(id: string) {
    const task = state.tasks[id];
    if (!task) return;
    dispatch({ type: 'task/delete', payload: { id } });
    toast('Usunięto zadanie.', {
      duration: 5000,
      action: {
        label: 'Cofnij',
        onClick: () => dispatch({ type: 'task/restore', payload: { task } }),
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
      <SearchBar value={query} onChange={setQuery} />

      {!trimmed ? (
        <div className="mt-10 flex flex-col items-center gap-2 text-center text-ink-muted">
          <Search className="size-8" aria-hidden="true" />
          <p className="text-sm">Wpisz frazę, aby przeszukać zadania.</p>
        </div>
      ) : (
        <>
          <p className="mt-5 mb-3 text-xs font-medium tracking-wide text-ink-muted uppercase">
            Wyniki · {results.length}
          </p>
          {results.length === 0 ? (
            <div
              className="rounded-[var(--radius-field)] border border-dashed border-line bg-surface px-6 py-12 text-center"
              role="status"
            >
              <p className="text-base font-semibold text-ink">Brak wyników</p>
              <p className="mt-1 text-sm text-ink-muted">
                Nie znaleziono zadań dla „{trimmed}".
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {results.map((task) => (
                <li key={task.id}>
                  <TaskCard
                    task={task}
                    category={lookupCategory(state.categories, task.categoryId)}
                    onToggle={handleToggle}
                    onEdit={(id) => navigate(`/zadanie/${id}`)}
                    onDelete={handleDelete}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

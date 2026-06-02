import { Construction } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';

/**
 * Tymczasowa strona „w budowie" dla tras, których pełna treść powstaje
 * w kolejnych paczkach (P-C…P-H). Trzyma tokeny i nagłówek, by trasa żyła.
 */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
      <h1 className="mb-6 text-xl font-semibold text-ink">{title}</h1>
      <EmptyState
        icon={Construction}
        title="W budowie"
        description="Ten widok powstaje w kolejnej turze implementacji."
      />
    </div>
  );
}

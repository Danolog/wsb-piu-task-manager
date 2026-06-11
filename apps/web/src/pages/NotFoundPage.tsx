import { Link } from 'react-router-dom';
import { MapPinOff } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <main className="flex min-h-full items-center justify-center bg-canvas p-6 text-ink">
      <div className="w-full max-w-md">
        <EmptyState
          icon={MapPinOff}
          title="404 — nie znaleziono strony"
          description="Strona, której szukasz, nie istnieje lub została przeniesiona."
          action={
            <Button asChild>
              <Link to="/">Wróć do listy zadań</Link>
            </Button>
          }
        />
      </div>
    </main>
  );
}

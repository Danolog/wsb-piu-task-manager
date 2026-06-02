import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

export function TasksPage() {
  return (
    <div className="min-h-full bg-canvas text-ink">
      <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-4">
        <span className="font-handwriting text-2xl">Zadania</span>
        <nav className="flex items-center gap-2">
          <Link to="/settings" className="text-sm text-ink-soft underline">
            Ustawienia
          </Link>
          <ThemeToggle />
        </nav>
      </header>
      <main className="p-6">
        <h1 className="text-base font-semibold">Lista zadań</h1>
        <p className="text-sm text-ink-muted">
          Lista zadań pojawi się tutaj (paczka P4).
        </p>
      </main>
    </div>
  );
}

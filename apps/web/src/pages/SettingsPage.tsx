import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

export function SettingsPage() {
  return (
    <div className="min-h-full bg-canvas text-ink">
      <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-4">
        <span className="font-handwriting text-2xl">Ustawienia</span>
        <Link to="/" className="text-sm text-ink-soft underline">
          Wróć do zadań
        </Link>
      </header>
      <main className="space-y-6 p-6">
        <section>
          <h1 className="text-base font-semibold">Motyw</h1>
          <p className="mb-3 text-sm text-ink-muted">
            Jasny, ciemny lub zgodny z ustawieniem systemu.
          </p>
          <ThemeToggle />
        </section>
        <section>
          <h2 className="text-base font-semibold">Kategorie</h2>
          <p className="text-sm text-ink-muted">
            Zarządzanie kategoriami pojawi się tutaj (paczka P7).
          </p>
        </section>
      </main>
    </div>
  );
}

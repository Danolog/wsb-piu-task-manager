import { AppShell } from '@/components/AppShell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CategoryManager } from '@/components/CategoryManager';

export function SettingsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
        <h1 className="mb-6 text-xl font-semibold">Ustawienia</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-base font-semibold">Motyw</h2>
            <p className="mb-3 text-sm text-ink-muted">
              Jasny, ciemny lub zgodny z ustawieniem systemu.
            </p>
            <ThemeToggle />
          </section>

          <section>
            <h2 className="mb-1 text-base font-semibold">Kategorie</h2>
            <p className="mb-3 text-sm text-ink-muted">
              Dodawaj, zmieniaj nazwę i kolor lub usuwaj kategorie. Usunięcie
              kategorii nie kasuje zadań — odpina ją tylko od przypisanych
              zadań.
            </p>
            <CategoryManager />
          </section>
        </div>
      </div>
    </AppShell>
  );
}

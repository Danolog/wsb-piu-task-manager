import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ListTodo, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: typeof ListTodo;
}

const NAV: NavItem[] = [
  { to: '/', label: 'Zadania', icon: ListTodo },
  { to: '/settings', label: 'Ustawienia', icon: Settings },
];

function navLinkClass(active: boolean): string {
  return cn(
    'flex items-center gap-2.5 rounded-[var(--radius-nav)] px-3 py-2 text-[15px] transition-colors',
    'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
    active
      ? 'bg-surface-alt font-medium text-ink'
      : 'text-ink-soft hover:bg-surface-alt hover:text-ink',
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Główna nawigacja">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) => navLinkClass(isActive)}
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

/**
 * Szkielet aplikacji: sidebar na desktopie (≥ md), topbar z szufladą (drawer) na mobile.
 * Drawer to Radix Dialog (focus trap + Esc gratis), pełna wysokość po lewej.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-full bg-canvas text-ink md:grid md:grid-cols-[15rem_1fr]">
      {/* Sidebar desktop */}
      <aside className="hidden border-r border-line bg-surface p-5 md:flex md:flex-col md:gap-6">
        <span className="font-handwriting text-2xl">Zadania</span>
        <NavList />
        <div className="mt-auto">
          <ThemeToggle />
        </div>
      </aside>

      {/* Topbar mobile */}
      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Otwórz menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
          <span className="font-handwriting text-xl">Zadania</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Drawer mobile */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent
          showCloseButton={false}
          className="fixed top-0 left-0 h-full max-w-[16rem] translate-x-0 translate-y-0 rounded-none rounded-r-xl p-5"
        >
          <DialogHeader>
            <DialogTitle className="font-handwriting text-2xl font-normal">
              Menu
            </DialogTitle>
            <DialogDescription className="sr-only">
              Nawigacja aplikacji
            </DialogDescription>
          </DialogHeader>
          <NavList onNavigate={() => setDrawerOpen(false)} />
        </DialogContent>
      </Dialog>

      <main className="min-w-0">{children}</main>
    </div>
  );
}

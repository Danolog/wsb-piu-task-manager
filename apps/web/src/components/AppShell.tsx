import { useMemo, type ReactNode } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useSearchParams,
} from 'react-router-dom';
import {
  ListTodo,
  CalendarRange,
  CheckCircle2,
  List,
  Search,
  User,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { useAppState } from '@/app/app-context';
import {
  selectVisibleTasks,
  selectStreak,
  defaultViewFilters,
  type DatePreset,
} from '@/features/tasks/store';
import { categoryDotClass } from '@/features/tasks/presentation';
import { cn } from '@/lib/utils';

/** Bieżący dzień YYYY-MM-DD (czas lokalny) — wspólne źródło dla liczników i serii. */
function todayISO(): string {
  const now = new Date();
  const year = now.getFullYear().toString().padStart(4, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Preset zliczany dla licznika w sidebarze (gdy ustawiony). */
  preset?: DatePreset;
  /** Pokaż w mobilnym tab-barze (Dziś/Lista/Szukaj/Ja). */
  mobile?: { label: string; icon: LucideIcon };
}

/**
 * Jedna tablica nawigacji dla obu układów. Desktop renderuje sekcję WIDOKI,
 * mobile renderuje tylko pozycje z `mobile`. Liczniki liczone z selektorów.
 */
const NAV_ITEMS: NavItem[] = [
  {
    to: '/dzis',
    label: 'Dziś',
    icon: ListTodo,
    preset: 'today',
    mobile: { label: 'Dziś', icon: ListTodo },
  },
  {
    to: '/wszystkie',
    label: 'Wszystkie',
    icon: List,
    preset: 'all',
    mobile: { label: 'Lista', icon: List },
  },
  {
    to: '/tydzien',
    label: 'Ten tydzień',
    icon: CalendarRange,
    preset: 'week',
  },
  {
    to: '/zrobione',
    label: 'Zrobione',
    icon: CheckCircle2,
    preset: 'done',
  },
  {
    to: '/szukaj',
    label: 'Szukaj',
    icon: Search,
    mobile: { label: 'Szukaj', icon: Search },
  },
  {
    to: '/ustawienia',
    label: 'Ja',
    icon: User,
    mobile: { label: 'Ja', icon: User },
  },
];

function viewLinkClass(active: boolean): string {
  return cn(
    'flex items-center justify-between gap-2.5 rounded-[var(--radius-nav)] px-3 py-2 text-[15px] transition-colors',
    'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
    active
      ? 'bg-cta font-medium text-cta-foreground'
      : 'text-ink-soft hover:bg-surface-alt hover:text-ink',
  );
}

/**
 * Slug kategorii dla parametru `?kat=` — id bez prefiksu `cat-`.
 * Lustrzane do `categoryIdFromParam` w AllTasksPage (`cat-${slug}`): seed
 * 'cat-studia' → 'studia', a kategorie usera 'cat-<uuid>' → '<uuid>'.
 * Wspólny, jeden mechanizm filtra — link sidebara, deep-link i chip czytają to samo.
 */
function categorySlug(categoryId: string): string {
  return categoryId.replace(/^cat-/, '');
}

function categoryLinkClass(active: boolean): string {
  return cn(
    'flex items-center justify-between gap-2.5 rounded-[var(--radius-nav)] px-3 py-1.5 text-[15px] transition-colors',
    'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
    active
      ? 'bg-surface-alt font-medium text-ink'
      : 'text-ink-soft hover:bg-surface-alt hover:text-ink',
  );
}

/** Lewy sidebar (desktop ≥ md): logo, WIDOKI z licznikami, KATEGORIE, karta usera. */
function Sidebar() {
  const { state } = useAppState();
  const today = todayISO();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Kategoria aktywna w sidebarze = jesteśmy na /wszystkie z pasującym ?kat=.
  // (NavLink.isActive porównuje tylko pathname, więc rozróżniamy kategorie sami.)
  const activeCatSlug =
    location.pathname === '/wszystkie' ? searchParams.get('kat') : null;

  // Liczniki dla pozycji WIDOKI — z tego samego selektora co listy widoków.
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of NAV_ITEMS) {
      if (item.preset) {
        map[item.to] = selectVisibleTasks(
          state,
          { ...defaultViewFilters, datePreset: item.preset },
          today,
        ).length;
      }
    }
    return map;
  }, [state, today]);

  // Liczba zadań per kategoria (bez kasowania — proste zliczanie).
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const task of Object.values(state.tasks)) {
      if (task.categoryId) {
        map[task.categoryId] = (map[task.categoryId] ?? 0) + 1;
      }
    }
    return map;
  }, [state.tasks]);

  const categories = useMemo(
    () => Object.values(state.categories),
    [state.categories],
  );

  const streak = useMemo(() => selectStreak(state, today), [state, today]);

  const viewItems = NAV_ITEMS.filter((item) => item.preset !== undefined);
  const userInitial = state.user.name.trim().charAt(0).toUpperCase() || '·';

  return (
    <aside className="hidden border-r border-line bg-surface p-5 md:flex md:flex-col md:gap-6">
      {/* Logo: „Task Manager" w foncie odręcznym (Caveat). Rozmiar dobrany tak, by
          pełna nazwa mieściła się w szerokości sidebara (16rem − padding 1.25rem×2
          ≈ 13.5rem) bez przycinania i bez zawijania — leading-none zbija interlinię. */}
      <span className="font-handwriting text-[1.65rem] leading-none text-ink">
        Task Manager
      </span>

      <nav className="flex flex-col gap-1" aria-label="Widoki">
        <p className="px-3 pb-1 text-xs font-medium tracking-wide text-ink-muted uppercase">
          Widoki
        </p>
        {viewItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => viewLinkClass(isActive)}
          >
            <span className="flex items-center gap-2.5">
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {label}
            </span>
            <span className="text-sm tabular-nums opacity-80">
              {counts[to] ?? 0}
            </span>
          </NavLink>
        ))}
      </nav>

      {categories.length > 0 ? (
        <div className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-xs font-medium tracking-wide text-ink-muted uppercase">
            Kategorie
          </p>
          <ul className="flex flex-col gap-1">
            {categories.map((category) => {
              const slug = categorySlug(category.id);
              const active = activeCatSlug === slug;
              return (
                <li key={category.id}>
                  {/* Link (nie NavLink): wszystkie kategorie celują w /wszystkie,
                      więc NavLink uznałby każdą za aktywną po samym pathname.
                      Aktywność rozróżniamy po ?kat= i ustawiamy aria-current sami. */}
                  <Link
                    to={`/wszystkie?kat=${encodeURIComponent(slug)}`}
                    className={categoryLinkClass(active)}
                    aria-current={active ? 'page' : undefined}
                    aria-label={`Kategoria ${category.name}, liczba zadań: ${
                      categoryCounts[category.id] ?? 0
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'size-2.5 shrink-0 rounded-full',
                          categoryDotClass(category.color),
                        )}
                        aria-hidden="true"
                      />
                      {category.name}
                    </span>
                    <span className="text-sm text-ink-muted tabular-nums">
                      {categoryCounts[category.id] ?? 0}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* Karta usera = wejście do Ustawień na desktopie (spójnie z Figmą D 20:2 —
          karta „Kasia" jest klikalna i prowadzi do /ustawienia). Mobile dociera
          do Ustawień przez tab-bar „Ja". Nazwa dostępna linku zawiera widoczne
          imię + serię (WCAG 2.5.3 label-in-name); ikona koła zębatego sygnalizuje
          cel wizualnie. */}
      <NavLink
        to="/ustawienia"
        className={({ isActive }) =>
          cn(
            'group/user mt-auto flex items-center gap-3 rounded-[var(--radius-field)] border border-line px-3 py-2.5 transition-colors',
            'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
            isActive
              ? 'border-ring bg-surface-alt'
              : 'bg-surface-alt hover:bg-surface',
          )
        }
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cta font-handwriting text-lg text-cta-foreground"
          aria-hidden="true"
        >
          {userInitial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">
            {state.user.name || 'Gość'}
          </span>
          <span className="block text-xs text-ink-muted">
            seria {streak} {streak === 1 ? 'dzień' : 'dni'}
          </span>
        </span>
        <Settings
          className="size-4 shrink-0 text-ink-muted transition-colors group-hover/user:text-ink"
          aria-hidden="true"
        />
        <span className="sr-only">Ustawienia</span>
      </NavLink>
    </aside>
  );
}

function tabLinkClass(active: boolean): string {
  return cn(
    'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors',
    'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
    active ? 'text-ink' : 'text-ink-muted hover:text-ink-soft',
  );
}

/** Dolny tab-bar (mobile < md): Dziś / Lista / Szukaj / Ja. */
function TabBar() {
  const mobileItems = NAV_ITEMS.filter((item) => item.mobile !== undefined);
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-surface md:hidden"
      aria-label="Nawigacja główna"
    >
      {mobileItems.map((item) => {
        const Icon = item.mobile!.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => tabLinkClass(isActive)}
          >
            <Icon className="size-5" aria-hidden="true" />
            {item.mobile!.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

/**
 * Szkielet aplikacji: lewy sidebar na desktopie (≥ md), dolny tab-bar na mobile (< md).
 * Obie nawigacje przez breakpoint (bez JS), wspólna tablica NAV_ITEMS.
 * Renderuje trasy potomne przez <Outlet> (layout-route).
 */
export function AppShell() {
  return (
    <div className="min-h-full bg-canvas text-ink md:grid md:grid-cols-[16rem_1fr]">
      <Sidebar />
      {/* pb-16 na mobile robi miejsce na fixed tab-bar; md zeruje. */}
      <main className="min-w-0 pb-16 md:pb-0">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}

/** Layout bez nawigacji — onboarding/splash. */
export function BareLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-full bg-canvas text-ink">
      {children ?? <Outlet />}
    </div>
  );
}

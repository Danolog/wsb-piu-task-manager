import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ViewFilters } from '@/features/tasks/store';

export interface StatusTabsProps {
  value: ViewFilters['status'];
  onChange: (value: ViewFilters['status']) => void;
}

// Aplikacja tworzy zadania jako 'todo' i przełącza je do 'done' — surface'ujemy te dwa + „Wszystkie".
const TABS: Array<{ value: ViewFilters['status']; label: string }> = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'todo', label: 'Do zrobienia' },
  { value: 'done', label: 'Zrobione' },
];

/** Filtr statusu zadań jako zakładki (Radix Tabs → obsługa strzałkami gratis). */
export function StatusTabs({ value, onChange }: StatusTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as ViewFilters['status'])}
    >
      <TabsList aria-label="Filtruj po statusie">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {/*
        Radix nadaje każdemu triggerowi aria-controls wskazujące na panel treści.
        Lista zadań renderuje się poza tym komponentem, więc panele są puste —
        ale MUSZĄ istnieć dla KAŻDEGO triggera (nie tylko aktywnego), inaczej
        aria-controls wskazuje na nieistniejący id (axe: aria-valid-attr-value,
        critical). forceMount = wszystkie panele w DOM; sr-only = poza layoutem.
      */}
      {TABS.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          forceMount
          className="sr-only"
        />
      ))}
    </Tabs>
  );
}

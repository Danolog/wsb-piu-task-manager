import { Button } from '@/components/ui/button';

export function TasksPage() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Zadania</h1>
      <p className="text-sm text-muted-foreground">
        Lista zadań pojawi się tutaj (paczka P4).
      </p>
      <Button className="mt-4">Przykładowy przycisk shadcn</Button>
    </main>
  );
}

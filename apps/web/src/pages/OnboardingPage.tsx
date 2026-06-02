import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAppState } from '@/app/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Onboarding (placeholder P-B): pole imienia + zapis user/setName.
 * Gate (RequireOnboarding) po ustawieniu imienia przekieruje na /dzis.
 * Pełny design (kafle kategorii, splash) powstaje w P-C.
 */
export function OnboardingPage() {
  const { dispatch } = useAppState();
  const [name, setName] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === '') return;
    dispatch({ type: 'user/setName', payload: { name: trimmed } });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <span className="mb-6 block text-center font-handwriting text-4xl text-ink">
          Task
        </span>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-name">Twoje imię</Label>
            <Input
              id="onboarding-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="np. Kasia"
              autoComplete="given-name"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={name.trim() === ''}
          >
            Zaczynamy
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </form>
      </div>
    </main>
  );
}

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAppState } from '@/app/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SplashScreen } from '@/components/SplashScreen';
import { OnboardingCategoryTiles } from '@/components/OnboardingCategoryTiles';

/** Czas trwania splashu mobilnego (ms) zanim sam zejdzie; klik skraca. */
const SPLASH_DURATION_MS = 1200;

/** Kategorie domyślnie zaznaczone w onboardingu (decyzja 11.4). */
const DEFAULT_SELECTED = ['cat-studia', 'cat-praca', 'cat-prywatne'];

/** Czy startujemy na mobile (< md = 768px). Jednorazowy odczyt — splash to brama, nie layout. */
function isMobileViewport(): boolean {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false;
  }
  return window.matchMedia('(max-width: 767px)').matches;
}

/**
 * Onboarding (P-C): splash mobilny → formularz imienia + kafle kategorii.
 * Po „Zaczynamy →" zapisuje imię (user/setName) i nawiguje na /dzis.
 * Splash pokazywany tylko na mobile (desktop pomija — D 24:2 wchodzi prosto w kartę).
 * Render w BareLayout (bez nawigacji).
 */
export function OnboardingPage() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const categories = Object.values(state.categories);

  // Splash widoczny tylko gdy weszliśmy na mobile; desktop od razu formularz.
  const [showSplash, setShowSplash] = useState<boolean>(() =>
    isMobileViewport(),
  );
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(DEFAULT_SELECTED),
  );
  const nameRef = useRef<HTMLInputElement>(null);

  // Splash sam schodzi po SPLASH_DURATION_MS; po jego zejściu fokus na pole imienia.
  useEffect(() => {
    if (!showSplash) {
      nameRef.current?.focus();
      return;
    }
    const timer = window.setTimeout(
      () => setShowSplash(false),
      SPLASH_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [showSplash]);

  function toggleCategory(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === '') return;
    // Zapisujemy imię. Odznaczonych kategorii NIE kasujemy (decyzja 11.4) —
    // wszystkie z seeda zostają dostępne w aplikacji niezależnie od wyboru tutaj.
    dispatch({ type: 'user/setName', payload: { name: trimmed } });
    navigate('/dzis', { replace: true });
  }

  if (showSplash) {
    return <SplashScreen onSkip={() => setShowSplash(false)} />;
  }

  const nameEmpty = name.trim() === '';

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[var(--radius-field)] border border-line bg-surface px-6 py-8 shadow-sm sm:px-8 sm:py-10">
        <span className="block font-handwriting text-4xl text-ink">Task</span>
        <span
          className="mt-1 mb-5 block h-0.5 w-10 rounded-full bg-category-green"
          aria-hidden="true"
        />

        <h1 className="text-lg font-semibold text-ink">
          Cześć! Jak masz na imię?
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Użyjemy go, żeby spersonalizować Twój dzień. Bez konta, bez maila —
          dane zostają na Twoim urządzeniu.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
          <div className="space-y-1.5">
            <Label
              htmlFor="onboarding-name"
              className="text-xs font-medium tracking-wide text-ink-muted uppercase"
            >
              Twoje imię
            </Label>
            <Input
              id="onboarding-name"
              ref={nameRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="np. Kasia"
              autoComplete="given-name"
              aria-describedby={nameEmpty ? 'onboarding-name-hint' : undefined}
            />
            {nameEmpty ? (
              <p id="onboarding-name-hint" className="text-xs text-ink-muted">
                Podaj imię, żeby przejść dalej.
              </p>
            ) : null}
          </div>

          <div className="space-y-2.5">
            <p
              id="onboarding-categories-label"
              className="text-xs font-medium tracking-wide text-ink-muted uppercase"
            >
              Wybierz kategorię
            </p>
            <OnboardingCategoryTiles
              categories={categories}
              selected={selected}
              onToggle={toggleCategory}
              aria-labelledby="onboarding-categories-label"
            />
          </div>

          <Button type="submit" className="h-11 w-full" disabled={nameEmpty}>
            Zaczynamy
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </form>
      </div>
    </main>
  );
}

/**
 * Splash mobilny (M 8:2): logo „Task" (Caveat) + zielona kreska + tagline.
 * Pokazywany krótko na wejściu w onboarding (mobile); desktop go pomija.
 * Czysto prezentacyjny — sterowanie czasem/pominięciem po stronie OnboardingPage.
 */
export function SplashScreen({ onSkip }: { onSkip?: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      aria-label="Pomiń ekran powitalny"
      className="flex min-h-dvh w-full flex-col items-center justify-center gap-3 bg-canvas px-6 text-center focus-visible:outline-none"
    >
      <span className="font-handwriting text-6xl text-ink">Task</span>
      <span
        className="h-0.5 w-12 rounded-full bg-category-green"
        aria-hidden="true"
      />
      <span className="text-sm text-ink-muted">Twój dzień, ułożony.</span>
    </button>
  );
}

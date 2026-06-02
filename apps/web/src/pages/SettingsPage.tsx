import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAppState } from '@/app/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  selectStreak,
  selectTodayProgress,
  DEFAULT_NOTIFICATIONS,
} from '@/features/tasks/store';
import { seedState } from '@/features/tasks/storage';
import { cn } from '@/lib/utils';

const APP_VERSION = '0.8';

function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear().toString().padStart(4, '0');
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

/** Wiersz ustawienia: etykieta + opis po lewej, kontrolka po prawej. */
function SettingRow({
  title,
  description,
  control,
  htmlFor,
}: {
  title: string;
  description?: string;
  control: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0">
        <Label
          htmlFor={htmlFor}
          className="block text-[15px] font-medium text-ink"
        >
          {title}
        </Label>
        {description ? (
          <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-medium tracking-wide text-ink-muted uppercase">
        {title}
      </h2>
      <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-field)] border border-line bg-surface">
        {children}
      </div>
    </section>
  );
}

/**
 * Ustawienia (desktop) / „Ja" (mobile) wg D 22:147 / M 15:60 / dark M 17:80.
 * Sekcje KONTO (imię edytowalne, resetuj dane), WYGLĄD (tryb ciemny, gęstość),
 * POWIADOMIENIA (atrapy — decyzja 11.7), APLIKACJA (wersja). Link do /kategorie.
 */
export function SettingsPage() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [editName, setEditName] = useState(false);
  const [nameDraft, setNameDraft] = useState(state.user.name);
  const [confirmReset, setConfirmReset] = useState(false);

  const today = todayISO();
  const streak = useMemo(() => selectStreak(state, today), [state, today]);
  const progress = useMemo(
    () => selectTodayProgress(state, today),
    [state, today],
  );

  const notifications = state.ui.notifications ?? DEFAULT_NOTIFICATIONS;
  // „Tryb ciemny" jako binarny przełącznik: efektywnie ciemny = theme 'dark'.
  const isDark = state.ui.theme === 'dark';
  const userInitial = state.user.name.trim().charAt(0).toUpperCase() || '·';

  function saveName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    dispatch({ type: 'user/setName', payload: { name: trimmed } });
    setEditName(false);
  }

  function resetData() {
    // Reset czyści zadania/kategorie do seeda, ale zachowuje imię i motyw
    // (użytkownik zostaje po onboardingu, nie wylogowuje się z aplikacji).
    const fresh = {
      ...seedState(),
      user: { name: state.user.name },
      ui: { theme: state.ui.theme, notifications },
    };
    dispatch({ type: 'state/reset', payload: { state: fresh } });
    setConfirmReset(false);
  }

  const darkSwitch = (
    <Switch
      checked={isDark}
      onCheckedChange={(checked) =>
        dispatch({
          type: 'ui/setTheme',
          payload: { theme: checked ? 'dark' : 'light' },
        })
      }
      aria-label="Tryb ciemny"
    />
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
      <h1 className="mb-6 font-handwriting text-3xl text-ink md:text-4xl">
        Ustawienia
      </h1>

      {/* Mobilna karta usera „Ja" — na desktopie zastępują ją sekcje poniżej. */}
      <div className="mb-6 flex items-center gap-3 rounded-[var(--radius-field)] border border-line bg-surface px-4 py-3.5 md:hidden">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-cta font-handwriting text-xl text-cta-foreground"
          aria-hidden="true"
        >
          {userInitial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium text-ink">
            {state.user.name || 'Gość'}
          </p>
          <p className="text-sm text-ink-muted">
            {progress.total}{' '}
            {plural(progress.total, 'zadanie', 'zadania', 'zadań')} dziś · seria{' '}
            {streak} {plural(streak, 'dzień', 'dni', 'dni')}
          </p>
        </div>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto shrink-0 p-0 text-category-teal"
          onClick={() => {
            setNameDraft(state.user.name);
            setEditName(true);
          }}
        >
          Edytuj
        </Button>
      </div>

      <div className="space-y-6">
        <SectionCard title="Konto">
          <SettingRow
            title="Imię"
            description="Wyświetlane w powitaniu"
            control={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1 text-ink-soft"
                onClick={() => {
                  setNameDraft(state.user.name);
                  setEditName(true);
                }}
              >
                {state.user.name || 'Ustaw'}
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            }
          />
          <SettingRow
            title="Resetuj dane"
            description="Wyczyść wszystkie zadania"
            control={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-danger hover:text-danger"
                onClick={() => setConfirmReset(true)}
              >
                Resetuj
              </Button>
            }
          />
        </SectionCard>

        <SectionCard title="Wygląd">
          <SettingRow
            title="Tryb ciemny"
            description={isDark ? 'Włączony' : 'Wygodniejszy wieczorem'}
            control={darkSwitch}
          />
          <SettingRow
            title="Gęstość listy"
            description="Standardowa"
            control={
              <span className="text-sm text-ink-muted" aria-hidden="true">
                <ChevronRight className="size-4" />
              </span>
            }
          />
        </SectionCard>

        <SectionCard title="Powiadomienia">
          <SettingRow
            title="Przypomnienia"
            description="O nadchodzących terminach"
            control={
              <Switch
                checked={notifications.reminders}
                onCheckedChange={(value) =>
                  dispatch({
                    type: 'ui/setNotification',
                    payload: { key: 'reminders', value },
                  })
                }
                aria-label="Przypomnienia o terminach"
              />
            }
          />
          <SettingRow
            title="Codzienne podsumowanie"
            description="Rano o 8:00"
            control={
              <Switch
                checked={notifications.dailySummary}
                onCheckedChange={(value) =>
                  dispatch({
                    type: 'ui/setNotification',
                    payload: { key: 'dailySummary', value },
                  })
                }
                aria-label="Codzienne podsumowanie"
              />
            }
          />
        </SectionCard>

        {/* Link do kategorii — sekcja Ja na mobile, dostępne też na desktopie. */}
        <SectionCard title="Organizacja">
          <button
            type="button"
            onClick={() => navigate('/kategorie')}
            className={cn(
              'flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-surface-alt',
              'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
            )}
          >
            <span className="text-[15px] font-medium text-ink">Kategorie</span>
            <ChevronRight
              className="size-4 text-ink-muted"
              aria-hidden="true"
            />
          </button>
        </SectionCard>

        <SectionCard title="Aplikacja">
          <SettingRow
            title="O aplikacji"
            description={`WSB-PIU Task Manager · wersja ${APP_VERSION}`}
            control={<span className="sr-only">Informacje o aplikacji</span>}
          />
        </SectionCard>
      </div>

      {/* Edycja imienia. */}
      <Dialog open={editName} onOpenChange={setEditName}>
        <DialogContent className="sm:max-w-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveName();
            }}
          >
            <DialogHeader>
              <DialogTitle>Twoje imię</DialogTitle>
              <DialogDescription>
                Pokazujemy je w powitaniu na kokpicie.
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 flex flex-col gap-1.5">
              <Label htmlFor="settings-name">Imię</Label>
              <Input
                id="settings-name"
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                maxLength={40}
                placeholder="Wpisz imię..."
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditName(false)}
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={!nameDraft.trim()}>
                Zapisz
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Potwierdzenie resetu danych. */}
      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Zresetować dane?</DialogTitle>
            <DialogDescription>
              Wszystkie zadania zostaną usunięte, a kategorie wrócą do
              domyślnych. Tej operacji nie można cofnąć.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmReset(false)}
            >
              Anuluj
            </Button>
            <Button type="button" variant="destructive" onClick={resetData}>
              Resetuj dane
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

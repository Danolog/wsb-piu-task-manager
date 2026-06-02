import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell, BareLayout } from '@/components/AppShell';
import { RequireOnboarding, RedirectIfOnboarded } from './RequireOnboarding';

// Code-splitting na poziomie tras: każdy widok ląduje w osobnym chunku,
// ładowanym dopiero przy wejściu na trasę.
const TasksPage = lazy(() =>
  import('@/pages/TasksPage').then((m) => ({ default: m.TasksPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);
const OnboardingPage = lazy(() =>
  import('@/pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
);
const PlaceholderPage = lazy(() =>
  import('@/pages/PlaceholderPage').then((m) => ({
    default: m.PlaceholderPage,
  })),
);

/** Minimalny fallback na czas doładowania chunku trasy (zwykle kilkadziesiąt ms). */
function RouteFallback() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-canvas text-ink-muted"
      role="status"
      aria-live="polite"
    >
      <span className="text-sm">Ładowanie…</span>
    </div>
  );
}

function withSuspense(node: ReactNode): ReactNode {
  return <Suspense fallback={<RouteFallback />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  // Onboarding poza AppShell; gdy imię już ustawione → /dzis.
  {
    path: '/onboarding',
    element: (
      <RedirectIfOnboarded>
        <BareLayout>{withSuspense(<OnboardingPage />)}</BareLayout>
      </RedirectIfOnboarded>
    ),
  },

  // Layout-route aplikacji: AppShell + bramka onboardingu dla wszystkich tras potomnych.
  {
    element: (
      <RequireOnboarding>
        <AppShell />
      </RequireOnboarding>
    ),
    children: [
      { index: true, element: <Navigate to="/dzis" replace /> },
      { path: 'dzis', element: withSuspense(<TasksPage />) },
      { path: 'wszystkie', element: withSuspense(<TasksPage />) },
      {
        path: 'tydzien',
        element: withSuspense(<PlaceholderPage title="Ten tydzień" />),
      },
      {
        path: 'zrobione',
        element: withSuspense(<PlaceholderPage title="Zrobione" />),
      },
      {
        path: 'szukaj',
        element: withSuspense(<PlaceholderPage title="Szukaj" />),
      },
      {
        path: 'kategorie',
        element: withSuspense(<PlaceholderPage title="Kategorie" />),
      },
      { path: 'ustawienia', element: withSuspense(<SettingsPage />) },
    ],
  },

  // Strony formularza — pełna strona (bez AppShell), ale za bramką onboardingu.
  {
    element: (
      <RequireOnboarding>
        <BareLayout />
      </RequireOnboarding>
    ),
    children: [
      {
        path: 'nowe',
        element: withSuspense(<PlaceholderPage title="Nowe zadanie" />),
      },
      {
        path: 'zadanie/:id',
        element: withSuspense(<PlaceholderPage title="Szczegóły zadania" />),
      },
    ],
  },

  { path: '*', element: withSuspense(<NotFoundPage />) },
]);

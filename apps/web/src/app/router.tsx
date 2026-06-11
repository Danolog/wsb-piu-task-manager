import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell, BareLayout } from '@/components/AppShell';
import { RequireOnboarding, RedirectIfOnboarded } from './RequireOnboarding';

// Code-splitting na poziomie tras: każdy widok ląduje w osobnym chunku,
// ładowanym dopiero przy wejściu na trasę.
const TodayPage = lazy(() =>
  import('@/pages/TodayPage').then((m) => ({ default: m.TodayPage })),
);
const AllTasksPage = lazy(() =>
  import('@/pages/AllTasksPage').then((m) => ({ default: m.AllTasksPage })),
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
const TaskFormPage = lazy(() =>
  import('@/pages/TaskFormPage').then((m) => ({ default: m.TaskFormPage })),
);
const TaskEditPage = lazy(() =>
  import('@/pages/TaskEditPage').then((m) => ({ default: m.TaskEditPage })),
);
const SearchPage = lazy(() =>
  import('@/pages/SearchPage').then((m) => ({ default: m.SearchPage })),
);
const CategoriesPage = lazy(() =>
  import('@/pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })),
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
      { path: 'dzis', element: withSuspense(<TodayPage />) },
      {
        path: 'wszystkie',
        element: withSuspense(<AllTasksPage preset="all" />),
      },
      {
        path: 'tydzien',
        element: withSuspense(<AllTasksPage preset="week" />),
      },
      {
        path: 'zrobione',
        element: withSuspense(<AllTasksPage preset="done" />),
      },
      {
        path: 'szukaj',
        element: withSuspense(<SearchPage />),
      },
      {
        path: 'kategorie',
        element: withSuspense(<CategoriesPage />),
      },
      { path: 'ustawienia', element: withSuspense(<SettingsPage />) },
      // Strony formularza w AppShell: desktop = sidebar + treść (D 133:2 / D 22:2);
      // mobile = pełna strona z nagłówkiem (M 13:2 / M 13:59).
      { path: 'nowe', element: withSuspense(<TaskFormPage />) },
      { path: 'zadanie/:id', element: withSuspense(<TaskEditPage />) },
    ],
  },

  { path: '*', element: withSuspense(<NotFoundPage />) },
]);

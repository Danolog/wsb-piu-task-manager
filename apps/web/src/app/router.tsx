import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Code-splitting na poziomie tras: każdy widok ląduje w osobnym chunku,
// ładowanym dopiero przy wejściu na trasę. Initial bundle = tylko shell + lista.
const TasksPage = lazy(() =>
  import('@/pages/TasksPage').then((m) => ({ default: m.TasksPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
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
  { path: '/', element: withSuspense(<TasksPage />) },
  { path: '/settings', element: withSuspense(<SettingsPage />) },
  { path: '*', element: withSuspense(<NotFoundPage />) },
]);

import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">404 — nie znaleziono</h1>
      <p className="text-sm">Taka strona nie istnieje.</p>
      <Link to="/" className="underline">
        Wróć do listy zadań
      </Link>
    </main>
  );
}

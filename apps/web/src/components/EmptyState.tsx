import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Pusty stan listy/widoku — ikona, tytuł, opis i opcjonalna akcja. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line bg-surface px-6 py-12 text-center"
      role="status"
    >
      <Icon className="size-8 text-ink-muted" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-ink">{title}</p>
        {description ? (
          <p className="text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface DeleteTaskDialogProps {
  open: boolean;
  /** Tytuł usuwanego zadania (do treści ostrzeżenia). */
  taskTitle?: string | undefined;
  onOpenChange: (open: boolean) => void;
  /** Wywołane po kliknięciu „Usuń zadanie" (czerwony) — dopiero to kasuje zadanie. */
  onConfirm: () => void;
}

/**
 * Modal potwierdzenia usunięcia zadania — wspólny dla edycji (TaskEditPage) i
 * usuwania koszem z listy (TaskCard / TaskTable). Jedno źródło prawdy dla treści
 * ostrzeżenia i akcji, dzięki czemu usuwanie koszem jest spójne z usuwaniem z
 * poziomu edycji (wzór D 22:2). Radix Dialog daje focus-trap + Esc + aria-modal.
 */
export function DeleteTaskDialog({
  open,
  taskTitle,
  onOpenChange,
  onConfirm,
}: DeleteTaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Usunąć zadanie?</DialogTitle>
          <DialogDescription>
            {taskTitle
              ? `Zadanie „${taskTitle}" zostanie usunięte. Tej operacji nie można cofnąć.`
              : 'Zadanie zostanie usunięte. Tej operacji nie można cofnąć.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Anuluj
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Usuń zadanie
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Wymiary z Figmy D 133-2 (field): px-15 py-13, border 1.5px, text 15px, radius 11px (rounded-lg).
        // Tło edytowalnego pola = białe (bg-field, dark: ciemny token) zgodnie z Figmą.
        "w-full min-w-0 rounded-lg border-[1.5px] border-input bg-field px-[15px] py-[13px] text-[15px] leading-normal transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-ink-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-alt disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }

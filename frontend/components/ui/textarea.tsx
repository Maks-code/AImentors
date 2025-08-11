import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Textarea с авто‑ростом минимальной высоты и общими стилями формы.
 */
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

// --------------------------------------------------------------------
// Чтобы компоненты корректно собирались, убедитесь, что имеется util-функция cn в  `@/lib/utils.ts`:
//
// import { ClassValue, clsx } from "clsx";
// import { twMerge } from "tailwind-merge";
// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }
// --------------------------------------------------------------------

// Экспорт по умолчанию не нужен; каждый компонент экспортируется поименовано.

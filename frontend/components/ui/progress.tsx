import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Значение 0-100 */
  value: number;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className,
  ...props
}) => (
  <div
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={100}
    className={cn("h-2 w-full rounded-full bg-muted", className)}
    {...props}
  >
    <div
      className="h-full rounded-full bg-primary transition-all"
      style={{ width: `${value}%` }}
    />
  </div>
);
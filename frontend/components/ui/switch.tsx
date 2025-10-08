import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>;

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-slate-200 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-sky-400 data-[state=checked]:to-indigo-400 dark:bg-slate-700/70 dark:data-[state=checked]:from-sky-500 dark:data-[state=checked]:to-violet-500",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className="pointer-events-none block h-5 w-5 translate-x-0 rounded-full bg-white shadow-[0_4px_14px_-6px_rgb(14,116,144)] transition-transform duration-200 ease-out data-[state=checked]:translate-x-5 dark:bg-slate-950"
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

// components/ui/Tooltip.tsx
"use client"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { ReactNode } from "react"

export function Tooltip({
  children,
  content,
}: {
  children: ReactNode
  content: ReactNode
}) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            sideOffset={5}
            className="bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-md z-50"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-gray-900" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
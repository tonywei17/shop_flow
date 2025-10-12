"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border border-[#d9d9d9] bg-white shadow-[0_1px_2px_rgba(17,17,17,0.08)] transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#00ac4d33] focus-visible:border-[#00ac4d] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 data-[state=checked]:border-[#00ac4d] data-[state=checked]:bg-[#00ac4d] data-[state=checked]:text-white",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="h-3 w-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }

"use client"

import * as React from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface NativeNumberSelectProps {
  value: number | string
  onValueChange: (value: string) => void
  min?: number
  max?: number
  placeholder?: string
  className?: string
  triggerClassName?: string
}

/**
 * Hybrid number selector:
 * - Mobile: native <select> (OS picker wheel on iOS / bottom sheet on Android)
 * - Desktop: Radix UI Select (custom styled dropdown)
 *
 * Solves the touch-scroll bug where Radix dropdowns with many items
 * cannot be scrolled on mobile devices.
 */
export default function NativeNumberSelect({
  value,
  onValueChange,
  min = 1,
  max = 30,
  placeholder = "-",
  className,
  triggerClassName,
}: NativeNumberSelectProps) {
  const options = React.useMemo(
    () => Array.from({ length: max - min + 1 }, (_, i) => min + i),
    [min, max]
  )

  return (
    <div className={cn("relative", className)}>
      {/* Native select: visible on mobile, hidden on md+ */}
      <select
        value={String(value || "")}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          "block md:hidden w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-sm",
          "ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "appearance-auto",
          triggerClassName
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((n) => (
          <option key={n} value={String(n)}>
            {n}
          </option>
        ))}
      </select>

      {/* Radix Select: hidden on mobile, visible on md+ */}
      <div className="hidden md:block">
        <Select
          value={String(value || "")}
          onValueChange={onValueChange}
        >
          <SelectTrigger className={cn("h-8 text-sm", triggerClassName)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

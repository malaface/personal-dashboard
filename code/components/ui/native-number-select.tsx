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
 * Number selector using Radix UI Select.
 * Mobile scroll is handled by the base Select component
 * (touch-pan-y + overscroll-contain + max-h fallback).
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
  )
}

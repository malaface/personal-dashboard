"use client"

import { useState, forwardRef } from "react"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(
            "pr-10",
            error && "border-red-500 dark:border-red-500",
            className
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    )
  }
)

PasswordInput.displayName = "PasswordInput"

export default PasswordInput

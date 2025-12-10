# react-ui-component-library

---
**version**: 1.0.0
**last_updated**: 2025-12-09
**category**: Frontend Stack
**priority**: ALTA
**dependencies**: shadcn/ui, tailwindcss@3.4.1, radix-ui@1.0.0
---

## 📖 Overview

Complete UI component library patterns using shadcn/ui, TailwindCSS, and Radix UI. Covers component installation, theming, forms, accessibility, and responsive design for the Personal Dashboard.

---

## 🎯 When to Invoke This Skill

**Auto-invoke when detecting**:
- Keywords: shadcn, form, Tailwind, dark mode, accessibility, responsive
- Code: className, cn(), shadcn add, react-hook-form
- Phrases: "create form", "add component", "style this", "make responsive"

**Manual invoke when**:
- Creating new UI components
- Implementing forms with validation
- Styling and theming
- Adding accessibility features
- Making responsive layouts

---

## 📦 Versions

- **shadcn/ui**: `latest` (components without fixed version)
- **TailwindCSS**: `3.4.1`
- **Radix UI**: `1.0.0` (base of shadcn/ui)
- **react-hook-form**: `7.49.3`
- **class-variance-authority (cva)**: `0.7.0`
- **clsx**: `2.1.0`
- **tailwind-merge**: `2.2.0`

---

## 🚨 Critical Rules (NEVER Break)

1. ❌ **NUNCA modificar componentes de shadcn/ui en node_modules**
   ```bash
   # ❌ MAL - modificar en node_modules
   vim node_modules/@radix-ui/...

   # ✅ BIEN - componentes se copian a /components/ui/
   npx shadcn-ui@latest add button
   # Ahora modifica: components/ui/button.tsx
   ```

2. ❌ **NUNCA usar clases conflictivas sin `cn()`**
   ```typescript
   // ❌ MAL - clases pueden conflictuar
   className={`${props.className} p-4 bg-white`}

   // ✅ BIEN - cn() merge correctamente
   import { cn } from '@/lib/utils'
   className={cn('p-4 bg-white', props.className)}
   ```

3. ❌ **NUNCA olvidar dark mode classes**
   ```typescript
   // ❌ MAL - solo light mode
   className="bg-white text-black"

   // ✅ BIEN - soporte dark mode
   className="bg-white dark:bg-gray-900 text-black dark:text-white"
   ```

4. ❌ **NUNCA usar colores hardcodeados**
   ```typescript
   // ❌ MAL
   className="text-[#000000] bg-[#ffffff]"

   // ✅ BIEN - usar theme tokens
   className="text-foreground bg-background"
   ```

5. ❌ **NUNCA ignorar responsive design**
   ```typescript
   // ❌ MAL - solo desktop
   className="grid grid-cols-3"

   // ✅ BIEN - mobile-first
   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
   ```

6. ❌ **NUNCA crear forms sin react-hook-form + Zod**
   ```typescript
   // ❌ MAL - manejo manual
   const [name, setName] = useState('')

   // ✅ BIEN - con react-hook-form
   const form = useForm<FormSchema>({
     resolver: zodResolver(formSchema)
   })
   ```

7. ✅ **SIEMPRE usar CVA** para variantes
8. ✅ **SIEMPRE incluir ARIA labels** en interactivos
9. ✅ **SIEMPRE usar forwardRef** en reutilizables
10. ✅ **SIEMPRE testear keyboard navigation**

---

## 📚 shadcn/ui Setup

### Installation

```bash
cd /home/badfaceserverlap/docker/contenedores/projects/personal-dashboard-project/code

# Initialize shadcn/ui
npx shadcn-ui@latest init

# Select options:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

### Adding Components

```bash
# Add individual components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
npx shadcn-ui@latest add toast

# Add multiple at once
npx shadcn-ui@latest add button input form card
```

### Component Location

```
components/
├── ui/              # shadcn components (editable)
│   ├── button.tsx
│   ├── input.tsx
│   ├── form.tsx
│   └── ...
└── ...              # Your custom components
```

---

## 🎨 TailwindCSS Configuration

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... más colores
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

### globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... más variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    /* ... más variables */
  }
}
```

---

## 🧩 Component Patterns

### Button Variants (CVA)

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
```

### Using Button

```typescript
import { Button } from '@/components/ui/button'

export default function Page() {
  return (
    <div className="space-x-2">
      <Button>Default</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost" size="sm">Small</Button>
      <Button size="icon">
        <IconPlus />
      </Button>
    </div>
  )
}
```

---

## 📋 Forms with react-hook-form

### Setup

```bash
npm install react-hook-form @hookform/resolvers zod
```

### Form Component

```typescript
// components/ui/form.tsx
import { useFormContext } from 'react-hook-form'

// shadcn provides full Form components
// npx shadcn-ui@latest add form
```

### Example: Workout Form

```typescript
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  exercises: z.string().min(10, 'Add at least one exercise'),
  duration: z.number().min(1).max(180),
})

type FormValues = z.infer<typeof formSchema>

export function WorkoutForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      exercises: '',
      duration: 30,
    },
  })

  async function onSubmit(data: FormValues) {
    // Submit to server
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workout Name</FormLabel>
              <FormControl>
                <Input placeholder="Morning Workout" {...field} />
              </FormControl>
              <FormDescription>
                Give your workout a descriptive name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="exercises"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exercises</FormLabel>
              <FormControl>
                <textarea
                  className="w-full rounded-md border p-2"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create Workout</Button>
      </form>
    </Form>
  )
}
```

---

## 🌗 Dark Mode Implementation

### Provider

```typescript
// components/theme-provider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

### Layout Integration

```typescript
// app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

### Theme Toggle

```typescript
'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

---

## 📱 Responsive Design Patterns

### Mobile-First Grid

```typescript
// Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
```

### Responsive Layout

```typescript
// components/DashboardLayout.tsx
export function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen">
      {/* Mobile: stacked, Desktop: sidebar */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full border-b md:w-64 md:border-b-0 md:border-r">
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Hide/Show on Breakpoints

```typescript
// Hidden on mobile, visible on desktop
<div className="hidden lg:block">Desktop only</div>

// Visible on mobile, hidden on desktop
<div className="block lg:hidden">Mobile only</div>

// Different content per breakpoint
<div>
  <span className="md:hidden">Small screen</span>
  <span className="hidden md:inline">Large screen</span>
</div>
```

---

## ♿ Accessibility Patterns

### ARIA Labels

```typescript
// Button with icon
<Button aria-label="Delete workout">
  <Trash className="h-4 w-4" />
</Button>

// Input field
<Input
  type="email"
  aria-label="Email address"
  aria-describedby="email-hint"
/>
<p id="email-hint" className="text-sm text-muted-foreground">
  We'll never share your email
</p>
```

### Keyboard Navigation

```typescript
// Dialog with keyboard support
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

export function WorkoutDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Edit Workout</DialogTitle>
        <DialogDescription>
          Make changes to your workout here
        </DialogDescription>
        {/* Content */}
      </DialogContent>
    </Dialog>
  )
}

// Automatically handles:
// - ESC to close
// - Tab to navigate
// - Focus trap
```

### Focus Management

```typescript
// Skip to main content
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Content */}
</main>
```

---

## 🎯 Common UI Patterns

### Card Grid

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function WorkoutGrid({ workouts }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {workouts.map(workout => (
        <Card key={workout.id}>
          <CardHeader>
            <CardTitle>{workout.name}</CardTitle>
            <CardDescription>
              {workout.exercises.length} exercises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{workout.duration} minutes</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### Data Table

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function WorkoutsTable({ workouts }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Exercises</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workouts.map(workout => (
          <TableRow key={workout.id}>
            <TableCell>{workout.name}</TableCell>
            <TableCell>{workout.duration}m</TableCell>
            <TableCell>{workout.exercises.length}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Toast Notifications

```typescript
import { useToast } from '@/components/ui/use-toast'

export function WorkoutActions() {
  const { toast } = useToast()

  const deleteWorkout = async () => {
    try {
      await api.deleteWorkout(id)
      toast({
        title: 'Workout deleted',
        description: 'The workout has been removed',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete workout',
        variant: 'destructive',
      })
    }
  }

  return <Button onClick={deleteWorkout}>Delete</Button>
}
```

---

## 🔗 Related Skills

- `nextjs-app-router-patterns` - Next.js integration
- `dashboard-dev-workflow` - Development workflow

---

## 📖 Additional Resources

- shadcn/ui: https://ui.shadcn.com/
- TailwindCSS: https://tailwindcss.com/docs
- Radix UI: https://www.radix-ui.com/
- react-hook-form: https://react-hook-form.com/

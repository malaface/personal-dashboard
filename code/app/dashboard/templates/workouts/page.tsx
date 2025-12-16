import { Metadata } from 'next'
import WorkoutTemplateManager from '@/components/templates/WorkoutTemplateManager'

export const metadata: Metadata = {
  title: 'Templates de Workout - Personal Dashboard',
  description: 'Gestiona tus templates de workout reutilizables'
}

export default function WorkoutTemplatesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <WorkoutTemplateManager />
    </div>
  )
}

import { Metadata } from 'next'
import MealTemplateManager from '@/components/templates/MealTemplateManager'

export const metadata: Metadata = {
  title: 'Templates de Comidas - Personal Dashboard',
  description: 'Gestiona tus templates de comidas reutilizables'
}

export default function MealTemplatesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <MealTemplateManager />
    </div>
  )
}

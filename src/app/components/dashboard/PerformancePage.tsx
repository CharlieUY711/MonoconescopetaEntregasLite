import { PerformanceCard } from './PerformanceCard';
import { PerformanceKPICards } from './PerformanceKPICards';

interface PerformancePageProps {
  userRole: 'operator' | 'client';
}

export function PerformancePage({ userRole }: PerformancePageProps) {
  return (
    <div className="space-y-4">
      {/* Sección superior: Título + KPI Cards en la misma línea */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 whitespace-nowrap">Rendimiento</h2>
        <PerformanceKPICards />
      </div>
      
      {/* Contenido adicional */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Métricas Detalladas</h3>
        <p className="text-sm text-muted-foreground">
          Análisis completo del rendimiento operativo y métricas de desempeño.
        </p>
      </div>
    </div>
  );
}
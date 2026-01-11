import { TrendingUp, Clock, Package, Star } from 'lucide-react';

interface PerformanceCardProps {
  userRole: 'operator' | 'client';
}

export function PerformanceCard({ userRole }: PerformanceCardProps) {
  const metrics = userRole === 'operator' 
    ? [
        { icon: TrendingUp, label: 'Entregas a tiempo', value: '94%', color: 'text-green-600' },
        { icon: Clock, label: 'Tiempo promedio', value: '45 min', color: 'text-blue-600' },
        { icon: Package, label: 'Entregas del mes', value: '847', color: 'text-primary' },
        { icon: Star, label: 'Satisfacción', value: '4.8/5', color: 'text-secondary' }
      ]
    : [
        { icon: Package, label: 'Mis entregas totales', value: '28', color: 'text-primary' },
        { icon: Clock, label: 'Tiempo de entrega', value: '42 min', color: 'text-blue-600' },
        { icon: Star, label: 'Mi calificación', value: '4.9/5', color: 'text-secondary' },
        { icon: TrendingUp, label: 'Entregas exitosas', value: '100%', color: 'text-green-600' }
      ];

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">
          {userRole === 'operator' ? 'Rendimiento general' : 'Mi resumen'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {userRole === 'operator' ? 'Métricas operativas del período' : 'Estadísticas de tus entregas'}
        </p>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-background ${metric.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{metric.label}</span>
              </div>
              <span className="text-lg font-bold">{metric.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
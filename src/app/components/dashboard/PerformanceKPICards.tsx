import { TrendingUp, Clock, Package, Star } from 'lucide-react';

export function PerformanceKPICards() {
  const kpiData = [
    {
      icon: TrendingUp,
      label: 'Entregas a tiempo',
      value: '94%',
      trend: '+2%',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Clock,
      label: 'Tiempo promedio',
      value: '45 min',
      trend: '-5 min',
      color: 'text-[#00A9CE]',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Package,
      label: 'Entregas del mes',
      value: '847',
      trend: '+12%',
      color: 'text-[#FF6B35]',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Star,
      label: 'Satisfacción',
      value: '4.8/5',
      trend: '+0.2',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div key={index} className="rounded-md border bg-card p-3 h-[64px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md bg-muted ${kpi.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-lg font-bold">{kpi.value}</p>
                </div>
              </div>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                {kpi.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

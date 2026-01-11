import { Package, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export function KPICards() {
  const kpiData = [
    {
      icon: Package,
      label: 'Total entregas',
      value: '45',
      trend: '+12%',
      color: 'text-primary'
    },
    {
      icon: Clock,
      label: 'En tránsito',
      value: '18',
      trend: '40%',
      color: 'text-secondary'
    },
    {
      icon: CheckCircle2,
      label: 'Completados hoy',
      value: '27',
      trend: '+8%',
      color: 'text-green-600'
    },
    {
      icon: TrendingUp,
      label: 'Eficiencia',
      value: '94%',
      trend: '+3%',
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div key={index} className="rounded-lg border bg-card p-3">
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

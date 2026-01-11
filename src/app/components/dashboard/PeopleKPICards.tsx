import { Users, CheckCircle, XCircle, Briefcase } from 'lucide-react';

export function PeopleKPICards() {
  const kpiData = [
    {
      icon: Users,
      label: 'Total personas',
      value: '15',
      trend: '100%',
      color: 'text-[#00A9CE]'
    },
    {
      icon: CheckCircle,
      label: 'Activas',
      value: '13',
      trend: '87%',
      color: 'text-green-600'
    },
    {
      icon: XCircle,
      label: 'Inactivas',
      value: '2',
      trend: '13%',
      color: 'text-red-600'
    },
    {
      icon: Briefcase,
      label: 'Roles',
      value: '4',
      trend: '+0%',
      color: 'text-[#FF6B35]'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
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

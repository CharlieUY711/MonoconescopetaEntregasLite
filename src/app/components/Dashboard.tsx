import { Sidebar } from './dashboard/Sidebar';
import { Topbar } from './dashboard/Topbar';
import { DashboardHome } from './dashboard/DashboardHome';
import { PerformancePage } from './dashboard/PerformancePage';
import { EntitiesPage } from './dashboard/EntitiesPage';
import { PeoplePage } from './dashboard/PeoplePage';
import { EntregasPage } from './dashboard/EntregasPage';
import { Route, Routes } from 'react-router-dom';

interface DashboardProps {
  userRole?: 'operator' | 'client';
  userName?: string;
}

export function Dashboard({ userRole = 'operator', userName = 'Usuario' }: DashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar userRole={userRole} userName={userName} />
      
      <main className="ml-64 pt-[94px] px-6 pb-6">
        <Routes>
          <Route index element={<DashboardHome userRole={userRole} />} />
          <Route path="entregas" element={<EntregasPage />} />
          <Route path="configuracion/rendimiento" element={<PerformancePage userRole={userRole} />} />
          <Route path="base-datos/entidades" element={<EntitiesPage />} />
          <Route path="base-datos/personas" element={<PeoplePage />} />
          <Route path="configuracion/reportes" element={<div className="text-muted-foreground">Reportes - Próximamente</div>} />
        </Routes>
      </main>
    </div>
  );
}
import { Sidebar } from './dashboard/Sidebar';
import { Topbar } from './dashboard/Topbar';
import { PerformancePage } from './dashboard/PerformancePage';
import { EntitiesPage } from './dashboard/EntitiesPage';
import { PeoplePage } from './dashboard/PeoplePage';
import { EntregasPage } from './dashboard/EntregasPage';
import { Route, Routes } from 'react-router-dom';
import { Component, type ReactNode } from 'react';

interface DashboardProps {
  userRole?: 'operator' | 'client';
  userName?: string;
}

// Error Boundary para capturar errores de renderizado
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class DashboardErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Dashboard] Error capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error en el Dashboard</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'Ocurrió un error inesperado'}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function Dashboard({ userRole = 'operator', userName = 'Usuario' }: DashboardProps) {
  console.log('[Dashboard] Renderizando...', { userRole, userName });
  
  return (
    <DashboardErrorBoundary>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <Topbar userRole={userRole} userName={userName} />
        
        <main className="ml-64 pt-[94px] px-6 pb-6">
          <Routes>
            {/* C) FIX: Inicio = Entregas - Ambas rutas muestran la misma vista */}
            <Route index element={<EntregasPage />} />
            <Route path="entregas" element={<EntregasPage />} />
            <Route path="configuracion/rendimiento" element={<PerformancePage userRole={userRole} />} />
            <Route path="base-datos/entidades" element={<EntitiesPage />} />
            <Route path="base-datos/personas" element={<PeoplePage />} />
            <Route path="configuracion/reportes" element={<div className="text-muted-foreground">Reportes - Próximamente</div>} />
          </Routes>
        </main>
      </div>
    </DashboardErrorBoundary>
  );
}

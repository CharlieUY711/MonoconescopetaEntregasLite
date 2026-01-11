import { Sidebar } from './dashboard/Sidebar';
import { Topbar } from './dashboard/Topbar';
import { PerformancePage } from './dashboard/PerformancePage';
import { EntitiesPage } from './dashboard/EntitiesPage';
import { PeoplePage } from './dashboard/PeoplePage';
import { EntregasPage } from './dashboard/EntregasPage';
import { FilesPage } from './dashboard/FilesPage';
import { ProfilePage } from './dashboard/ProfilePage';
import { EntityPage } from './dashboard/EntityPage';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Component, type ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
  const { isNewUser, clearNewUserFlag } = useAuth();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  console.log('[Dashboard] Renderizando...', { userRole, userName, isNewUser });
  
  // Verificar si necesitamos redirigir al perfil (solo para usuarios nuevos)
  useEffect(() => {
    if (isNewUser && location.pathname === '/dashboard') {
      console.log('[Dashboard] Usuario nuevo detectado, redirigiendo a Mi Perfil...');
      setShouldRedirect(true);
    }
  }, [isNewUser, location.pathname]);

  // Limpiar el flag cuando el usuario visita Mi Perfil
  useEffect(() => {
    if (isNewUser && location.pathname === '/dashboard/mi-cuenta/perfil') {
      console.log('[Dashboard] Usuario nuevo en Mi Perfil, limpiando flag...');
      clearNewUserFlag();
    }
  }, [isNewUser, location.pathname, clearNewUserFlag]);
  
  // Redirigir a Mi Perfil si es usuario nuevo
  if (shouldRedirect && location.pathname === '/dashboard') {
    return <Navigate to="/dashboard/mi-cuenta/perfil" replace />;
  }
  
  return (
    <DashboardErrorBoundary>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <Topbar userRole={userRole} userName={userName} />
        
        <main className="ml-64 pt-[94px] px-6 pb-6">
          <Routes>
            {/* Inicio - Para usuarios existentes */}
            <Route index element={<EntregasPage />} />
            <Route path="entregas" element={<EntregasPage />} />
            
            {/* Mi Cuenta */}
            <Route path="mi-cuenta/perfil" element={<ProfilePage />} />
            <Route path="mi-cuenta/entidad" element={<EntityPage />} />
            
            {/* Mis Datos (antes "Base de datos") */}
            <Route path="mis-datos/personas" element={<PeoplePage />} />
            <Route path="mis-datos/entidades" element={<EntitiesPage />} />
            <Route path="mis-datos/archivos" element={<FilesPage />} />
            
            {/* Rutas antiguas - compatibilidad */}
            <Route path="base-datos/entidades" element={<EntitiesPage />} />
            <Route path="base-datos/personas" element={<PeoplePage />} />
            
            {/* Configuración */}
            <Route path="configuracion/rendimiento" element={<PerformancePage userRole={userRole} />} />
            <Route path="configuracion/reportes" element={<div className="text-muted-foreground">Reportes - Próximamente</div>} />
          </Routes>
        </main>
      </div>
    </DashboardErrorBoundary>
  );
}

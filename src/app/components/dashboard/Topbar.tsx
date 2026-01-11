import { HelpCircle, Maximize2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useRole } from '../../state/role';
import { ROLES_SISTEMA, type RolSistema } from '../../data/catalogos';

interface TopbarProps {
  userRole?: 'operator' | 'client';
  userName?: string;
}

export function Topbar({ userRole, userName }: TopbarProps) {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [currentRole, setCurrentRole] = useRole();
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú de roles al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (role: RolSistema) => {
    setCurrentRole(role);
    setShowRoleMenu(false);
  };

  const getRoleColor = (role: RolSistema) => {
    switch (role) {
      case 'Administrador': return 'bg-orange-500';
      case 'Operador': return 'bg-cyan-500';
      case 'Usuario': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  // Función para volver atrás en el historial
  const handleGoBack = () => {
    navigate(-1);
  };

  // Función para ir al Home del dashboard
  const handleGoHome = () => {
    navigate('/');
  };

  // Función para actualizar/recargar la página
  const handleRefresh = () => {
    window.location.reload();
  };

  // Función para toggle pantalla completa
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-[70px] bg-[#00A9CE] flex items-center justify-end px-6 z-10 shadow-sm">
      {/* Role Switcher - Solo para desarrollo/demo */}
      <div className="relative mr-4" ref={roleMenuRef}>
        <button
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          title="Cambiar rol (desarrollo)"
        >
          <Users className="h-4 w-4 text-white" />
          <span className="text-sm text-white font-medium">{currentRole}</span>
          <span className={`w-2 h-2 rounded-full ${getRoleColor(currentRole)}`} />
        </button>

        {showRoleMenu && (
          <div className="absolute right-0 top-12 w-48 bg-white border rounded-lg shadow-lg z-20 py-1">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">
              Rol (Demo/Dev)
            </div>
            {ROLES_SISTEMA.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center justify-between ${
                  currentRole === role ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <span className="text-sm">{role}</span>
                {currentRole === role && (
                  <span className={`w-2 h-2 rounded-full ${getRoleColor(role)}`} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Iconos superiores derecha */}
      <div className="flex items-center gap-2">
        <button 
          onClick={handleGoBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Volver"
        >
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <button 
          onClick={handleGoHome}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Inicio"
        >
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>

        <button 
          onClick={handleRefresh}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Actualizar"
        >
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <button 
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Ayuda"
        >
          <HelpCircle className="h-5 w-5 text-white" />
        </button>

        <button 
          onClick={handleFullscreen}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Pantalla completa"
        >
          <Maximize2 className="h-5 w-5 text-white" />
        </button>
      </div>
    </header>
  );
}
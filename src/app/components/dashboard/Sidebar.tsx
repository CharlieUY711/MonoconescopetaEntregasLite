import { Home, Settings, LogOut, Database, ChevronDown, ChevronRight, User, Package } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logoOddy from '../../../assets/70a0244bfc2c569920c790f10f4bb1381608d99c.png';
import { useRole, canAccessDatabase, canAccessConfig } from '../../state/role';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

const menuItems = [
  { icon: Home, label: 'Inicio', path: '/dashboard' },
  { icon: Package, label: 'Entregas', path: '/dashboard/entregas' }
];

const databaseSubmenu = [
  { label: 'Entidades', path: '/dashboard/base-datos/entidades' },
  { label: 'Personas', path: '/dashboard/base-datos/personas' }
];

const configuracionSubmenu = [
  { label: 'Rendimiento', path: '/dashboard/configuracion/rendimiento' },
  { label: 'Reportes', path: '/dashboard/configuracion/reportes' }
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentRole] = useRole();
  const { user, profile } = useAuth();
  
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(
    location.pathname.startsWith('/dashboard/base-datos')
  );
  const [isConfigOpen, setIsConfigOpen] = useState(
    location.pathname.startsWith('/dashboard/configuracion')
  );

  // Usar perfil de Firebase si está disponible, sino el role switcher
  const isAuthenticated = Boolean(user && profile);
  const effectiveRole = isAuthenticated 
    ? (profile?.role === 'admin' ? 'Administrador' : profile?.role === 'client' ? 'Cliente' : 'Chofer')
    : currentRole;

  // Mostrar todos los menús para todos los usuarios
  const showDatabase = true;
  const showConfig = true;

  // Obtener nombre y rol para mostrar
  const getUserDisplayInfo = () => {
    // Si hay usuario autenticado, usar datos de Firebase
    if (isAuthenticated && user) {
      // Mapear roles de Firebase a roles del sistema (nunca usar "Cliente")
      const roleLabel = profile?.role === 'admin' ? 'Administrador' : 
                        profile?.role === 'client' ? 'Usuario' : 
                        profile?.role === 'driver_mock' ? 'Operador' : 'Usuario';
      return { 
        name: profile?.displayName || user.displayName || user.email?.split('@')[0] || 'Usuario', 
        role: roleLabel 
      };
    }
    
    // Fallback al role switcher (modo desarrollo)
    switch (currentRole) {
      case 'Administrador':
        return { name: 'Juan de los Palotes', role: 'Administrador, Oddy' };
      case 'Operador':
        return { name: 'Carlos Méndez', role: 'Operador, Oddy' };
      case 'Usuario':
        return { name: 'Almacenes del Sur', role: 'Usuario' };
      default:
        return { name: 'Usuario', role: 'Usuario' };
    }
  };

  const userInfo = getUserDisplayInfo();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#00A9CE] flex flex-col">
      {/* Logo y usuario en un solo bloque */}
      <div className="px-6 py-2">
        <div className="mb-4 flex justify-center">
          <img src={logoOddy} alt="ODDY" className="h-18 w-auto brightness-0 invert" />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userInfo.name}</p>
            <p className="text-xs text-white/80 truncate">{userInfo.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // C) FIX: Inicio y Entregas muestran la misma vista, ambos se activan según la ruta
          const isActive = item.path === '/dashboard' 
            ? (location.pathname === '/dashboard' || location.pathname === '/dashboard/')
            : location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 h-[48px] rounded-md transition-colors ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}

        {/* Base de datos con submenú - Solo visible para Administrador */}
        {showDatabase && (
          <div>
            <button
              onClick={() => setIsDatabaseOpen(!isDatabaseOpen)}
              className={`flex items-center gap-3 px-4 h-[48px] rounded-md transition-colors w-full ${
                location.pathname.startsWith('/dashboard/base-datos')
                  ? 'bg-white/20 text-white'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              <Database className="h-5 w-5" />
              <span className="text-sm flex-1 text-left">Base de datos</span>
              {isDatabaseOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {isDatabaseOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {databaseSubmenu.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 h-[40px] rounded-md transition-colors text-sm ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Configuración con submenú - Solo visible para Administrador */}
        {showConfig && (
          <div>
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={`flex items-center gap-3 px-4 h-[48px] rounded-md transition-colors w-full ${
                location.pathname.startsWith('/dashboard/configuracion')
                  ? 'bg-white/20 text-white'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm flex-1 text-left">Configuración</span>
              {isConfigOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {isConfigOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {configuracionSubmenu.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 h-[40px] rounded-md transition-colors text-sm ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="p-4">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 h-[48px] text-white/90 hover:bg-white/10 rounded-md transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
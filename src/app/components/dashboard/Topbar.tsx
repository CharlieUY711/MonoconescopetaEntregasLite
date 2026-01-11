import { Bell, User, Settings, HelpCircle, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface TopbarProps {
  userRole: 'operator' | 'client';
  userName: string;
}

export function Topbar({ userRole, userName }: TopbarProps) {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);

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
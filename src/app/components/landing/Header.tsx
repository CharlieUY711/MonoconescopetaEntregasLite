import { Link } from 'react-router-dom';
import logoOddy from '../../../assets/70a0244bfc2c569920c790f10f4bb1381608d99c.png';
import { ClientAccessInline } from './ClientAccessInline';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-24 items-center justify-between px-6">
        <Link to="/" className="flex items-center">
          <img src={logoOddy} alt="ODDY" className="h-16 w-auto" />
        </Link>
        
        {/* Nav + Acceso clientes en la misma linea */}
        <div className="hidden lg:flex items-center gap-8">
          <nav className="flex items-center gap-8">
            <a href="/#inicio" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
              Inicio
            </a>
            <a href="/#servicios" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
              Servicios
            </a>
            <a href="/#como-trabajamos" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
              Cómo trabajamos
            </a>
            <Link to="/institucional" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
              Institucional
            </Link>
            <a href="/#contacto" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
              Contacto
            </a>
          </nav>
          
          {/* Separador vertical */}
          <div className="h-6 w-px bg-border" />
          
          {/* Acceso clientes */}
          <ClientAccessInline />
        </div>
        
        {/* Nav mobile (sin acceso inline) */}
        <nav className="hidden md:flex lg:hidden items-center gap-8">
          <a href="/#inicio" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
            Inicio
          </a>
          <a href="/#servicios" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
            Servicios
          </a>
          <a href="/#como-trabajamos" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
            Cómo trabajamos
          </a>
          <Link to="/institucional" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
            Institucional
          </Link>
          <a href="/#contacto" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
            Contacto
          </a>
        </nav>

        {/* Botón mobile (fallback) */}
        <Link
          to="/dashboard"
          className="lg:hidden rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Acceso clientes
        </Link>
      </div>
    </header>
  );
}
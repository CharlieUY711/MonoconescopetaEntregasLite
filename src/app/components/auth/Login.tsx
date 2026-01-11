import { Link, useNavigate } from 'react-router-dom';
import logoOddy from '../../../assets/70a0244bfc2c569920c790f10f4bb1381608d99c.png';
import { useState } from 'react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulación de login - redirigir al dashboard
    if (email.includes('operador') || email.includes('admin')) {
      navigate('/dashboard');
    } else {
      navigate('/dashboard-cliente');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-6">
          <Link to="/" className="inline-block">
            <img src={logoOddy} alt="ODDY" className="h-20 w-auto mx-auto" />
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Acceso clientes</h1>
            <p className="text-muted-foreground">Acceso exclusivo para clientes de ODDY</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border bg-input-background px-4 py-3 outline-none focus:border-primary transition-colors"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border bg-input-background px-4 py-3 outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-3 text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Ingresar
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
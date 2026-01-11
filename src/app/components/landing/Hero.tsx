import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section id="inicio" className="container mx-auto px-6 py-20 md:py-28">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        <div className="space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Soluciones operativas para empresas que necesitan cumplir
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Delivery de última milla, almacenaje, armado de pedidos y servicios operativos, 
            gestionados de forma simple y confiable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Solicitar presupuesto
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 hover:bg-accent transition-colors"
            >
              Acceso clientes
            </a>
          </div>
        </div>
        
        <div className="relative aspect-square lg:aspect-auto lg:h-[500px]">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1685119166946-d4050647b0e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwbG9naXN0aWNzJTIwd2FyZWhvdXNlfGVufDF8fHx8MTc2Njk1NzY2N3ww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="ODDY Logística"
              className="h-full w-full object-cover rounded-lg opacity-90"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
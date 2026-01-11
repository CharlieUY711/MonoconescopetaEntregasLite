import { MessageSquare, FileSearch, CheckCircle2, TrendingUp, Settings } from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    title: 'Entendemos la necesidad',
    description: 'Escuchamos tu requerimiento y analizamos cómo podemos ayudarte'
  },
  {
    icon: FileSearch,
    title: 'Diseñamos la solución',
    description: 'Creamos un plan operativo adaptado a tu negocio'
  },
  {
    icon: CheckCircle2,
    title: 'Ejecutamos el servicio',
    description: 'Implementamos la solución con nuestro equipo profesional'
  },
  {
    icon: TrendingUp,
    title: 'Hacemos seguimiento',
    description: 'Monitoreamos la operación en tiempo real'
  },
  {
    icon: Settings,
    title: 'Optimizamos en el tiempo',
    description: 'Mejoramos continuamente el servicio según tus necesidades'
  }
];

export function HowItWorks() {
  return (
    <section id="como-trabajamos" className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">Cómo trabajamos</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un proceso simple y eficiente, diseñado para resultados concretos
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="h-10 w-10" />
                    <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

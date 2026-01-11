import { Building2, Store, Users } from 'lucide-react';

const segments = [
  {
    icon: Building2,
    title: 'Empresas',
    description: 'Soluciones escalables para operaciones complejas y de alto volumen'
  },
  {
    icon: Store,
    title: 'Comercios',
    description: 'Servicios adaptados a las necesidades de tu local o e-commerce'
  },
  {
    icon: Users,
    title: 'Organizaciones',
    description: 'Apoyo operativo para instituciones y entidades de cualquier escala'
  }
];

export function WhoIsItFor() {
  return (
    <section className="bg-muted/30 py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">¿Para quién es ODDY?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trabajamos con organizaciones de todas las escalas que necesitan cumplir con sus compromisos operativos
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {segments.map((segment, index) => {
            const Icon = segment.icon;
            return (
              <div
                key={index}
                className="text-center space-y-4 p-8 rounded-lg border bg-card hover:shadow-lg transition-all"
              >
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold">{segment.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{segment.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
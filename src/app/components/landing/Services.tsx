import { Truck, Package2, ClipboardList, Wrench, Settings } from 'lucide-react';

const services = [
  {
    icon: Truck,
    title: 'Entregas de última milla',
    description: 'Distribución urbana y regional. Entregas programadas y flexibles.'
  },
  {
    icon: Package2,
    title: 'Almacenaje',
    description: 'Guarda temporal de mercadería. Gestión de stock operativo.'
  },
  {
    icon: ClipboardList,
    title: 'Armado y gestión de paquetes',
    description: 'Picking, packing y preparación de pedidos. Control y trazabilidad.'
  },
  {
    icon: Wrench,
    title: 'Servicios de mantenimiento',
    description: 'Mantenimiento general. Soporte operativo para empresas.'
  },
  {
    icon: Settings,
    title: 'Servicios operativos a medida',
    description: 'Soluciones adaptadas a cada cliente. Soporte en picos de demanda.'
  }
];

export function Services() {
  return (
    <section id="servicios" className="bg-muted/30 py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">Nuestros servicios</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Soluciones operativas integrales para tu negocio
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group rounded-lg border bg-card p-8 hover:shadow-lg hover:border-primary/20 transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
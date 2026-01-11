import { Mail, ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section id="contacto" className="py-20 md:py-28 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 text-center space-y-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
          Dejá la operación en manos de un equipo que responde
        </h2>
        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
          Contactanos para conocer cómo podemos ayudar a tu negocio
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:admin@oddy.com.uy"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-primary px-6 py-3 hover:bg-white/90 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Solicitar presupuesto
          </a>
          <a
            href="mailto:admin@oddy.com.uy"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-transparent px-6 py-3 hover:bg-white/10 transition-colors"
          >
            Contactanos
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
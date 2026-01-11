import logoOddy from '../../../assets/70a0244bfc2c569920c790f10f4bb1381608d99c.png';

export function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="container mx-auto px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-2">
            <img src={logoOddy} alt="ODDY" className="h-10 w-auto" />
            <p className="text-muted-foreground max-w-md">
              Servicios operativos y logísticos para empresas que necesitan cumplir con sus compromisos.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:admin@oddy.com.uy" className="hover:text-foreground transition-colors">
                  admin@oddy.com.uy
                </a>
              </li>
              <li>
                <a href="tel:+59891234567" className="hover:text-foreground transition-colors">
                  +598 9 123 4567
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Términos de servicio
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacidad
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ODDY – Servicios operativos y logísticos. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
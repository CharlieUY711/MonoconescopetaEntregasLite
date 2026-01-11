/**
 * PAGINA INSTITUCIONAL - ODDY Entregas Lite V1
 * 
 * Pagina publica de documentos institucionales (politicas).
 * V1: Solo lectura (ver/descargar) para todos.
 * V2: Administracion para Admin (preparado, no expuesto).
 */

import { Eye, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from './landing/Header';
import { Footer } from './landing/Footer';
import { listDocs } from '../services/institutionalDocsService';

export function InstitutionalPage() {
  const docs = listDocs();

  /**
   * Descarga el documento
   */
  const handleDownload = (downloadUrl: string, fileName: string) => {
    if (downloadUrl && downloadUrl !== '#') {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        {/* Hero section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Institucional
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Documentos y politicas que rigen nuestro compromiso con la transparencia y la calidad
            </p>
          </div>
        </section>

        {/* Grid de documentos - mismo estilo que Servicios */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="group rounded-lg border bg-card p-8 hover:shadow-lg hover:border-primary/20 transition-all flex flex-col"
                >
                  {/* Icono */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-7 w-7 text-primary" />
                  </div>

                  {/* Titulo */}
                  <h3 className="text-xl font-semibold mb-3">{doc.title}</h3>

                  {/* Descripcion */}
                  <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                    {doc.description}
                  </p>

                  {/* Acciones: Ver y Descargar */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Link
                      to={`/institucional/${doc.id}`}
                      className="h-[35px] flex items-center gap-2 px-4 border border-[#00A9CE] text-[#00A9CE] rounded-[8px] hover:bg-[#00A9CE]/5 transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Link>
                    <button
                      onClick={() => handleDownload(doc.downloadUrl, doc.fileName)}
                      disabled={!doc.downloadUrl || doc.downloadUrl === '#'}
                      className="h-[35px] flex items-center gap-2 px-4 bg-[#00A9CE] text-white rounded-[8px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      <Download className="h-4 w-4" />
                      Descargar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

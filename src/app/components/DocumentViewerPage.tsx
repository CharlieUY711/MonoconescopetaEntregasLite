/**
 * PAGINA DE VISUALIZACION DE DOCUMENTO - ODDY Entregas Lite V1
 * 
 * Muestra el contenido de un documento institucional en formato HTML.
 */

import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Calendar } from 'lucide-react';
import { Header } from './landing/Header';
import { Footer } from './landing/Footer';
import { getDocById } from '../services/institutionalDocsService';

export function DocumentViewerPage() {
  const { docId } = useParams<{ docId: string }>();
  
  // Buscar el documento
  const doc = docId ? getDocById(docId) : undefined;

  // Si no existe el documento, redirigir a institucional
  if (!doc) {
    return <Navigate to="/institucional" replace />;
  }

  /**
   * Descarga el documento PDF
   */
  const handleDownload = () => {
    if (doc.downloadUrl && doc.downloadUrl !== '#') {
      const link = document.createElement('a');
      link.href = doc.downloadUrl;
      link.download = doc.fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Barra superior con navegacion */}
        <div className="bg-white border-b sticky top-24 z-40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link 
                to="/institucional" 
                className="h-[35px] flex items-center gap-2 px-4 text-gray-600 hover:text-gray-900 rounded-[8px] hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a Institucional
              </Link>
              
              <button
                onClick={handleDownload}
                disabled={!doc.downloadUrl || doc.downloadUrl === '#'}
                className="h-[35px] flex items-center gap-2 px-5 bg-[#00A9CE] text-white rounded-[8px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Contenido del documento */}
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Cabecera del documento */}
            <div className="bg-white rounded-[8px] shadow-sm border p-8 mb-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#00A9CE]/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-7 w-7 text-[#00A9CE]" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {doc.title}
                  </h1>
                  <p className="text-gray-600">{doc.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Actualizado: {doc.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{doc.id}</span>
                </div>
              </div>
            </div>

            {/* Cuerpo del documento */}
            <div className="bg-white rounded-[8px] shadow-sm border p-8">
              <div 
                className="prose prose-gray max-w-none
                  prose-headings:text-gray-900 prose-headings:font-semibold
                  prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
                  prose-p:text-gray-600 prose-p:leading-relaxed
                  prose-ul:my-4
                  prose-li:text-gray-600 prose-li:my-1
                  prose-strong:text-gray-900 prose-strong:font-semibold"
                dangerouslySetInnerHTML={{ __html: doc.content }}
              />
            </div>

            {/* Pie con acciones */}
            <div className="mt-8 flex items-center justify-between">
              <Link 
                to="/institucional" 
                className="h-[35px] flex items-center gap-2 px-4 text-gray-600 hover:text-gray-900 rounded-[8px] hover:bg-white border border-gray-200 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
              
              <button
                onClick={handleDownload}
                disabled={!doc.downloadUrl || doc.downloadUrl === '#'}
                className="h-[35px] flex items-center gap-2 px-5 bg-[#00A9CE] text-white rounded-[8px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

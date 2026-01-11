/**
 * FILES PAGE - ODDY Entregas Lite V1
 * 
 * Pagina de gestion de archivos e imagenes del usuario.
 * Muestra dos tarjetas: Archivos (PDFs, docs) e Imagenes.
 */

import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  Eye, 
  Download, 
  Trash2,
  Loader2,
  AlertCircle,
  File,
  Search,
  Plus,
  Filter,
  Printer
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '../ui/table';
import { useAuth } from '../../contexts/AuthContext';
import { FilesKPICards } from './FilesKPICards';
import { 
  getClientDocuments, 
  formatBytes, 
  formatDate,
  type ClientDocument,
  type DocumentsQuota
} from '../../services/clientDocumentsService';

// ============================================
// COMPONENTES AUXILIARES
// ============================================

interface DocumentsCardProps {
  title: string;
  icon: React.ReactNode;
  documents: ClientDocument[];
  quota: DocumentsQuota | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onView: (doc: ClientDocument) => void;
  onDownload: (doc: ClientDocument) => void;
  onDelete: (doc: ClientDocument) => void;
  onUpload: () => void;
}

function DocumentsCard({
  title,
  icon,
  documents,
  quota,
  loading,
  error,
  searchTerm,
  onView,
  onDownload,
  onDelete,
  onUpload
}: DocumentsCardProps) {
  // Filtrar documentos por termino de busqueda
  const filteredDocs = searchTerm 
    ? documents.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : documents;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>
          {quota ? (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Uso: {formatBytes(quota.usedBytes)} de {formatBytes(quota.quotaBytes)}</span>
                <span>{quota.percentage.toFixed(1)}%</span>
              </div>
              <Progress value={quota.percentage} className="h-1.5" />
            </div>
          ) : (
            <span className="text-xs">Uso: —</span>
          )}
        </CardDescription>
        <CardAction>
          <Button size="sm" onClick={onUpload}>
            <Upload className="h-4 w-4 mr-1" />
            Subir
          </Button>
        </CardAction>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cargando...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <File className="h-12 w-12 mb-2 opacity-50" />
            <p>{searchTerm ? 'Sin resultados' : `No hay ${title.toLowerCase()}`}</p>
            {!searchTerm && (
              <Button variant="link" onClick={onUpload} className="mt-2">
                Subir {title.toLowerCase().endsWith('s') ? title.toLowerCase().slice(0, -1) : title.toLowerCase()}
              </Button>
            )}
          </div>
        ) : (
          <div className="max-h-[350px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-20 text-right">Tamano</TableHead>
                  <TableHead className="w-24 text-center">Fecha</TableHead>
                  <TableHead className="w-28 text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium max-w-[200px] truncate" title={doc.name}>
                      {doc.name}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      {formatBytes(doc.size)}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground text-xs">
                      {formatDate(doc.uploadedAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => onView(doc)}
                          title="Ver"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => onDownload(doc)}
                          title="Descargar"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => onDelete(doc)}
                          title="Eliminar"
                          disabled
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// PAGINA PRINCIPAL
// ============================================

export function FilesPage() {
  const { user } = useAuth();
  
  const [files, setFiles] = useState<ClientDocument[]>([]);
  const [images, setImages] = useState<ClientDocument[]>([]);
  const [quota, setQuota] = useState<DocumentsQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cargar documentos al montar
  useEffect(() => {
    async function loadDocuments() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const result = await getClientDocuments(user.uid);
        setFiles(result.files);
        setImages(result.images);
        setQuota(result.quota);
      } catch (err) {
        console.error('[FilesPage] Error cargando documentos:', err);
        setError('Error al cargar los documentos');
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, [user]);

  // Handlers para acciones
  const handleView = (doc: ClientDocument) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    }
  };

  const handleDownload = (doc: ClientDocument) => {
    if (doc.url) {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = (doc: ClientDocument) => {
    console.log('[FilesPage] Delete requested for:', doc.id);
  };

  const handleUpload = () => {
    console.log('[FilesPage] Upload requested');
    alert('La funcion de subida estara disponible proximamente.');
  };

  const handleUploadFile = () => {
    console.log('[FilesPage] Upload file requested');
    alert('Subir archivo: proximamente');
  };

  const handleUploadImage = () => {
    console.log('[FilesPage] Upload image requested');
    alert('Subir imagen: proximamente');
  };

  // Calcular cuotas separadas
  const filesQuota: DocumentsQuota | null = quota ? {
    ...quota,
    usedBytes: files.reduce((acc, f) => acc + f.size, 0),
    percentage: Math.min(100, (files.reduce((acc, f) => acc + f.size, 0) / quota.quotaBytes) * 100)
  } : null;

  const imagesQuota: DocumentsQuota | null = quota ? {
    ...quota,
    usedBytes: images.reduce((acc, i) => acc + i.size, 0),
    percentage: Math.min(100, (images.reduce((acc, i) => acc + i.size, 0) / quota.quotaBytes) * 100)
  } : null;

  return (
    <div className="space-y-4">
      {/* Seccion superior: Titulo + KPI Cards */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 w-[150px] min-w-[150px] shrink-0">Archivos</h2>
        <FilesKPICards 
          files={files} 
          images={images} 
          quota={quota} 
          loading={loading} 
        />
      </div>

      {/* Barra de herramientas */}
      <div className="flex items-center gap-4 px-6 py-3 bg-[#FF6B35] rounded-md">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar archivos..."
              className="w-full h-[32px] pl-10 pr-4 border-0 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>

        {/* Botones a la derecha */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Subir Archivo */}
          <button
            onClick={handleUploadFile}
            className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Subir Archivo</span>
          </button>

          {/* Subir Imagen */}
          <button
            onClick={handleUploadImage}
            className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Subir Imagen</span>
          </button>

          {/* Filtrar */}
          <button className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filtrar</span>
          </button>

          {/* Imprimir */}
          <button className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors">
            <Printer className="h-4 w-4" />
            <span className="text-sm font-medium">Imprimir</span>
          </button>
        </div>
      </div>

      {/* Grid de 2 columnas con los repositorios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card Archivos */}
        <DocumentsCard
          title="Archivos"
          icon={<FileText className="h-5 w-5 text-blue-600" />}
          documents={files}
          quota={filesQuota}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          onView={handleView}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onUpload={handleUploadFile}
        />

        {/* Card Imagenes */}
        <DocumentsCard
          title="Imagenes"
          icon={<ImageIcon className="h-5 w-5 text-green-600" />}
          documents={images}
          quota={imagesQuota}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          onView={handleView}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onUpload={handleUploadImage}
        />
      </div>
    </div>
  );
}

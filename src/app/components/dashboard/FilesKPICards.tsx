/**
 * FILES KPI CARDS - ODDY Entregas Lite V1
 * 
 * Tarjetas KPI para la seccion de Archivos.
 * Muestra metricas de uso de almacenamiento.
 */

import { FileText, Image, HardDrive, Upload } from 'lucide-react';
import { formatBytes, type DocumentsQuota, type ClientDocument } from '../../services/clientDocumentsService';

interface FilesKPICardsProps {
  files: ClientDocument[];
  images: ClientDocument[];
  quota: DocumentsQuota | null;
  loading?: boolean;
}

export function FilesKPICards({ files, images, quota, loading }: FilesKPICardsProps) {
  const totalFiles = files.length + images.length;
  const filesSize = files.reduce((acc, f) => acc + f.size, 0);
  const imagesSize = images.reduce((acc, i) => acc + i.size, 0);
  const usedPercentage = quota ? quota.percentage.toFixed(0) : '—';
  
  const kpiData = [
    {
      icon: HardDrive,
      label: 'Uso Total',
      value: quota ? formatBytes(quota.usedBytes) : '—',
      trend: quota ? `${usedPercentage}% usado` : '—',
      color: 'text-[#00A9CE]',
      bgColor: 'bg-blue-100'
    },
    {
      icon: FileText,
      label: 'Archivos',
      value: loading ? '...' : String(files.length),
      trend: loading ? '—' : formatBytes(filesSize),
      color: 'text-[#FF6B35]',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Image,
      label: 'Imagenes',
      value: loading ? '...' : String(images.length),
      trend: loading ? '—' : formatBytes(imagesSize),
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Upload,
      label: 'Cuota',
      value: quota ? formatBytes(quota.quotaBytes) : '10 MB',
      trend: 'Limite',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div key={index} className="rounded-md border bg-card p-3 h-[64px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md bg-muted ${kpi.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-lg font-bold">{kpi.value}</p>
                </div>
              </div>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                {kpi.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

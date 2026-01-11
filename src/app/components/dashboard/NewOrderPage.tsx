import { useState } from 'react';
import { Save, X, Package, MapPin, FileText } from 'lucide-react';

export function NewOrderPage() {
  const [formData, setFormData] = useState({
    // Datos generales
    entity: 'Corporación ABC',
    requestPerson: 'Juan Pérez',
    serviceType: 'Entrega',
    priority: 'Normal',
    desiredDate: '',
    generalObservations: '',
    
    // Origen (Retiro)
    originPlace: '',
    originAddress: '',
    originContact: '',
    originPhone: '',
    
    // Destino (Entrega)
    destinationName: '',
    destinationAddress: '',
    destinationContact: '',
    destinationPhone: '',
    
    // Datos de la entrega
    contentDescription: '',
    packageQuantity: '',
    estimatedWeight: '',
    shipmentObservations: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Entregas — Nueva entrega</h2>
          <p className="text-muted-foreground">
            Alta manual de una nueva entrega
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos Generales */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Datos Generales</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Entidad *</label>
                <select
                  value={formData.entity}
                  onChange={(e) => handleInputChange('entity', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option>Corporación ABC</option>
                  <option>Logística del Sur</option>
                  <option>Almacenes Central</option>
                  <option>Comercial Norte</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Persona solicitante *</label>
                <select
                  value={formData.requestPerson}
                  onChange={(e) => handleInputChange('requestPerson', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option>Juan Pérez</option>
                  <option>María González</option>
                  <option>Carlos Rodríguez</option>
                  <option>Ana Martínez</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo de servicio *</label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => handleInputChange('serviceType', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option>Entrega</option>
                  <option>Retiro</option>
                  <option>Múltiple</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Prioridad *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option>Normal</option>
                  <option>Urgente</option>
                  <option>Programado</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha deseada *</label>
                <input
                  type="date"
                  value={formData.desiredDate}
                  onChange={(e) => handleInputChange('desiredDate', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Observaciones generales</label>
                <textarea
                  rows={3}
                  value={formData.generalObservations}
                  onChange={(e) => handleInputChange('generalObservations', e.target.value)}
                  placeholder="Notas generales sobre el pedido..."
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>
            </div>
          </div>

          {/* Origen (Retiro) */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Origen (Retiro)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nombre del lugar *</label>
                <input
                  type="text"
                  value={formData.originPlace}
                  onChange={(e) => handleInputChange('originPlace', e.target.value)}
                  placeholder="Nombre del comercio o lugar de retiro"
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Dirección *</label>
                <input
                  type="text"
                  value={formData.originAddress}
                  onChange={(e) => handleInputChange('originAddress', e.target.value)}
                  placeholder="Dirección completa de retiro"
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Persona de contacto *</label>
                <input
                  type="text"
                  value={formData.originContact}
                  onChange={(e) => handleInputChange('originContact', e.target.value)}
                  placeholder="Nombre del contacto"
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Teléfono *</label>
                <input
                  type="text"
                  value={formData.originPhone}
                  onChange={(e) => handleInputChange('originPhone', e.target.value)}
                  placeholder="+598 99 123 456"
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>
            </div>
          </div>

          {/* Destino (Entrega) */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Destino (Entrega)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nombre del destinatario *</label>
                <input
                  type="text"
                  value={formData.destinationName}
                  onChange={(e) => handleInputChange('destinationName', e.target.value)}
                  placeholder="Nombre completo del destinatario"
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Dirección *</label>
                <input
                  type="text"
                  value={formData.destinationAddress}
                  onChange={(e) => handleInputChange('destinationAddress', e.target.value)}
                  placeholder="Dirección completa de entrega"
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Persona de contacto *</label>
                <input
                  type="text"
                  value={formData.destinationContact}
                  onChange={(e) => handleInputChange('destinationContact', e.target.value)}
                  placeholder="Nombre del contacto"
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Teléfono *</label>
                <input
                  type="text"
                  value={formData.destinationPhone}
                  onChange={(e) => handleInputChange('destinationPhone', e.target.value)}
                  placeholder="+598 99 123 456"
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>
            </div>
          </div>

          {/* Datos de la Entrega */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Datos de la Entrega</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Descripción del contenido *</label>
                <input
                  type="text"
                  value={formData.contentDescription}
                  onChange={(e) => handleInputChange('contentDescription', e.target.value)}
                  placeholder="Ej: Documentos, paquetes, productos frágiles"
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Cantidad de bultos *</label>
                <input
                  type="number"
                  value={formData.packageQuantity}
                  onChange={(e) => handleInputChange('packageQuantity', e.target.value)}
                  placeholder="1"
                  min="1"
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Peso estimado (kg)</label>
                <input
                  type="number"
                  value={formData.estimatedWeight}
                  onChange={(e) => handleInputChange('estimatedWeight', e.target.value)}
                  placeholder="5"
                  min="0"
                  step="0.1"
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Observaciones de la entrega</label>
                <textarea
                  rows={3}
                  value={formData.shipmentObservations}
                  onChange={(e) => handleInputChange('shipmentObservations', e.target.value)}
                  placeholder="Notas especiales: frágil, requiere refrigeración, etc."
                  className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral - Resumen y acciones */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-card p-6 sticky top-6">
            <h3 className="text-lg font-semibold mb-6">Acciones</h3>

            <div className="space-y-4">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                <Save className="h-4 w-4" />
                Guardar pedido
              </button>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
                Cancelar
              </button>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-3">Estado del formulario</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Entidad:</span>
                  <span className={formData.entity ? 'text-green-600' : 'text-gray-400'}>
                    {formData.entity ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Servicio:</span>
                  <span className={formData.serviceType ? 'text-green-600' : 'text-gray-400'}>
                    {formData.serviceType ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className={formData.desiredDate ? 'text-green-600' : 'text-gray-400'}>
                    {formData.desiredDate ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Origen:</span>
                  <span className={formData.originAddress ? 'text-green-600' : 'text-gray-400'}>
                    {formData.originAddress ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Destino:</span>
                  <span className={formData.destinationAddress ? 'text-green-600' : 'text-gray-400'}>
                    {formData.destinationAddress ? '✓' : '○'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
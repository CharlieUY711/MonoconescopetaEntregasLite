import { KPICards } from './KPICards';
import { OrdersTable } from './OrdersTable';
import { Plus, Search, Edit, Download, Printer, Eye, Save, X, Package, User, MapPin, Truck, FileText } from 'lucide-react';
import { useState } from 'react';

interface DashboardHomeProps {
  userRole: 'operator' | 'client';
}

interface ColumnVisibility {
  id: boolean;
  client: boolean;
  destination: boolean;
  status: boolean;
  driver: boolean;
  vehicle: boolean;
  notes: boolean;
  actions: boolean;
}

interface OrderForm {
  id?: string;
  date: string;
  client: string;
  destination: string;
  status: string;
  driver: string;
  vehicle: string;
  internalNotes: string;
}

export function DashboardHome({ userRole }: DashboardHomeProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<ColumnVisibility>({
    id: true,
    client: true,
    destination: true,
    status: true,
    driver: false,  // Oculto por defecto
    vehicle: false, // Oculto por defecto
    notes: true,
    actions: true
  });

  const [orderForm, setOrderForm] = useState<OrderForm>({
    date: new Date().toISOString().split('T')[0],
    client: '',
    destination: '',
    status: 'Borrador',
    driver: '',
    vehicle: '',
    internalNotes: ''
  });

  // Datos de ejemplo para autocompletado
  const allSearchableData = [
    '#ENT-1234',
    '#ENT-1235',
    '#ENT-1236',
    '#ENT-1237',
    '#ENT-1238',
    '#ENT-1239',
    'Farmacia Central',
    'Supermercado Norte',
    'Restaurant La Esquina',
    'Tienda Electrónica',
    'Librería El Saber',
    'Ferretería Central',
    'Av. 18 de Julio 1234',
    'Bvar. Artigas 5678',
    'Colonia 987',
    'Mercedes 456',
    'Yi 234',
    'Canelones 789',
    'Carlos Méndez',
    'Ana Silva',
    'Juan Rodríguez',
    'María González',
    'En curso',
    'Recibido',
    'Confirmado',
    'En destino',
    'Borrador',
    'Cancelado'
  ];

  const filteredSuggestions = searchTerm
    ? allSearchableData.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const toggleColumn = (column: keyof ColumnVisibility) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleNewOrder = () => {
    setIsEditMode(false);
    setOrderForm({
      date: new Date().toISOString().split('T')[0],
      client: '',
      destination: '',
      status: 'Borrador',
      driver: '',
      vehicle: '',
      internalNotes: ''
    });
    setShowOrderForm(true);
  };

  const handleEditOrder = () => {
    // Aquí deberías obtener los datos de la orden seleccionada desde OrdersTable
    // Por ahora uso datos de ejemplo
    setIsEditMode(true);
    setOrderForm({
      id: '#ENT-1234',
      date: '2025-12-09',
      client: 'Juan Pérez',
      destination: 'Av. Principal 123',
      status: 'En curso',
      driver: 'Carlos López',
      vehicle: 'Camión A-123',
      internalNotes: 'Entrega urgente'
    });
    setShowOrderForm(true);
  };

  const handleSaveOrder = () => {
    console.log('Guardando entrega:', orderForm);
    setShowOrderForm(false);
  };

  const handleCancelForm = () => {
    setShowOrderForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Sección superior: Título + KPI Cards en la misma línea */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 whitespace-nowrap">Entregas</h2>
        <KPICards />
      </div>

      {/* Barra de herramientas */}
      <div className="flex items-center gap-4 px-6 py-3 bg-[#FF6B35] rounded-lg">
        {/* Buscador con autocompletado */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Buscar en esta vista..."
              className="w-full h-[35px] pl-10 pr-4 border-0 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          {/* Sugerencias de autocompletado */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botones a la derecha */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Botón Nuevo */}
          <button
            onClick={handleNewOrder}
            className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Nuevo</span>
          </button>

          {/* Botón Editar */}
          <button 
            onClick={handleEditOrder}
            className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span className="text-sm font-medium">Editar</span>
          </button>

          {/* Botón Exportar */}
          <button className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors">
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Exportar</span>
          </button>

          {/* Botón Imprimir */}
          <button className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors">
            <Printer className="h-4 w-4" />
            <span className="text-sm font-medium">Imprimir</span>
          </button>

          {/* Botón Vista (Columnas) */}
          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Vista</span>
            </button>

            {/* Menú desplegable de columnas */}
            {showColumnMenu && (
              <div className="absolute right-0 top-12 w-56 bg-card border rounded-lg shadow-lg z-10 p-2">
                <div className="text-xs font-medium text-muted-foreground px-3 py-2 border-b mb-2">
                  Mostrar columnas
                </div>
                
                <div className="space-y-1">
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns.id}
                      onChange={() => toggleColumn('id')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">ID</span>
                  </label>

                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns.client}
                      onChange={() => toggleColumn('client')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Cliente</span>
                  </label>

                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns.destination}
                      onChange={() => toggleColumn('destination')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Destino</span>
                  </label>

                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns.status}
                      onChange={() => toggleColumn('status')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Estado</span>
                  </label>

                  {userRole === 'operator' && (
                    <>
                      <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumns.driver}
                          onChange={() => toggleColumn('driver')}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Chofer</span>
                      </label>

                      <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumns.vehicle}
                          onChange={() => toggleColumn('vehicle')}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Vehículo</span>
                      </label>

                      <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumns.notes}
                          onChange={() => toggleColumn('notes')}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Notas</span>
                      </label>
                    </>
                  )}

                  {userRole === 'client' && (
                    <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.actions}
                        onChange={() => toggleColumn('actions')}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Acciones</span>
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de entregas - ancho completo */}
      <OrdersTable userRole={userRole} searchFilter={searchTerm} visibleColumns={visibleColumns} />

      {/* ESTADOS MUTUAMENTE EXCLUYENTES */}
      {showOrderForm ? (
        /* ESTADO 2: Formulario (oculta las tarjetas) */
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${isEditMode ? 'bg-blue-100' : 'bg-orange-100'}`}>
                {isEditMode ? (
                  <Edit className="h-5 w-5 text-[#00A9CE]" />
                ) : (
                  <Plus className="h-5 w-5 text-[#FF6B35]" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isEditMode ? 'Editar Entrega' : 'Nueva Entrega'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isEditMode ? `ID: ${orderForm.id}` : 'Complete los datos de la nueva entrega'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelForm}
                className="h-[35px] px-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveOrder}
                className="h-[35px] flex items-center gap-2 px-4 bg-[#00A9CE] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Save className="h-4 w-4" />
                {isEditMode ? 'Guardar Cambios' : 'Guardar'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={orderForm.date}
                  onChange={(e) => setOrderForm({ ...orderForm, date: e.target.value })}
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select
                  value={orderForm.status}
                  onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                >
                  <option>Borrador</option>
                  <option>Confirmado</option>
                  <option>En curso</option>
                  <option>En destino</option>
                  <option>Recibido</option>
                  <option>Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <input
                  type="text"
                  value={orderForm.client}
                  onChange={(e) => setOrderForm({ ...orderForm, client: e.target.value })}
                  placeholder="Nombre del cliente"
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destino *</label>
                <input
                  type="text"
                  value={orderForm.destination}
                  onChange={(e) => setOrderForm({ ...orderForm, destination: e.target.value })}
                  placeholder="Dirección de destino"
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              {userRole === 'operator' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conductor</label>
                    <input
                      type="text"
                      value={orderForm.driver}
                      onChange={(e) => setOrderForm({ ...orderForm, driver: e.target.value })}
                      placeholder="Nombre del conductor"
                      className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
                    <input
                      type="text"
                      value={orderForm.vehicle}
                      onChange={(e) => setOrderForm({ ...orderForm, vehicle: e.target.value })}
                      placeholder="Matrícula o identificador"
                      className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                    />
                  </div>
                </>
              )}
            </div>

            {userRole === 'operator' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas Internas</label>
                <textarea
                  rows={3}
                  value={orderForm.internalNotes}
                  onChange={(e) => setOrderForm({ ...orderForm, internalNotes: e.target.value })}
                  placeholder="Notas visibles solo para operadores..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ESTADO 1: Dos tarjetas de detalle (se ocultan al presionar Nuevo/Editar) */
        <div className="grid grid-cols-2 gap-4">
          {/* Tarjeta 1: Detalle de Entrega */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 rounded-lg bg-orange-100">
                <Package className="h-5 w-5 text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Detalle de Entrega</h3>
                <p className="text-xs text-muted-foreground">Información principal</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">ID</span>
                <span className="font-medium text-gray-900">#ENT-1234</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Cliente</span>
                <span className="font-medium text-gray-900">Empresa ABC S.A.</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Destino</span>
                <span className="font-medium text-gray-900">Av. Italia 2025, Montevideo</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Estado</span>
                <span className="font-medium text-green-600">En curso</span>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Información del Conductor (solo para operadores) */}
          {userRole === 'operator' && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Truck className="h-5 w-5 text-[#00A9CE]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Información del Conductor</h3>
                  <p className="text-xs text-muted-foreground">Datos operativos</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Conductor</span>
                  <span className="font-medium text-gray-900">Carlos Méndez</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Vehículo</span>
                  <span className="font-medium text-gray-900">ABC-1234</span>
                </div>

                <div className="flex items-start gap-4 text-sm">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600 w-32">Notas Internas</span>
                  <span className="font-medium text-gray-900">Cliente requiere firma del responsable en destino</span>
                </div>
              </div>
            </div>
          )}

          {/* Tarjeta 2 alternativa: Para clientes */}
          {userRole === 'client' && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-2 rounded-lg bg-blue-100">
                  <FileText className="h-5 w-5 text-[#00A9CE]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Información Adicional</h3>
                  <p className="text-xs text-muted-foreground">Detalles de la entrega</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Fecha</span>
                  <span className="font-medium text-gray-900">2025-01-15</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Hora estimada</span>
                  <span className="font-medium text-gray-900">14:30 - 16:00</span>
                </div>

                <div className="flex items-start gap-4 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600 w-32">Observaciones</span>
                  <span className="font-medium text-gray-900">Entrega programada para horario de tarde</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
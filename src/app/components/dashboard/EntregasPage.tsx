import { useState, useMemo, useRef, useEffect } from 'react';
import { Package, FileText, MapPin, User, ChevronUp, ChevronDown, Search, Plus, Edit, Filter, Download, Eye, X, Save, Check, Printer, Truck, Clock, CheckCircle2, History } from 'lucide-react';
import { EntregasKPICards } from './EntregasKPICards';
import { 
  ESTADOS_ENTREGA, 
  getColorEstadoEntrega,
  type EstadoEntrega
} from '../../data/catalogos';
import { useRole, canManageEntregas, isClientRole, MOCK_CLIENT_ID } from '../../state/role';
import { 
  mockEntregasData, 
  type Entrega, 
  addHistoryEvent, 
  formatTimestamp,
  getEventTypeLabel 
} from '../../data/entregas';

type SortColumn = keyof Entrega | null;
type SortDirection = 'asc' | 'desc';

interface ColumnVisibility {
  id: boolean;
  fecha: boolean;
  remitente: boolean;
  destinatario: boolean;
  direccion: boolean;
  estado: boolean;
}

export function EntregasPage() {
  // Estado de rol
  const [currentRole] = useRole();
  const showManageActions = canManageEntregas(currentRole);
  const isClient = isClientRole(currentRole);

  // Estado de entregas (mutable para simular cambios)
  const [entregas, setEntregas] = useState<Entrega[]>(mockEntregasData);
  
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);
  const [detailView, setDetailView] = useState<'entrega' | 'envio'>('entrega');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    id: true,
    fecha: true,
    remitente: true,
    destinatario: true,
    direccion: true,
    estado: true
  });

  // Estados para modales y popovers
  const [showNewForm, setShowNewForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Estados para filtros
  const [filterEstado, setFilterEstado] = useState<string[]>([]);
  const [filterFecha, setFilterFecha] = useState<string[]>([]);

  // Estados para formulario de nueva entrega
  const [newEntregaForm, setNewEntregaForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    remitente: '',
    destinatario: '',
    direccion: '',
    estado: 'Borrador',
    conductor: '',
    vehiculo: '',
    observaciones: ''
  });

  const [editEntregaForm, setEditEntregaForm] = useState<Entrega | null>(null);

  // Refs para cerrar menús al hacer clic fuera
  const columnsMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (columnsMenuRef.current && !columnsMenuRef.current.contains(event.target as Node)) {
        setShowColumnsMenu(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFiltersPanel(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar entregas según rol (Cliente solo ve sus entregas)
  const visibleEntregas = useMemo(() => {
    if (isClient) {
      return entregas.filter(e => e.ownerId === MOCK_CLIENT_ID);
    }
    return entregas;
  }, [entregas, isClient]);

  // Seleccionar primera entrega visible al cambiar de rol
  useEffect(() => {
    if (visibleEntregas.length > 0 && (!selectedEntrega || !visibleEntregas.find(e => e.id === selectedEntrega.id))) {
      setSelectedEntrega(visibleEntregas[0]);
    }
  }, [visibleEntregas, selectedEntrega]);

  // Datos para autocompletado
  const allSearchableData = useMemo(() => {
    const data: string[] = [];
    visibleEntregas.forEach(entrega => {
      data.push(entrega.id, entrega.remitente, entrega.destinatario, entrega.direccion, entrega.estado);
    });
    return [...new Set(data)];
  }, [visibleEntregas]);

  const filteredSuggestions = searchTerm
    ? allSearchableData.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8)
    : [];

  // Ordenamiento de entregas
  const sortedEntregas = useMemo(() => {
    let filtered = [...visibleEntregas];

    // Aplicar filtros
    if (filterEstado.length > 0) {
      filtered = filtered.filter(e => filterEstado.includes(e.estado));
    }

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.remitente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.destinatario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.estado.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar ordenamiento
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered.slice(0, 7); // Últimas 7 entregas
  }, [visibleEntregas, sortColumn, sortDirection, searchTerm, filterEstado]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (entrega: Entrega) => {
    setSelectedEntrega(entrega);
    // B) EDICIÓN DIRECTA: Al hacer click en fila, entrar en modo edición automáticamente
    if (showManageActions) {
      setEditEntregaForm({ ...entrega });
      setIsEditMode(true);
      setShowNewForm(true);
    } else {
      // Para clientes: solo mostrar detalle sin edición
      setShowNewForm(false);
    }
  };

  const handleNewEntrega = () => {
    setIsEditMode(false);
    setNewEntregaForm({
      fecha: new Date().toISOString().split('T')[0],
      remitente: '',
      destinatario: '',
      direccion: '',
      estado: 'Borrador',
      conductor: '',
      vehiculo: '',
      observaciones: ''
    });
    setShowNewForm(true);
  };

  const handleEditEntrega = () => {
    if (selectedEntrega) {
      setIsEditMode(true);
      setEditEntregaForm(selectedEntrega);
      setShowNewForm(true);
    }
  };

  const handleSaveEntrega = () => {
    if (isEditMode && editEntregaForm) {
      // A) FIX: Actualizar el array de entregas para que la tabla refleje los cambios
      const now = new Date().toISOString();
      const updatedEntregas = entregas.map(e => {
        if (e.id === editEntregaForm.id) {
          // Detectar si hubo cambio de estado
          const estadoCambio = e.estado !== editEntregaForm.estado;
          const newHistory = [...e.history];
          
          if (estadoCambio) {
            newHistory.push({
              type: 'STATUS_CHANGE',
              timestamp: now,
              description: `Estado: ${e.estado} → ${editEntregaForm.estado}`
            });
          }
          
          // Agregar evento de actualización general
          newHistory.push({
            type: 'UPDATED',
            timestamp: now,
            description: 'Registro actualizado'
          });
          
          return {
            ...editEntregaForm,
            history: newHistory
          };
        }
        return e;
      });
      
      setEntregas(updatedEntregas);
      
      // Actualizar selectedEntrega para reflejar cambios en detalle
      const updatedSelected = updatedEntregas.find(e => e.id === editEntregaForm.id);
      if (updatedSelected) {
        setSelectedEntrega(updatedSelected);
      }
    } else if (!isEditMode) {
      // Crear nueva entrega
      const now = new Date().toISOString();
      const newId = `ETG-${String(entregas.length + 1).padStart(3, '0')}`;
      const newEntrega: Entrega = {
        id: newId,
        fecha: newEntregaForm.fecha,
        remitente: newEntregaForm.remitente,
        destinatario: newEntregaForm.destinatario,
        direccion: newEntregaForm.direccion,
        estado: newEntregaForm.estado,
        conductor: newEntregaForm.conductor || '-',
        vehiculo: newEntregaForm.vehiculo || '-',
        observaciones: newEntregaForm.observaciones || '',
        ownerId: 'admin', // Por defecto, el admin crea
        history: [
          { type: 'CREATED', timestamp: now, description: 'Entrega creada' }
        ]
      };
      
      setEntregas(prev => [newEntrega, ...prev]);
      setSelectedEntrega(newEntrega);
    }
    
    setShowNewForm(false);
    setIsEditMode(false);
  };

  const handleCancelForm = () => {
    setShowNewForm(false);
    setIsEditMode(false);
  };

  const toggleColumnVisibility = (column: keyof ColumnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const handleFilterEstado = (estado: string) => {
    setFilterEstado(prev =>
      prev.includes(estado)
        ? prev.filter(e => e !== estado)
        : [...prev, estado]
    );
  };

  const clearFilters = () => {
    setFilterEstado([]);
    setFilterFecha([]);
  };

  // Función para confirmar recepción (acuse de recibo)
  const handleConfirmReceipt = () => {
    if (!selectedEntrega || selectedEntrega.estado !== 'En destino' || !isClient) {
      return;
    }

    const confirmed = window.confirm(
      `¿Confirmar la recepción de la entrega ${selectedEntrega.id}?\n\nEsta acción cambiará el estado a "Recibido".`
    );

    if (confirmed) {
      const now = new Date().toISOString();
      
      // Actualizar la entrega
      const updatedEntregas = entregas.map(e => {
        if (e.id === selectedEntrega.id) {
          const updated: Entrega = {
            ...e,
            estado: 'Recibido',
            acuseTimestamp: now,
            history: [
              ...e.history,
              { 
                type: 'CLIENT_CONFIRMED_RECEIPT', 
                timestamp: now, 
                description: 'Cliente confirmó recepción' 
              },
              { 
                type: 'STATUS_CHANGE', 
                timestamp: now, 
                description: 'Estado: En destino → Recibido' 
              }
            ]
          };
          return updated;
        }
        return e;
      });

      setEntregas(updatedEntregas);
      
      // Actualizar la entrega seleccionada
      const updatedSelected = updatedEntregas.find(e => e.id === selectedEntrega.id);
      if (updatedSelected) {
        setSelectedEntrega(updatedSelected);
      }
    }
  };

  // Verificar si puede mostrar botón de acuse de recibo
  const canShowReceiptButton = isClient && selectedEntrega?.estado === 'En destino';

  const getEstadoColor = (estado: string) => {
    const colors = getColorEstadoEntrega(estado);
    return `${colors.text} ${colors.bg}`;
  };

  const formData = isEditMode ? editEntregaForm : newEntregaForm;
  const setFormData = isEditMode ? setEditEntregaForm : setNewEntregaForm;

  return (
    <div className="space-y-4">
      {/* Sección superior: Título + KPI Cards */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 whitespace-nowrap">Entregas</h2>
        <EntregasKPICards />
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
          {/* Botón Nuevo - Solo para gestores (Admin/Chofer) */}
          {showManageActions && (
            <button
              onClick={handleNewEntrega}
              className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Nueva</span>
            </button>
          )}

          {/* Botón Editar - Solo para gestores (Admin/Chofer) */}
          {showManageActions && (
            <button 
              onClick={handleEditEntrega}
              disabled={!selectedEntrega}
              className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit className="h-4 w-4" />
              <span className="text-sm font-medium">Editar</span>
            </button>
          )}

          {/* Botón Exportar - Solo para gestores (Admin/Chofer) */}
          {showManageActions && (
            <div className="relative" ref={exportMenuRef}>
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">Exportar</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-12 w-48 bg-card border rounded-lg shadow-lg z-10 p-2">
                  <button className="w-full text-left px-4 py-2 hover:bg-muted rounded text-sm">
                    Exportar a Excel
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-muted rounded text-sm">
                    Exportar a PDF
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-muted rounded text-sm">
                    Exportar a CSV
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Botón Imprimir - Solo para gestores (Admin/Chofer) */}
          {showManageActions && (
            <button className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors">
              <Printer className="h-4 w-4" />
              <span className="text-sm font-medium">Imprimir</span>
            </button>
          )}

          {/* Botón Vista (Columnas) - Visible para todos */}
          <div className="relative" ref={columnsMenuRef}>
            <button
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Vista</span>
            </button>

            {showColumnsMenu && (
              <div className="absolute right-0 top-12 w-56 bg-card border rounded-lg shadow-lg z-10 p-2">
                <div className="text-xs font-medium text-muted-foreground px-3 py-2 border-b mb-2">
                  Mostrar columnas
                </div>
                
                <div className="space-y-1">
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columnVisibility.id}
                      onChange={() => toggleColumnVisibility('id')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">ID Entrega</span>
                  </label>

                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columnVisibility.fecha}
                      onChange={() => toggleColumnVisibility('fecha')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Fecha</span>
                  </label>

                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columnVisibility.remitente}
                      onChange={() => toggleColumnVisibility('remitente')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Remitente</span>
                  </label>

                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columnVisibility.destinatario}
                      onChange={() => toggleColumnVisibility('destinatario')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Destinatario</span>
                  </label>

                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columnVisibility.direccion}
                      onChange={() => toggleColumnVisibility('direccion')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Dirección</span>
                  </label>

                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columnVisibility.estado}
                      onChange={() => toggleColumnVisibility('estado')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Estado</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de entregas */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#00A9CE] border-b">
              <tr>
                <th className="px-3.5 h-[35px] text-left">
                  <input type="checkbox" className="rounded border-gray-400" />
                </th>
                
                {columnVisibility.id && (
                  <th 
                    className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      ID
                      {sortColumn === 'id' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 text-white" /> : <ChevronDown className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.fecha && (
                  <th 
                    className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('fecha')}
                  >
                    <div className="flex items-center gap-1">
                      FECHA
                      {sortColumn === 'fecha' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 text-white" /> : <ChevronDown className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.remitente && (
                  <th 
                    className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('remitente')}
                  >
                    <div className="flex items-center gap-1">
                      REMITENTE
                      {sortColumn === 'remitente' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 text-white" /> : <ChevronDown className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.destinatario && (
                  <th 
                    className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('destinatario')}
                  >
                    <div className="flex items-center gap-1">
                      DESTINATARIO
                      {sortColumn === 'destinatario' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 text-white" /> : <ChevronDown className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.direccion && (
                  <th 
                    className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('direccion')}
                  >
                    <div className="flex items-center gap-1">
                      DIRECCIÓN
                      {sortColumn === 'direccion' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 text-white" /> : <ChevronDown className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.estado && (
                  <th 
                    className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('estado')}
                  >
                    <div className="flex items-center gap-1">
                      ESTADO
                      {sortColumn === 'estado' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 text-white" /> : <ChevronDown className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedEntregas.map((entrega, index) => (
                <tr
                  key={entrega.id}
                  onClick={() => handleRowClick(entrega)}
                  className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } ${selectedEntrega?.id === entrega.id ? 'bg-blue-100' : ''}`}
                >
                  <td className="px-3.5 h-[35px]">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  {columnVisibility.id && (
                    <td className="px-3.5 h-[35px] text-sm text-gray-900">
                      {entrega.id}
                    </td>
                  )}
                  {columnVisibility.fecha && (
                    <td className="px-3.5 h-[35px] text-sm text-gray-900">
                      {entrega.fecha}
                    </td>
                  )}
                  {columnVisibility.remitente && (
                    <td className="px-3.5 h-[35px] text-sm text-gray-900">
                      {entrega.remitente}
                    </td>
                  )}
                  {columnVisibility.destinatario && (
                    <td className="px-3.5 h-[35px] text-sm text-gray-900">
                      {entrega.destinatario}
                    </td>
                  )}
                  {columnVisibility.direccion && (
                    <td className="px-3.5 h-[35px] text-sm text-gray-700">
                      {entrega.direccion}
                    </td>
                  )}
                  {columnVisibility.estado && (
                    <td className={`px-3.5 h-[35px] text-sm font-medium ${getEstadoColor(entrega.estado).split(' ')[0]}`}>
                      {entrega.estado}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formularios y vistas de detalle en la parte inferior */}
      {showNewForm ? (
        /* Formulario Nueva/Editar Entrega */
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
                  {isEditMode ? `ID: ${editEntregaForm?.id}` : 'Complete los datos de la nueva entrega'}
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
                onClick={handleSaveEntrega}
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
                  value={formData?.fecha || ''}
                  onChange={(e) => setFormData({ ...formData!, fecha: e.target.value })}
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select
                  value={formData?.estado || ''}
                  onChange={(e) => setFormData({ ...formData!, estado: e.target.value })}
                  className="w-full h-[35px] px-3 border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                >
                  {ESTADOS_ENTREGA.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remitente *</label>
                <input
                  type="text"
                  value={formData?.remitente || ''}
                  onChange={(e) => setFormData({ ...formData!, remitente: e.target.value })}
                  placeholder="Nombre del remitente"
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destinatario *</label>
                <input
                  type="text"
                  value={formData?.destinatario || ''}
                  onChange={(e) => setFormData({ ...formData!, destinatario: e.target.value })}
                  placeholder="Nombre del destinatario"
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Entrega *</label>
                <input
                  type="text"
                  value={formData?.direccion || ''}
                  onChange={(e) => setFormData({ ...formData!, direccion: e.target.value })}
                  placeholder="Dirección completa"
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conductor</label>
                <input
                  type="text"
                  value={formData?.conductor || ''}
                  onChange={(e) => setFormData({ ...formData!, conductor: e.target.value })}
                  placeholder="Nombre del conductor"
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
                <input
                  type="text"
                  value={formData?.vehiculo || ''}
                  onChange={(e) => setFormData({ ...formData!, vehiculo: e.target.value })}
                  placeholder="Matrícula del vehículo"
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                rows={3}
                value={formData?.observaciones || ''}
                onChange={(e) => setFormData({ ...formData!, observaciones: e.target.value })}
                placeholder="Notas adicionales sobre la entrega..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Dos tarjetas de detalle */
        <div className="grid grid-cols-2 gap-4">
          {/* Tarjeta 1: Detalle de la Entrega */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 rounded-lg bg-orange-100">
                <Package className="h-5 w-5 text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Detalle de la Entrega</h3>
                <p className="text-xs text-muted-foreground">Información principal</p>
              </div>
            </div>

            {selectedEntrega && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">ID Entrega</span>
                  <span className="font-medium text-gray-900">{selectedEntrega.id}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Fecha</span>
                  <span className="font-medium text-gray-900">{selectedEntrega.fecha}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Remitente</span>
                  <span className="font-medium text-gray-900">{selectedEntrega.remitente}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Destinatario</span>
                  <span className="font-medium text-gray-900">{selectedEntrega.destinatario}</span>
                </div>

                <div className="flex items-start gap-4 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600 w-32">Dirección</span>
                  <span className="font-medium text-gray-900">{selectedEntrega.direccion}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Estado</span>
                  <span className={`font-medium px-2 py-1 rounded-full text-xs ${getEstadoColor(selectedEntrega.estado)}`}>
                    {selectedEntrega.estado}
                  </span>
                </div>

                {/* Sección Acuse de Recibo */}
                <div className="pt-4 border-t mt-4">
                  <div className="flex items-center gap-4 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 w-32">Acuse de recibo</span>
                    <div className="flex items-center gap-2">
                      {selectedEntrega.acuseTimestamp ? (
                        <>
                          <span className="font-medium text-green-600 px-2 py-1 rounded-full text-xs bg-green-50">
                            Confirmado
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(selectedEntrega.acuseTimestamp)}
                          </span>
                        </>
                      ) : (
                        <span className="font-medium text-amber-600 px-2 py-1 rounded-full text-xs bg-amber-50">
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botón Marcar como Recibido - Solo Cliente + Estado "En destino" */}
                {canShowReceiptButton && (
                  <div className="pt-4 border-t mt-4">
                    <button
                      onClick={handleConfirmReceipt}
                      className="w-full h-[35px] flex items-center justify-center gap-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Marcar como recibido</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tarjeta 2: Información de la Entrega */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 rounded-lg bg-blue-100">
                <Truck className="h-5 w-5 text-[#00A9CE]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Información de la Entrega</h3>
                <p className="text-xs text-muted-foreground">Datos de transporte</p>
              </div>
            </div>

            {selectedEntrega && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Conductor</span>
                  <span className="font-medium text-gray-900">
                    {selectedEntrega.conductor || 'No asignado'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Vehículo</span>
                  <span className="font-medium text-gray-900">
                    {selectedEntrega.vehiculo || 'No asignado'}
                  </span>
                </div>

                <div className="flex items-start gap-4 text-sm">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600 w-32">Observaciones</span>
                  <span className="font-medium text-gray-900">
                    {selectedEntrega.observaciones || 'Sin observaciones'}
                  </span>
                </div>

                {/* Sección Historial */}
                <div className="pt-4 border-t mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <History className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">Historial</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {selectedEntrega.history && selectedEntrega.history.length > 0 ? (
                      [...selectedEntrega.history].reverse().map((event, index) => (
                        <div key={index} className="flex items-start gap-3 text-xs">
                          <div className="flex-shrink-0 mt-0.5">
                            <Clock className="h-3 w-3 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${
                                event.type === 'CLIENT_CONFIRMED_RECEIPT' 
                                  ? 'text-green-600' 
                                  : 'text-gray-700'
                              }`}>
                                {getEventTypeLabel(event.type)}
                              </span>
                              <span className="text-gray-400">
                                {formatTimestamp(event.timestamp)}
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-gray-500 mt-0.5">{event.description}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">Sin historial disponible</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
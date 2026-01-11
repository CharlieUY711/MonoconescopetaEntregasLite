import { useState, useMemo, useRef, useEffect } from 'react';
import { Package, FileText, MapPin, User, ChevronUp, ChevronDown, Search, Plus, Edit, Filter, Download, Eye, X, Save, Check, Printer, Truck } from 'lucide-react';
import { EntregasKPICards } from './EntregasKPICards';
import { 
  ESTADOS_ENTREGA, 
  getColorEstadoEntrega,
  type EstadoEntrega
} from '../../data/catalogos';

interface Entrega {
  id: string;
  fecha: string;
  remitente: string;
  destinatario: string;
  direccion: string;
  estado: string;
  conductor: string;
  vehiculo: string;
  observaciones: string;
}

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

const mockEntregas: Entrega[] = [
  { 
    id: 'ETG-001', 
    fecha: '2025-01-10',
    remitente: 'Corporación ABC', 
    destinatario: 'Almacenes del Sur', 
    direccion: 'Av. Brasil 2345, Montevideo',
    estado: 'En curso', 
    conductor: 'Carlos Méndez',
    vehiculo: 'ABC-1234',
    observaciones: 'Entrega urgente - Cliente preferencial'
  },
  { 
    id: 'ETG-002', 
    fecha: '2025-01-10',
    remitente: 'Distribuidora Norte', 
    destinatario: 'Comercial Este', 
    direccion: 'Bvar. Artigas 1234, Montevideo',
    estado: 'Confirmado', 
    conductor: 'Ana Silva',
    vehiculo: 'XYZ-5678',
    observaciones: 'Requiere firma del responsable'
  },
  { 
    id: 'ETG-003', 
    fecha: '2025-01-09',
    remitente: 'Logística Central', 
    destinatario: 'Farmacia Popular', 
    direccion: '18 de Julio 987, Montevideo',
    estado: 'Recibido', 
    conductor: 'Juan Rodríguez',
    vehiculo: 'LMN-9012',
    observaciones: 'Entrega realizada sin novedad'
  },
  { 
    id: 'ETG-004', 
    fecha: '2025-01-09',
    remitente: 'Importadora Global', 
    destinatario: 'Tienda Tecnológica', 
    direccion: 'Colonia 456, Montevideo',
    estado: 'Borrador', 
    conductor: '-',
    vehiculo: '-',
    observaciones: 'Esperando confirmación del destinatario'
  },
  { 
    id: 'ETG-005', 
    fecha: '2025-01-08',
    remitente: 'Comercial Sur', 
    destinatario: 'Supermercado Centro', 
    direccion: 'Mercedes 789, Montevideo',
    estado: 'En destino', 
    conductor: 'María González',
    vehiculo: 'RST-3456',
    observaciones: 'Mercadería refrigerada'
  },
  { 
    id: 'ETG-006', 
    fecha: '2025-01-08',
    remitente: 'Distribuidora Este', 
    destinatario: 'Restaurant La Esquina', 
    direccion: 'Yi 234, Montevideo',
    estado: 'Recibido', 
    conductor: 'Pedro Martínez',
    vehiculo: 'UVW-7890',
    observaciones: 'Entrega completada 14:30hs'
  },
  { 
    id: 'ETG-007', 
    fecha: '2025-01-07',
    remitente: 'Almacén Central', 
    destinatario: 'Ferretería Industrial', 
    direccion: 'Canelones 567, Montevideo',
    estado: 'Cancelado', 
    conductor: '-',
    vehiculo: '-',
    observaciones: 'Cancelado por cliente - Reprogramar'
  }
];

export function EntregasPage() {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(mockEntregas[0]);
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

  // Datos para autocompletado
  const allSearchableData = useMemo(() => {
    const data: string[] = [];
    mockEntregas.forEach(entrega => {
      data.push(entrega.id, entrega.remitente, entrega.destinatario, entrega.direccion, entrega.estado);
    });
    return [...new Set(data)];
  }, []);

  const filteredSuggestions = searchTerm
    ? allSearchableData.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8)
    : [];

  // Ordenamiento de entregas
  const sortedEntregas = useMemo(() => {
    let filtered = [...mockEntregas];

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
  }, [sortColumn, sortDirection, searchTerm, filterEstado]);

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
    setShowNewForm(false);
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
    console.log('Guardando entrega:', isEditMode ? editEntregaForm : newEntregaForm);
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
          {/* Botón Nuevo */}
          <button
            onClick={handleNewEntrega}
            className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Nueva</span>
          </button>

          {/* Botón Editar */}
          <button 
            onClick={handleEditEntrega}
            disabled={!selectedEntrega}
            className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit className="h-4 w-4" />
            <span className="text-sm font-medium">Editar</span>
          </button>

          {/* Botón Exportar */}
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

          {/* Botón Imprimir */}
          <button className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors">
            <Printer className="h-4 w-4" />
            <span className="text-sm font-medium">Imprimir</span>
          </button>

          {/* Botón Vista (Columnas) */}
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
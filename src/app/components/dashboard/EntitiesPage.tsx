import { useState, useMemo, useRef, useEffect } from 'react';
import { Building2, FileText, MapPin, User, ChevronUp, ChevronDown, Search, Plus, Edit, Filter, Download, Eye, X, Save, Check, Printer } from 'lucide-react';
import { EntitiesKPICards } from './EntitiesKPICards';
import { 
  TIPOS_ENTIDAD, 
  ESTADOS_REGISTRO, 
  getColorTipoEntidad, 
  getColorEstadoRegistro,
  type TipoEntidad,
  type EstadoRegistro
} from '../../data/catalogos';

interface Entity {
  id: string;
  name: string;
  type: string;
  status: string;
  fiscalId: string;
  address: string;
  email: string;
  phone: string;
  contact: string;
  observations: string;
}

type SortColumn = keyof Entity | null;
type SortDirection = 'asc' | 'desc';

interface ColumnVisibility {
  id: boolean;
  name: boolean;
  type: boolean;
  status: boolean;
  fiscalId: boolean;
  address: boolean;
}

const mockEntities: Entity[] = [
  { 
    id: 'ENT-001', 
    name: 'Corporación ABC', 
    type: 'Remitente', 
    status: 'Activo', 
    fiscalId: '211234560011', 
    address: 'Av. Brasil 2345, Montevideo',
    email: 'contacto@corpABC.com.uy',
    phone: '+598 2900 1234',
    contact: 'Juan Rodríguez',
    observations: 'Cliente preferencial - Descuento 15%'
  },
  { 
    id: 'ENT-002', 
    name: 'Logística del Sur', 
    type: 'Proveedor', 
    status: 'Activo', 
    fiscalId: '219876540012', 
    address: 'Bvar. Artigas 1234, Montevideo',
    email: 'info@logisticasur.com',
    phone: '+598 2908 5678',
    contact: 'María González',
    observations: 'Proveedor de transporte terrestre'
  },
  { 
    id: 'ENT-003', 
    name: 'Almacenes Central', 
    type: 'Destinatario', 
    status: 'Activo', 
    fiscalId: '215678900013', 
    address: '18 de Julio 987, Montevideo',
    email: 'ventas@almacencentral.uy',
    phone: '+598 2915 4321',
    contact: 'Pedro Martínez',
    observations: 'Requiere facturación electrónica'
  },
  { 
    id: 'ENT-004', 
    name: 'Transportes Unidos', 
    type: 'Proveedor', 
    status: 'Inactivo', 
    fiscalId: '213456780014', 
    address: 'Colonia 456, Montevideo',
    email: 'contacto@tunidos.com.uy',
    phone: '+598 2922 8765',
    contact: 'Laura Silva',
    observations: 'Contrato vencido - En renovación'
  },
  { 
    id: 'ENT-005', 
    name: 'Comercial Norte', 
    type: 'Remitente', 
    status: 'Activo', 
    fiscalId: '217890120015', 
    address: 'Mercedes 789, Montevideo',
    email: 'admin@comercialnorte.uy',
    phone: '+598 2933 1122',
    contact: 'Roberto Díaz',
    observations: 'Pagos a 30 días'
  },
  { 
    id: 'ENT-006', 
    name: 'Administración Interna', 
    type: 'Operador', 
    status: 'Activo', 
    fiscalId: '210000000016', 
    address: 'Oficina Central ODDY',
    email: 'admin@oddy.com.uy',
    phone: '+598 2940 0000',
    contact: 'Sistema ODDY',
    observations: 'Uso interno exclusivo'
  }
];

export function EntitiesPage() {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(mockEntities[0]);
  const [detailView, setDetailView] = useState<'informacion' | 'contacto'>('informacion');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    id: true,
    name: true,
    type: true,
    status: true,
    fiscalId: true,
    address: true
  });

  // Estados para modales y popovers
  const [showNewForm, setShowNewForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Estados para filtros
  const [filterType, setFilterType] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  
  // Cantidad de registros a mostrar por defecto (configurable)
  const [pageSize, setPageSize] = useState(6);

  // Estados para formulario de nueva entidad
  const [newEntityForm, setNewEntityForm] = useState({
    name: '',
    type: 'Cliente',
    status: 'Activo',
    fiscalId: '',
    address: '',
    email: '',
    phone: '',
    contact: '',
    observations: ''
  });

  const [editEntityForm, setEditEntityForm] = useState<Entity | null>(null);

  // Refs para cerrar menús al hacer clic fuera
  const columnsMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnsMenuRef.current && !columnsMenuRef.current.contains(event.target as Node)) {
        setShowColumnsMenu(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFiltersPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ChevronUp className="h-3 w-3 text-gray-400 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-3 w-3 text-[#00A9CE]" />
      : <ChevronDown className="h-3 w-3 text-[#00A9CE]" />;
  };

  const sortedEntities = useMemo(() => {
    if (!sortColumn) return mockEntities;

    return [...mockEntities].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortColumn, sortDirection]);

  const filteredEntities = useMemo(() => {
    let entities = sortedEntities;

    // Filtro de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      entities = entities.filter(entity => 
        entity.id.toLowerCase().includes(searchLower) ||
        entity.name.toLowerCase().includes(searchLower) ||
        entity.type.toLowerCase().includes(searchLower) ||
        entity.status.toLowerCase().includes(searchLower) ||
        entity.fiscalId.toLowerCase().includes(searchLower) ||
        entity.address.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por tipo
    if (filterType.length > 0) {
      entities = entities.filter(entity => filterType.includes(entity.type));
    }

    // Filtro por estado
    if (filterStatus.length > 0) {
      entities = entities.filter(entity => filterStatus.includes(entity.status));
    }

    // Limitar a pageSize registros
    return entities.slice(0, pageSize);
  }, [sortedEntities, searchTerm, filterType, filterStatus, pageSize]);

  const suggestions = useMemo(() => {
    const allSuggestions = [
      ...mockEntities.map(e => e.name),
      ...mockEntities.map(e => e.type),
      'Activo',
      'Inactivo'
    ];
    return [...new Set(allSuggestions)];
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    return suggestions.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
  }, [searchTerm, suggestions]);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const handleNewEntity = () => {
    setIsEditMode(false);
    setNewEntityForm({
      name: '',
      type: 'Cliente',
      status: 'Activo',
      fiscalId: '',
      address: '',
      email: '',
      phone: '',
      contact: '',
      observations: ''
    });
    setShowNewForm(true);
  };

  const handleEditEntity = () => {
    if (selectedEntity) {
      setIsEditMode(true);
      setNewEntityForm({
        name: selectedEntity.name,
        type: selectedEntity.type,
        status: selectedEntity.status,
        fiscalId: selectedEntity.fiscalId,
        address: selectedEntity.address,
        email: selectedEntity.email,
        phone: selectedEntity.phone,
        contact: selectedEntity.contact,
        observations: selectedEntity.observations
      });
      setShowNewForm(true);
    }
  };

  const handleSaveForm = () => {
    if (isEditMode) {
      console.log('Guardando edición de entidad:', newEntityForm);
    } else {
      console.log('Guardando nueva entidad:', newEntityForm);
    }
    setShowNewForm(false);
    setIsEditMode(false);
    setNewEntityForm({
      name: '',
      type: 'Cliente',
      status: 'Activo',
      fiscalId: '',
      address: '',
      email: '',
      phone: '',
      contact: '',
      observations: ''
    });
  };

  const handleToggleFilterType = (type: string) => {
    setFilterType(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleToggleFilterStatus = (status: string) => {
    setFilterStatus(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handleApplyFilters = () => {
    setShowFiltersPanel(false);
  };

  const handleClearFilters = () => {
    setFilterType([]);
    setFilterStatus([]);
  };

  const handleToggleColumn = (column: keyof ColumnVisibility) => {
    setColumnVisibility(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const handleExport = (format: string) => {
    console.log(`Exportando datos en formato: ${format}`);
    setShowExportMenu(false);
  };

  const getStatusColor = (status: string) => getColorEstadoRegistro(status);
  const getTypeColor = (type: string) => getColorTipoEntidad(type);

  return (
    <div className="space-y-4">
      {/* Sección superior: Título + KPI Cards en la misma línea */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 w-[150px] min-w-[150px] shrink-0">Entidades</h2>
        <EntitiesKPICards />
      </div>

      {/* Barra de herramientas naranja */}
      <div className="flex items-center gap-4 px-6 py-3 bg-[#FF6B35] rounded-md">
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
              className="w-full h-[32px] pl-10 pr-4 border-0 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          {/* Sugerencias de autocompletado */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-card border rounded-md shadow-lg max-h-64 overflow-y-auto">
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

          {/* Mensaje de sin resultados */}
          {searchTerm && filteredEntities.length === 0 && (
            <div className="absolute z-20 w-full mt-1 bg-card border rounded-md shadow-lg p-4">
              <p className="text-sm text-muted-foreground text-center">
                No se encontraron resultados para "{searchTerm}"
              </p>
            </div>
          )}
        </div>

        {/* Botones a la derecha - Orden: Nuevo, Editar, Importar, Exportar, Imprimir, Vista */}
        <div className="flex items-center gap-4 ml-auto">
          {/* 1. Botón Nuevo */}
          <button 
            onClick={handleNewEntity}
            className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Nuevo</span>
          </button>

          {/* 2. Botón Editar */}
          <button 
            onClick={handleEditEntity}
            disabled={!selectedEntity}
            className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit className="h-4 w-4" />
            <span className="text-sm font-medium">Editar</span>
          </button>

          {/* 3. Botón Importar */}
          <button className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors">
            <Download className="h-4 w-4 rotate-180" />
            <span className="text-sm font-medium">Importar</span>
          </button>

          {/* 4. Botón Exportar */}
          <div className="relative" ref={exportMenuRef}>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Exportar</span>
            </button>

            {/* Menú de Exportar */}
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-30">
                <div className="py-2">
                  <button
                    onClick={() => handleExport('CSV')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm"
                  >
                    Exportar CSV
                  </button>
                  <button
                    onClick={() => handleExport('Excel')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm"
                  >
                    Exportar Excel
                  </button>
                  <button
                    onClick={() => handleExport('PDF')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm"
                  >
                    Exportar PDF
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. Botón Imprimir */}
          <button className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors">
            <Printer className="h-4 w-4" />
            <span className="text-sm font-medium">Imprimir</span>
          </button>

          {/* 6. Botón Vista */}
          <div className="relative" ref={columnsMenuRef}>
            <button 
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Vista</span>
            </button>

            {/* Menú de Vista */}
            {showColumnsMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-30">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 text-sm">Mostrar columnas</h3>
                    <button onClick={() => setShowColumnsMenu(false)}>
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(columnVisibility).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleToggleColumn(key as keyof ColumnVisibility)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {key === 'id' ? 'ID' : 
                           key === 'fiscalId' ? 'RUT/CI' : 
                           key === 'name' ? 'Nombre' :
                           key === 'type' ? 'Tipo' :
                           key === 'status' ? 'Estado' :
                           key === 'address' ? 'Dirección' : key}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="rounded-md overflow-hidden border bg-white shadow-sm">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#00A9CE] border-b">
              <tr>
                <th className="px-3.5 h-[32px] text-left">
                  <input type="checkbox" className="rounded border-gray-400" />
                </th>
                
                {columnVisibility.id && (
                  <th 
                    className="px-3.5 h-[32px] text-left text-xs font-semibold text-white uppercase cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      ID
                      <SortIcon column="id" />
                    </div>
                  </th>
                )}

                {columnVisibility.name && (
                  <th 
                    className="px-3.5 h-[32px] text-left text-xs font-semibold text-white uppercase cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      NOMBRE
                      <SortIcon column="name" />
                    </div>
                  </th>
                )}

                {columnVisibility.type && (
                  <th 
                    className="px-3.5 h-[32px] text-left text-xs font-semibold text-white uppercase cursor-pointer"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-1">
                      TIPO
                      <SortIcon column="type" />
                    </div>
                  </th>
                )}

                {columnVisibility.status && (
                  <th 
                    className="px-3.5 h-[32px] text-left text-xs font-semibold text-white uppercase cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      ESTADO
                      <SortIcon column="status" />
                    </div>
                  </th>
                )}

                {columnVisibility.fiscalId && (
                  <th 
                    className="px-3.5 h-[32px] text-left text-xs font-semibold text-white uppercase cursor-pointer"
                    onClick={() => handleSort('fiscalId')}
                  >
                    <div className="flex items-center gap-1">
                      RUT/CI
                      <SortIcon column="fiscalId" />
                    </div>
                  </th>
                )}

                {columnVisibility.address && (
                  <th className="px-3.5 h-[32px] text-left text-xs font-semibold text-white uppercase">
                    DIRECCIÓN
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredEntities.map((entity, index) => (
                <tr 
                  key={entity.id}
                  onClick={() => setSelectedEntity(entity)}
                  className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } ${selectedEntity?.id === entity.id ? 'bg-blue-100' : ''}`}
                >
                  <td className="px-3.5 h-[32px]">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>

                  {columnVisibility.id && (
                    <td className="px-3.5 h-[32px] text-sm text-gray-900">{entity.id}</td>
                  )}

                  {columnVisibility.name && (
                    <td className="px-3.5 h-[32px] text-sm text-gray-900 font-medium">{entity.name}</td>
                  )}

                  {columnVisibility.type && (
                    <td className={`px-3.5 h-[32px] text-sm font-medium ${getTypeColor(entity.type)}`}>
                      {entity.type}
                    </td>
                  )}

                  {columnVisibility.status && (
                    <td className={`px-3.5 h-[32px] text-sm font-medium ${getStatusColor(entity.status)}`}>
                      {entity.status}
                    </td>
                  )}

                  {columnVisibility.fiscalId && (
                    <td className="px-3.5 h-[32px] text-sm text-gray-700">{entity.fiscalId}</td>
                  )}

                  {columnVisibility.address && (
                    <td className="px-3.5 h-[32px] text-sm text-gray-700">{entity.address}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formularios y vistas de detalle en la parte inferior */}
      {showNewForm ? (
        /* Formulario Nueva Entidad */
        <div className="rounded-md border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-md ${isEditMode ? 'bg-blue-100' : 'bg-orange-100'}`}>
                {isEditMode ? (
                  <Edit className="h-5 w-5 text-[#00A9CE]" />
                ) : (
                  <Plus className="h-5 w-5 text-[#FF6B35]" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isEditMode ? 'Editar Entidad' : 'Nueva Entidad'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isEditMode ? `ID: ${selectedEntity?.id}` : 'Complete los datos de la nueva entidad'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewForm(false)}
                className="h-[32px] px-4 border rounded-md hover:bg-gray-50 transition-colors flex items-center"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveForm}
                className="h-[32px] flex items-center gap-2 px-4 bg-[#00A9CE] text-white rounded-md hover:opacity-90 transition-opacity"
              >
                <Save className="h-4 w-4" />
                {isEditMode ? 'Guardar Cambios' : 'Guardar'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={newEntityForm.name}
                  onChange={(e) => setNewEntityForm({ ...newEntityForm, name: e.target.value })}
                  placeholder="Nombre de la entidad"
                  className="w-full h-[32px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  value={newEntityForm.type}
                  onChange={(e) => setNewEntityForm({ ...newEntityForm, type: e.target.value })}
                  className="w-full h-[32px] px-3 border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                >
                  {TIPOS_ENTIDAD.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RUT/CI</label>
                <input
                  type="text"
                  value={newEntityForm.fiscalId}
                  onChange={(e) => setNewEntityForm({ ...newEntityForm, fiscalId: e.target.value })}
                  placeholder="211234560011"
                  className="w-full h-[32px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select
                  value={newEntityForm.status}
                  onChange={(e) => setNewEntityForm({ ...newEntityForm, status: e.target.value })}
                  className="w-full h-[32px] px-3 border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                >
                  {ESTADOS_REGISTRO.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                value={newEntityForm.address}
                onChange={(e) => setNewEntityForm({ ...newEntityForm, address: e.target.value })}
                placeholder="Dirección completa"
                className="w-full h-[32px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newEntityForm.email}
                  onChange={(e) => setNewEntityForm({ ...newEntityForm, email: e.target.value })}
                  placeholder="contacto@ejemplo.com"
                  className="w-full h-[32px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={newEntityForm.phone}
                  onChange={(e) => setNewEntityForm({ ...newEntityForm, phone: e.target.value })}
                  placeholder="+598 2900 0000"
                  className="w-full h-[32px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Persona de Contacto</label>
              <input
                type="text"
                value={newEntityForm.contact}
                onChange={(e) => setNewEntityForm({ ...newEntityForm, contact: e.target.value })}
                placeholder="Nombre del contacto"
                className="w-full h-[32px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                rows={3}
                value={newEntityForm.observations}
                onChange={(e) => setNewEntityForm({ ...newEntityForm, observations: e.target.value })}
                placeholder="Notas internas..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
              />
            </div>
          </div>
        </div>
      ) : selectedEntity && (
        <div className="grid grid-cols-2 gap-4">
          {/* Tarjeta Detalle de Entidad */}
          <div className="rounded-md border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 rounded-md bg-orange-100">
                <Building2 className="h-5 w-5 text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Detalle de Entidad</h3>
                <p className="text-xs text-muted-foreground">ID: {selectedEntity.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Nombre</span>
                <span className="font-medium text-gray-900">{selectedEntity.name}</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Tipo</span>
                <span className={`font-medium ${getTypeColor(selectedEntity.type)}`}>{selectedEntity.type}</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Estado</span>
                <span className={`font-medium ${getStatusColor(selectedEntity.status)}`}>{selectedEntity.status}</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">RUT/CI</span>
                <span className="font-medium text-gray-900">{selectedEntity.fiscalId}</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Dirección</span>
                <span className="font-medium text-gray-900">{selectedEntity.address}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta Información de Contacto/Observaciones */}
          <div className="rounded-md border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-blue-100">
                  <User className="h-5 w-5 text-[#00A9CE]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {detailView === 'contacto' ? 'Información de Contacto' : 'Información Adicional'}
                  </h3>
                  <p className="text-xs text-muted-foreground">Datos de la entidad</p>
                </div>
              </div>

              {/* Toggle entre Contacto y Observaciones */}
              <div className="flex gap-2">
                <button
                  onClick={() => setDetailView('contacto')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    detailView === 'contacto'
                      ? 'bg-[#00A9CE] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Contacto
                </button>
                <button
                  onClick={() => setDetailView('informacion')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    detailView === 'informacion'
                      ? 'bg-[#00A9CE] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Información
                </button>
              </div>
            </div>

            {detailView === 'contacto' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Persona Contacto</span>
                  <span className="font-medium text-gray-900">{selectedEntity.contact}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600 w-32">Email</span>
                  <span className="font-medium text-gray-900">{selectedEntity.email}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600 w-32">Teléfono</span>
                  <span className="font-medium text-gray-900">{selectedEntity.phone}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Dirección</span>
                  <span className="font-medium text-gray-900">{selectedEntity.address}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4 text-sm">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600 w-32">Observaciones</span>
                  <span className="font-medium text-gray-900 flex-1">{selectedEntity.observations}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Categoría</span>
                  <span className="font-medium text-gray-900">{selectedEntity.type}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Estado Actual</span>
                  <span className={`font-medium ${getStatusColor(selectedEntity.status)}`}>{selectedEntity.status}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">ID Fiscal</span>
                  <span className="font-medium text-gray-900">{selectedEntity.fiscalId}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useMemo, useRef, useEffect } from 'react';
import { User, Building2, Briefcase, MapPin, Phone, Mail, FileText, ChevronUp, ChevronDown, Search, Plus, Edit, Filter, Download, Eye, X, Save, Printer } from 'lucide-react';
import { PeopleKPICards } from './PeopleKPICards';
import { 
  ROLES_PERSONA, 
  ESTADOS_REGISTRO, 
  getColorRolPersona, 
  getColorEstadoRegistro,
  type RolPersona,
  type EstadoRegistro
} from '../../data/catalogos';

interface Person {
  id: string;
  name: string;
  lastName: string;
  entity: string;
  role: string;
  status: string;
  phone: string;
  email: string;
  address: string;
  idNumber: string;
  observations: string;
}

type SortColumn = keyof Person | null;
type SortDirection = 'asc' | 'desc';

interface ColumnVisibility {
  id: boolean;
  name: boolean;
  lastName: boolean;
  entity: boolean;
  role: boolean;
  status: boolean;
  email: boolean;
}

const mockPeople: Person[] = [
  {
    id: 'PER-001',
    name: 'Juan',
    lastName: 'Pérez',
    entity: 'Corporación ABC',
    role: 'Contacto',
    status: 'Activo',
    phone: '+598 99 123 456',
    email: 'juan.perez@abc.com',
    address: 'Av. 18 de Julio 1234, Montevideo',
    idNumber: '1.234.567-8',
    observations: 'Contacto principal para entregas'
  },
  {
    id: 'PER-002',
    name: 'María',
    lastName: 'González',
    entity: 'Logística del Sur',
    role: 'Destinatario',
    status: 'Activo',
    phone: '+598 99 234 567',
    email: 'maria.gonzalez@logistica.com',
    address: 'Bvar. Artigas 567, Montevideo',
    idNumber: '2.345.678-9',
    observations: 'Recibe entregas todos los días'
  },
  {
    id: 'PER-003',
    name: 'Carlos',
    lastName: 'Rodríguez',
    entity: 'Almacenes Central',
    role: 'Receptor',
    status: 'Activo',
    phone: '+598 99 345 678',
    email: 'carlos.rodriguez@almacenes.com',
    address: 'Colonia 890, Montevideo',
    idNumber: '3.456.789-0',
    observations: 'Gerente de operaciones'
  },
  {
    id: 'PER-004',
    name: 'Ana',
    lastName: 'Martínez',
    entity: 'Transportes Unidos',
    role: 'Chofer',
    status: 'Activo',
    phone: '+598 99 456 789',
    email: 'ana.martinez@tunidos.com',
    address: 'San José 1122, Montevideo',
    idNumber: '4.567.890-1',
    observations: 'Conductora con licencia profesional'
  },
  {
    id: 'PER-005',
    name: 'Pedro',
    lastName: 'Silva',
    entity: 'Comercial Norte',
    role: 'Usuario',
    status: 'Activo',
    phone: '+598 99 567 890',
    email: 'pedro.silva@comercialnorte.uy',
    address: 'Mercedes 3344, Montevideo',
    idNumber: '5.678.901-2',
    observations: 'Disponible de 9 a 18hs'
  },
  {
    id: 'PER-006',
    name: 'Laura',
    lastName: 'Fernández',
    entity: 'Administración Interna',
    role: 'Administrador',
    status: 'Activo',
    phone: '+598 99 678 901',
    email: 'laura.fernandez@oddy.com.uy',
    address: 'Oficina Central ODDY',
    idNumber: '6.789.012-3',
    observations: 'Personal interno ODDY'
  },
  {
    id: 'PER-007',
    name: 'Roberto',
    lastName: 'Díaz',
    entity: 'Corporación ABC',
    role: 'Remitente',
    status: 'Inactivo',
    phone: '+598 99 789 012',
    email: 'roberto.diaz@abc.com',
    address: 'Yi 4455, Montevideo',
    idNumber: '7.890.123-4',
    observations: 'Ya no trabaja en la empresa'
  }
];

export function PeoplePage() {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(mockPeople[0]);
  const [detailView, setDetailView] = useState<'personal' | 'entidad'>('personal');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    id: true,
    name: true,
    lastName: true,
    entity: true,
    role: true,
    status: true,
    email: true
  });

  // Estados para modales y popovers
  const [showNewForm, setShowNewForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Estados para filtros
  const [filterRole, setFilterRole] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  
  // Cantidad de registros a mostrar por defecto (configurable)
  const [pageSize, setPageSize] = useState(6);

  // Estados para formulario de nueva persona
  const [newPersonForm, setNewPersonForm] = useState({
    name: '',
    lastName: '',
    entity: '',
    role: 'Contacto',
    status: 'Activo',
    phone: '',
    email: '',
    address: '',
    idNumber: '',
    observations: ''
  });

  const [editPersonForm, setEditPersonForm] = useState<Person | null>(null);

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

  const sortedPeople = useMemo(() => {
    if (!sortColumn) return mockPeople;

    return [...mockPeople].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortColumn, sortDirection]);

  const filteredPeople = useMemo(() => {
    let people = sortedPeople;

    // Filtro de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      people = people.filter(person => 
        person.id.toLowerCase().includes(searchLower) ||
        person.name.toLowerCase().includes(searchLower) ||
        person.lastName.toLowerCase().includes(searchLower) ||
        person.entity.toLowerCase().includes(searchLower) ||
        person.role.toLowerCase().includes(searchLower) ||
        person.status.toLowerCase().includes(searchLower) ||
        person.email.toLowerCase().includes(searchLower) ||
        person.phone.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por rol
    if (filterRole.length > 0) {
      people = people.filter(person => filterRole.includes(person.role));
    }

    // Filtro por estado
    if (filterStatus.length > 0) {
      people = people.filter(person => filterStatus.includes(person.status));
    }

    // Limitar a pageSize registros
    return people.slice(0, pageSize);
  }, [sortedPeople, searchTerm, filterRole, filterStatus, pageSize]);

  const suggestions = useMemo(() => {
    const allSuggestions = [
      ...mockPeople.map(p => `${p.name} ${p.lastName}`),
      ...mockPeople.map(p => p.entity),
      ...mockPeople.map(p => p.role),
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

  const handleNewPerson = () => {
    setIsEditMode(false);
    setNewPersonForm({
      name: '',
      lastName: '',
      entity: '',
      role: 'Contacto',
      status: 'Activo',
      phone: '',
      email: '',
      address: '',
      idNumber: '',
      observations: ''
    });
    setShowNewForm(true);
  };

  const handleEditPerson = () => {
    if (selectedPerson) {
      setIsEditMode(true);
      setNewPersonForm({
        name: selectedPerson.name,
        lastName: selectedPerson.lastName,
        entity: selectedPerson.entity,
        role: selectedPerson.role,
        status: selectedPerson.status,
        phone: selectedPerson.phone,
        email: selectedPerson.email,
        address: selectedPerson.address,
        idNumber: selectedPerson.idNumber,
        observations: selectedPerson.observations
      });
      setShowNewForm(true);
    }
  };

  const handleSaveForm = () => {
    if (isEditMode) {
      console.log('Guardando edición de persona:', newPersonForm);
    } else {
      console.log('Guardando nueva persona:', newPersonForm);
    }
    setShowNewForm(false);
    setIsEditMode(false);
    setNewPersonForm({
      name: '',
      lastName: '',
      entity: '',
      role: 'Contacto',
      status: 'Activo',
      phone: '',
      email: '',
      address: '',
      idNumber: '',
      observations: ''
    });
  };

  const handleToggleFilterRole = (role: string) => {
    setFilterRole(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
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
    setFilterRole([]);
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
  const getRoleColor = (role: string) => getColorRolPersona(role);

  return (
    <div className="space-y-4">
      {/* Sección superior: Título + KPI Cards en la misma línea */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 whitespace-nowrap">Personas</h2>
        <PeopleKPICards />
      </div>

      {/* Barra de herramientas naranja */}
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

          {/* Mensaje de sin resultados */}
          {searchTerm && filteredPeople.length === 0 && (
            <div className="absolute z-20 w-full mt-1 bg-card border rounded-lg shadow-lg p-4">
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
            onClick={handleNewPerson}
            className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Nuevo</span>
          </button>

          {/* 2. Botón Editar */}
          <button 
            onClick={handleEditPerson}
            disabled={!selectedPerson}
            className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit className="h-4 w-4" />
            <span className="text-sm font-medium">Editar</span>
          </button>

          {/* 3. Botón Importar */}
          <button className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors">
            <Download className="h-4 w-4 rotate-180" />
            <span className="text-sm font-medium">Importar</span>
          </button>

          {/* 4. Botón Exportar */}
          <div className="relative" ref={exportMenuRef}>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Exportar</span>
            </button>

            {/* Menú de Exportar */}
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-30">
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
          <button className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors">
            <Printer className="h-4 w-4" />
            <span className="text-sm font-medium">Imprimir</span>
          </button>

          {/* 6. Botón Vista */}
          <div className="relative" ref={columnsMenuRef}>
            <button 
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              className="h-[35px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Vista</span>
            </button>

            {/* Menú de Vista */}
            {showColumnsMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-30">
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
                           key === 'lastName' ? 'Apellido' :
                           key === 'name' ? 'Nombre' :
                           key === 'entity' ? 'Entidad' :
                           key === 'role' ? 'Rol' :
                           key === 'status' ? 'Estado' :
                           key === 'email' ? 'Email' : key}
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
      <div className="rounded-lg overflow-hidden border bg-white shadow-sm">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#00A9CE] border-b">
              <tr>
                <th className="px-3.5 h-[35px] text-left">
                  <input type="checkbox" className="rounded border-gray-400" />
                </th>
                
                {columnVisibility.id && (
                  <th 
                    className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase cursor-pointer"
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
                    className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      NOMBRE
                      <SortIcon column="name" />
                    </div>
                  </th>
                )}

                {columnVisibility.lastName && (
                  <th 
                    className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase cursor-pointer"
                    onClick={() => handleSort('lastName')}
                  >
                    <div className="flex items-center gap-1">
                      APELLIDO
                      <SortIcon column="lastName" />
                    </div>
                  </th>
                )}

                {columnVisibility.entity && (
                  <th 
                    className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase cursor-pointer"
                    onClick={() => handleSort('entity')}
                  >
                    <div className="flex items-center gap-1">
                      ENTIDAD
                      <SortIcon column="entity" />
                    </div>
                  </th>
                )}

                {columnVisibility.role && (
                  <th 
                    className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase cursor-pointer"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center gap-1">
                      ROL
                      <SortIcon column="role" />
                    </div>
                  </th>
                )}

                {columnVisibility.status && (
                  <th 
                    className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      ESTADO
                      <SortIcon column="status" />
                    </div>
                  </th>
                )}

                {columnVisibility.email && (
                  <th className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase">
                    EMAIL
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredPeople.map((person, index) => (
                <tr 
                  key={person.id}
                  onClick={() => setSelectedPerson(person)}
                  className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } ${selectedPerson?.id === person.id ? 'bg-blue-100' : ''}`}
                >
                  <td className="px-3.5 h-[35px]">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>

                  {columnVisibility.id && (
                    <td className="px-3.5 h-[35px] text-sm text-gray-900">{person.id}</td>
                  )}

                  {columnVisibility.name && (
                    <td className="px-3.5 h-[35px] text-sm text-gray-900 font-medium">{person.name}</td>
                  )}

                  {columnVisibility.lastName && (
                    <td className="px-3.5 h-[35px] text-sm text-gray-900 font-medium">{person.lastName}</td>
                  )}

                  {columnVisibility.entity && (
                    <td className="px-3.5 h-[35px] text-sm text-gray-700">{person.entity}</td>
                  )}

                  {columnVisibility.role && (
                    <td className={`px-3.5 h-[35px] text-sm font-medium ${getRoleColor(person.role)}`}>
                      {person.role}
                    </td>
                  )}

                  {columnVisibility.status && (
                    <td className={`px-3.5 h-[35px] text-sm font-medium ${getStatusColor(person.status)}`}>
                      {person.status}
                    </td>
                  )}

                  {columnVisibility.email && (
                    <td className="px-3.5 h-[35px] text-sm text-gray-700">{person.email}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formularios y vistas de detalle en la parte inferior */}
      {showNewForm ? (
        /* Formulario Nueva/Editar Persona */
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
                  {isEditMode ? 'Editar Persona' : 'Nueva Persona'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isEditMode ? `ID: ${selectedPerson?.id}` : 'Complete los datos de la nueva persona'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewForm(false)}
                className="h-[35px] px-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveForm}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={newPersonForm.name}
                  onChange={(e) => setNewPersonForm({ ...newPersonForm, name: e.target.value })}
                  placeholder="Nombre"
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                <input
                  type="text"
                  value={newPersonForm.lastName}
                  onChange={(e) => setNewPersonForm({ ...newPersonForm, lastName: e.target.value })}
                  placeholder="Apellido"
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                <input
                  type="text"
                  value={newPersonForm.idNumber}
                  onChange={(e) => setNewPersonForm({ ...newPersonForm, idNumber: e.target.value })}
                  placeholder="1.234.567-8"
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                <select
                  value={newPersonForm.role}
                  onChange={(e) => setNewPersonForm({ ...newPersonForm, role: e.target.value })}
                  className="w-full h-[35px] px-3 border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                >
                  {ROLES_PERSONA.map(rol => (
                    <option key={rol} value={rol}>{rol}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entidad</label>
                <input
                  type="text"
                  value={newPersonForm.entity}
                  onChange={(e) => setNewPersonForm({ ...newPersonForm, entity: e.target.value })}
                  placeholder="Nombre de la entidad"
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select
                  value={newPersonForm.status}
                  onChange={(e) => setNewPersonForm({ ...newPersonForm, status: e.target.value })}
                  className="w-full h-[35px] px-3 border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
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
                value={newPersonForm.address}
                onChange={(e) => setNewPersonForm({ ...newPersonForm, address: e.target.value })}
                placeholder="Dirección completa"
                className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newPersonForm.email}
                  onChange={(e) => setNewPersonForm({ ...newPersonForm, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={newPersonForm.phone}
                  onChange={(e) => setNewPersonForm({ ...newPersonForm, phone: e.target.value })}
                  placeholder="+598 99 123 456"
                  className="w-full h-[35px] px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                rows={3}
                value={newPersonForm.observations}
                onChange={(e) => setNewPersonForm({ ...newPersonForm, observations: e.target.value })}
                placeholder="Notas internas..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
              />
            </div>
          </div>
        </div>
      ) : selectedPerson && (
        <div className="grid grid-cols-2 gap-4">
          {/* Tarjeta Detalle Personal */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 rounded-lg bg-orange-100">
                <User className="h-5 w-5 text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Detalle Personal</h3>
                <p className="text-xs text-muted-foreground">ID: {selectedPerson.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Nombre Completo</span>
                <span className="font-medium text-gray-900">{selectedPerson.name} {selectedPerson.lastName}</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Cédula</span>
                <span className="font-medium text-gray-900">{selectedPerson.idNumber}</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Rol</span>
                <span className={`font-medium ${getRoleColor(selectedPerson.role)}`}>{selectedPerson.role}</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Estado</span>
                <span className={`font-medium ${getStatusColor(selectedPerson.status)}`}>{selectedPerson.status}</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Dirección</span>
                <span className="font-medium text-gray-900">{selectedPerson.address}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta Información de Entidad/Contacto */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Building2 className="h-5 w-5 text-[#00A9CE]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {detailView === 'entidad' ? 'Información de Entidad' : 'Información de Contacto'}
                  </h3>
                  <p className="text-xs text-muted-foreground">Datos adicionales</p>
                </div>
              </div>

              {/* Toggle entre Personal y Entidad */}
              <div className="flex gap-2">
                <button
                  onClick={() => setDetailView('personal')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    detailView === 'personal'
                      ? 'bg-[#00A9CE] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Personal
                </button>
                <button
                  onClick={() => setDetailView('entidad')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    detailView === 'entidad'
                      ? 'bg-[#00A9CE] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Entidad
                </button>
              </div>
            </div>

            {detailView === 'personal' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Email</span>
                  <span className="font-medium text-gray-900">{selectedPerson.email}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Teléfono</span>
                  <span className="font-medium text-gray-900">{selectedPerson.phone}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Dirección</span>
                  <span className="font-medium text-gray-900">{selectedPerson.address}</span>
                </div>

                <div className="flex items-start gap-4 text-sm">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600 w-32">Observaciones</span>
                  <span className="font-medium text-gray-900 flex-1">{selectedPerson.observations}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Entidad</span>
                  <span className="font-medium text-gray-900">{selectedPerson.entity}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Rol en Entidad</span>
                  <span className={`font-medium ${getRoleColor(selectedPerson.role)}`}>{selectedPerson.role}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Persona</span>
                  <span className="font-medium text-gray-900">{selectedPerson.name} {selectedPerson.lastName}</span>
                </div>

                <div className="flex items-start gap-4 text-sm">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600 w-32">Observaciones</span>
                  <span className="font-medium text-gray-900 flex-1">{selectedPerson.observations}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
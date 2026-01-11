import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Package, FileText, MapPin, User, ChevronUp, ChevronDown, Search, Plus, Edit, Download, Eye, Save, Printer, Truck, Clock, CheckCircle2, History, Loader2 } from 'lucide-react';
import { EntregasKPICards } from './EntregasKPICards';
import { 
  ESTADOS_ENTREGA, 
  getColorEstadoEntrega
} from '../../data/catalogos';
import { useRole, canManageEntregas, isClientRole, MOCK_CLIENT_ID } from '../../state/role';
import { 
  mockEntregasData, 
  type Entrega,
  formatTimestamp,
  getEventTypeLabel 
} from '../../data/entregas';
import { useAuth } from '../../contexts/AuthContext';
import { 
  subscribeDeliveriesForUser,
  subscribeDeliveryEvents,
  updateDeliveryAsAdmin,
  createDelivery,
  confirmReceipt as confirmReceiptService,
  canUserConfirmReceipt,
  canUserEditDeliveries,
  canUserCreateDeliveries,
  type CreateDeliveryData,
  type UpdateDeliveryData
} from '../../services/deliveriesService';
import type { HistoryEvent } from '../../data/entregas';

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
  console.log('[EntregasPage] Renderizando...');
  
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Auth context - si hay usuario autenticado, usa Firestore
  const { user, profile, loading: authLoading } = useAuth();
  
  console.log('[EntregasPage] Auth state:', { 
    hasUser: !!user, 
    hasProfile: !!profile, 
    authLoading,
    profileRole: profile?.role 
  });
  
  // Solo usar Firestore si tenemos usuario Y perfil válido
  const useFirestore = Boolean(user && profile && profile.uid);

  // Estado de rol (del Role Switcher para desarrollo)
  const [currentRole] = useRole();
  
  // Mostrar todas las opciones del menú para todos los usuarios
  const showManageActions = true;
  const canCreate = true;
  const isClient = useFirestore && profile
    ? profile.role === 'client' 
    : isClientRole(currentRole);

  // Estado de entregas
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [firestoreLoading, setFirestoreLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  
  // Estado de selección - usar ID en lugar de objeto completo (fuente única)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Derivar selectedEntrega desde entregas[] (fuente única de verdad)
  const selectedEntrega = useMemo(() => {
    if (!selectedId) return null;
    return entregas.find(e => e.id === selectedId) || null;
  }, [selectedId, entregas]);

  // Estado del historial de la entrega seleccionada
  const [selectedHistory, setSelectedHistory] = useState<HistoryEvent[]>([]);
  
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
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
  const [savingData, setSavingData] = useState(false);
  const [confirmingReceipt, setConfirmingReceipt] = useState(false);

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

  // Hacer foco en el buscador si viene desde login exitoso
  useEffect(() => {
    if (location.state?.focusSearch && searchInputRef.current) {
      searchInputRef.current.focus();
      // Limpiar el estado para que no vuelva a hacer foco
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ============================================
  // SUSCRIPCIÓN A FIRESTORE (con fallback a mock data)
  // ============================================

  // Función helper para obtener datos mock - mostrar todos para demo
  const getMockDataForRole = useCallback(() => {
    // Mostrar todos los registros (demo) - ordenados por fecha desc, últimos 6
    return [...mockEntregasData]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 6);
  }, []);

  useEffect(() => {
    // Si no hay usuario autenticado, usar mock data directamente
    if (!useFirestore) {
      setFirestoreLoading(false);
      setEntregas(getMockDataForRole());
      return;
    }

    // Suscribirse a Firestore (solo si tenemos profile)
    if (!profile) {
      setFirestoreLoading(false);
      return;
    }
    
    setFirestoreLoading(true);
    setFirestoreError(null);

    const unsubscribe = subscribeDeliveriesForUser(
      profile,
      (deliveries) => {
        // FALLBACK: Si Firestore está vacío, usar datos mock de demostración
        if (deliveries.length === 0) {
          console.log('[EntregasPage] Firestore vacío, usando datos de demostración');
          setEntregas(getMockDataForRole());
        } else {
          setEntregas(deliveries);
        }
        setFirestoreLoading(false);
      },
      (error) => {
        console.error('[EntregasPage] Error Firestore:', error);
        // En caso de error, también usar mock data
        setEntregas(getMockDataForRole());
        setFirestoreError('Usando datos de demostración');
        setFirestoreLoading(false);
      }
    );

    return () => unsubscribe();
  }, [useFirestore, profile, currentRole, getMockDataForRole]);

  // Suscripción a eventos de la entrega seleccionada
  useEffect(() => {
    if (!useFirestore || !selectedId) {
      // Sin Firestore: usar history del mock
      if (selectedEntrega?.history) {
        setSelectedHistory(selectedEntrega.history);
      } else {
        setSelectedHistory([]);
      }
      return;
    }

    // Suscribirse a eventos desde Firestore
    const unsubscribe = subscribeDeliveryEvents(
      selectedId,
      (events) => {
        setSelectedHistory(events);
      },
      (error) => {
        console.error('[EntregasPage] Error cargando eventos:', error);
      }
    );

    return () => unsubscribe();
  }, [useFirestore, selectedId, selectedEntrega?.history]);

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

  // Seleccionar primera entrega visible cuando cambian las entregas
  useEffect(() => {
    if (entregas.length > 0 && (!selectedId || !entregas.find(e => e.id === selectedId))) {
      setSelectedId(entregas[0].id);
    }
  }, [entregas, selectedId]);

  // ============================================
  // DATOS Y FILTROS
  // ============================================

  // Datos para autocompletado
  const allSearchableData = useMemo(() => {
    const data: string[] = [];
    entregas.forEach(entrega => {
      data.push(entrega.id, entrega.remitente, entrega.destinatario, entrega.direccion, entrega.estado);
    });
    return [...new Set(data)];
  }, [entregas]);

  const filteredSuggestions = searchTerm
    ? allSearchableData.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8)
    : [];

  // Ordenamiento de entregas
  const sortedEntregas = useMemo(() => {
    let filtered = [...entregas];

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
  }, [entregas, sortColumn, sortDirection, searchTerm, filterEstado]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (entrega: Entrega) => {
    setSelectedId(entrega.id);
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
      setEditEntregaForm({ ...selectedEntrega });
      setShowNewForm(true);
    }
  };

  const handleSaveEntrega = useCallback(async () => {
    setSavingData(true);

    try {
      if (isEditMode && editEntregaForm) {
        if (useFirestore && profile) {
          // Guardar en Firestore
          const updates: UpdateDeliveryData = {
            fecha: editEntregaForm.fecha,
            remitente: editEntregaForm.remitente,
            destinatario: editEntregaForm.destinatario,
            direccion: editEntregaForm.direccion,
            estado: editEntregaForm.estado,
            conductor: editEntregaForm.conductor,
            vehiculo: editEntregaForm.vehiculo,
            observaciones: editEntregaForm.observaciones
          };

          const currentStatus = selectedEntrega?.estado || editEntregaForm.estado;
          
          await updateDeliveryAsAdmin(
            editEntregaForm.id,
            updates,
            currentStatus,
            profile.uid,
            profile.role
          );
          
          // Los datos se actualizarán automáticamente via la suscripción
        } else {
          // Mock: actualizar estado local
          const now = new Date().toISOString();
          const updatedEntregas = entregas.map(e => {
            if (e.id === editEntregaForm.id) {
              const estadoCambio = e.estado !== editEntregaForm.estado;
              const newHistory = [...e.history];
              
              if (estadoCambio) {
                newHistory.push({
                  type: 'STATUS_CHANGE',
                  timestamp: now,
                  description: `Estado: ${e.estado} → ${editEntregaForm.estado}`
                });
              }
              
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
        }
      } else if (!isEditMode) {
        // Crear nueva entrega
        if (useFirestore && profile) {
          const newData: CreateDeliveryData = {
            clientId: profile.clientId || 'admin',
            fecha: newEntregaForm.fecha,
            remitente: newEntregaForm.remitente,
            destinatario: newEntregaForm.destinatario,
            direccion: newEntregaForm.direccion,
            estado: newEntregaForm.estado,
            conductor: newEntregaForm.conductor || '-',
            vehiculo: newEntregaForm.vehiculo || '-',
            observaciones: newEntregaForm.observaciones || ''
          };

          const newId = await createDelivery(newData, profile.uid, profile.role);
          setSelectedId(newId);
        } else {
          // Mock: crear localmente
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
            ownerId: 'admin',
            history: [
              { type: 'CREATED', timestamp: now, description: 'Entrega creada' }
            ]
          };
          
          setEntregas(prev => [newEntrega, ...prev]);
          setSelectedId(newId);
        }
      }
      
      setShowNewForm(false);
      setIsEditMode(false);
    } catch (error) {
      console.error('[EntregasPage] Error guardando:', error);
      alert('Error al guardar los cambios');
    } finally {
      setSavingData(false);
    }
  }, [isEditMode, editEntregaForm, newEntregaForm, useFirestore, profile, entregas, selectedEntrega]);

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

  // ============================================
  // ACUSE DE RECIBO
  // ============================================

  const handleConfirmReceipt = async () => {
    if (!selectedEntrega || selectedEntrega.estado !== 'En destino') {
      return;
    }

    // Verificar permisos
    if (useFirestore && profile) {
      if (!canUserConfirmReceipt(profile, selectedEntrega)) {
        alert('No tienes permiso para confirmar esta entrega');
        return;
      }
    } else if (!isClient) {
      return;
    }

    const confirmed = window.confirm(
      `¿Confirmar la recepción de la entrega ${selectedEntrega.id}?\n\nEsta acción cambiará el estado a "Recibido".`
    );

    if (!confirmed) return;

    setConfirmingReceipt(true);

    try {
      if (useFirestore) {
        // Usar Cloud Function
        await confirmReceiptService(selectedEntrega.id);
        // Los datos se actualizarán automáticamente via la suscripción
      } else {
        // Mock: actualizar localmente
        const now = new Date().toISOString();
        
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
      }
    } catch (error) {
      console.error('[EntregasPage] Error confirmando recepción:', error);
      alert('Error al confirmar la recepción. Por favor intenta de nuevo.');
    } finally {
      setConfirmingReceipt(false);
    }
  };

  // Verificar si puede mostrar botón de acuse de recibo
  const canShowReceiptButton = useFirestore
    ? canUserConfirmReceipt(profile, selectedEntrega)
    : (isClient && selectedEntrega?.estado === 'En destino');

  const getEstadoColor = (estado: string) => {
    const colors = getColorEstadoEntrega(estado);
    return `${colors.text} ${colors.bg}`;
  };

  const formData = isEditMode ? editEntregaForm : newEntregaForm;
  const setFormData = isEditMode ? setEditEntregaForm : setNewEntregaForm;

  // ============================================
  // LOADING STATE
  // ============================================

  if (authLoading || firestoreLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#00A9CE]" />
        <span className="ml-3 text-gray-600">Cargando entregas...</span>
      </div>
    );
  }

  if (firestoreError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">{firestoreError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-[#00A9CE] hover:underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-4">
      {/* Sección superior: Título + KPI Cards */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 whitespace-nowrap">Entregas</h2>
        <EntregasKPICards />
      </div>

      {/* Barra de herramientas */}
      <div className="flex items-center gap-4 px-6 py-3 bg-[#FF6B35] rounded-md">
        {/* Buscador con autocompletado */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
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
        </div>

        {/* Botones a la derecha - Orden: Nuevo, Editar, Importar, Exportar, Imprimir, Vista */}
        <div className="flex items-center gap-4 ml-auto">
          {/* 1. Botón Nuevo */}
          <button
            onClick={handleNewEntrega}
            className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Nuevo</span>
          </button>

          {/* 2. Botón Editar */}
          <button 
            onClick={handleEditEntrega}
            disabled={!selectedEntrega}
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

            {showExportMenu && (
              <div className="absolute right-0 top-12 w-48 bg-card border rounded-md shadow-lg z-10 p-2">
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

            {showColumnsMenu && (
              <div className="absolute right-0 top-12 w-56 bg-card border rounded-md shadow-lg z-10 p-2">
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
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#00A9CE] border-b">
              <tr>
                <th className="px-3.5 h-[32px] text-left">
                  <input type="checkbox" className="rounded border-gray-400" />
                </th>
                
                {columnVisibility.id && (
                  <th 
                    className="px-3.5 h-[32px] text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer"
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
                    className="px-3.5 h-[32px] text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer"
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
                    className="px-3.5 h-[32px] text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer"
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
                    className="px-3.5 h-[32px] text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer"
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
                    className="px-3.5 h-[32px] text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer"
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
                    className="px-3.5 h-[32px] text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer"
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
                  } ${selectedId === entrega.id ? 'bg-blue-100' : ''}`}
                >
                  <td className="px-3.5 h-[32px]">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  {columnVisibility.id && (
                    <td className="px-3.5 h-[32px] text-sm text-gray-900">
                      {entrega.id}
                    </td>
                  )}
                  {columnVisibility.fecha && (
                    <td className="px-3.5 h-[32px] text-sm text-gray-900">
                      {entrega.fecha}
                    </td>
                  )}
                  {columnVisibility.remitente && (
                    <td className="px-3.5 h-[32px] text-sm text-gray-900">
                      {entrega.remitente}
                    </td>
                  )}
                  {columnVisibility.destinatario && (
                    <td className="px-3.5 h-[32px] text-sm text-gray-900">
                      {entrega.destinatario}
                    </td>
                  )}
                  {columnVisibility.direccion && (
                    <td className="px-3.5 h-[32px] text-sm text-gray-700">
                      {entrega.direccion}
                    </td>
                  )}
                  {columnVisibility.estado && (
                    <td className={`px-3.5 h-[32px] text-sm font-medium ${getEstadoColor(entrega.estado).split(' ')[0]}`}>
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
                disabled={savingData}
                className="h-[32px] px-4 border rounded-md hover:bg-gray-50 transition-colors flex items-center disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEntrega}
                disabled={savingData}
                className="h-[32px] flex items-center gap-2 px-4 bg-[#00A9CE] text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {savingData ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditMode ? 'Guardar Cambios' : 'Guardar'}
                  </>
                )}
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
                  className="w-full h-[32px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select
                  value={formData?.estado || ''}
                  onChange={(e) => setFormData({ ...formData!, estado: e.target.value })}
                  className="w-full h-[32px] px-3 border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
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
                  className="w-full h-[32px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destinatario *</label>
                <input
                  type="text"
                  value={formData?.destinatario || ''}
                  onChange={(e) => setFormData({ ...formData!, destinatario: e.target.value })}
                  placeholder="Nombre del destinatario"
                  className="w-full h-[32px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Entrega *</label>
                <input
                  type="text"
                  value={formData?.direccion || ''}
                  onChange={(e) => setFormData({ ...formData!, direccion: e.target.value })}
                  placeholder="Dirección completa"
                  className="w-full h-[32px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conductor</label>
                <input
                  type="text"
                  value={formData?.conductor || ''}
                  onChange={(e) => setFormData({ ...formData!, conductor: e.target.value })}
                  placeholder="Nombre del conductor"
                  className="w-full h-[32px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
                <input
                  type="text"
                  value={formData?.vehiculo || ''}
                  onChange={(e) => setFormData({ ...formData!, vehiculo: e.target.value })}
                  placeholder="Matrícula del vehículo"
                  className="w-full h-[32px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
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
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A9CE]"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Dos tarjetas de detalle */
        <div className="grid grid-cols-2 gap-4">
          {/* Tarjeta 1: Detalle de la Entrega */}
          <div className="rounded-md border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 rounded-md bg-orange-100">
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
                {canShowReceiptButton && selectedEntrega && (
                  <div className="pt-4 border-t mt-4">
                    <button
                      onClick={handleConfirmReceipt}
                      disabled={confirmingReceipt}
                      className="w-full h-[32px] flex items-center justify-center gap-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {confirmingReceipt ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm font-medium">Confirmando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm font-medium">Marcar como recibido</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tarjeta 2: Información de la Entrega */}
          <div className="rounded-md border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 rounded-md bg-blue-100">
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
                    {selectedHistory && selectedHistory.length > 0 ? (
                      selectedHistory.map((event, index) => (
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

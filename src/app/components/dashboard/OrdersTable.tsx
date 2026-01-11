import { MapPin, User, Truck, FileText, CheckCircle, ChevronUp, ChevronDown, Package, Clock } from 'lucide-react';
import { useState, useMemo } from 'react';

interface OrdersTableProps {
  userRole: 'operator' | 'client';
  searchFilter?: string;
  visibleColumns: ColumnVisibility;
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

interface Order {
  id: string;
  date: string;
  client: string;
  destination: string;
  status: string;
  driver: string;
  vehicle: string;
  internalNotes: string;
}

type SortColumn = keyof Order | null;
type SortDirection = 'asc' | 'desc';

export function OrdersTable({ userRole, searchFilter, visibleColumns }: OrdersTableProps) {
  const orders: Order[] = [
    {
      id: '#ENT-1234',
      date: '09/12/2025',
      client: 'Juan Pérez',
      destination: 'Av. Principal 123',
      status: 'En curso',
      driver: 'Carlos López',
      vehicle: 'Camión A-123',
      internalNotes: 'Entrega urgente'
    },
    {
      id: '#ENT-1235',
      date: '09/12/2025',
      client: 'María González',
      destination: 'Calle 45 #87-89',
      status: 'Confirmado',
      driver: 'Luis Sánchez',
      vehicle: 'Van B-456',
      internalNotes: 'Cliente prefiere mañana'
    },
    {
      id: '#ENT-1236',
      date: '09/12/2025',
      client: 'Pedro Martínez',
      destination: 'Carrera 12 #34-56',
      status: 'Recibido',
      driver: 'Ana Torres',
      vehicle: 'Moto C-789',
      internalNotes: 'Firma recibida'
    },
    {
      id: '#ENT-1237',
      date: '10/12/2025',
      client: 'Laura Rodríguez',
      destination: 'Av. Libertador 789',
      status: 'En destino',
      driver: 'Carlos López',
      vehicle: 'Camión A-123',
      internalNotes: 'Fragil - Manejar con cuidado'
    },
    {
      id: '#ENT-1238',
      date: '10/12/2025',
      client: 'Roberto Silva',
      destination: 'Calle 8 #23-45',
      status: 'Borrador',
      driver: 'Miguel Ángel',
      vehicle: 'Van D-321',
      internalNotes: 'Llamar antes de llegar'
    },
    {
      id: '#ENT-1239',
      date: '10/12/2025',
      client: 'Carmen Jiménez',
      destination: 'Av. Central 456',
      status: 'Recibido',
      driver: 'Ana Torres',
      vehicle: 'Moto C-789',
      internalNotes: 'Entrega sin problemas'
    },
    {
      id: '#ENT-1240',
      date: '11/12/2025',
      client: 'Diego Morales',
      destination: 'Calle 90 #12-34',
      status: 'Cancelado',
      driver: 'Luis Sánchez',
      vehicle: 'Van B-456',
      internalNotes: 'Paquete grande'
    }
  ];

  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0]);
  const [detailView, setDetailView] = useState<'conductor' | 'cliente'>('conductor');

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

  const sortedOrders = useMemo(() => {
    if (!sortColumn) return orders;

    return [...orders].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortColumn, sortDirection]);

  // Filtrar entregas basado en el término de búsqueda
  const filteredOrders = useMemo(() => {
    if (!searchFilter) return sortedOrders;

    const searchLower = searchFilter.toLowerCase();
    return sortedOrders.filter(order => 
      order.id.toLowerCase().includes(searchLower) ||
      order.client.toLowerCase().includes(searchLower) ||
      order.destination.toLowerCase().includes(searchLower) ||
      order.status.toLowerCase().includes(searchLower) ||
      order.driver.toLowerCase().includes(searchLower) ||
      order.vehicle.toLowerCase().includes(searchLower) ||
      order.internalNotes.toLowerCase().includes(searchLower)
    );
  }, [sortedOrders, searchFilter]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en ruta':
      case 'en curso':
        return 'text-blue-600';
      case 'pendiente':
        return 'text-orange-500';
      case 'completado':
      case 'recibido':
        return 'text-green-600';
      case 'cancelado':
        return 'text-red-600';
      case 'borrador':
        return 'text-gray-500';
      case 'confirmado':
        return 'text-purple-600';
      case 'en destino':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabla principal */}
      <div className="rounded-lg overflow-hidden border bg-white shadow-sm">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#00A9CE] border-b">
              <tr>
                <th className="px-3.5 h-[35px] text-left">
                  <input type="checkbox" className="rounded border-gray-400" />
                </th>
                
                {visibleColumns.id && (
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

                <th 
                  className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    FECHA
                    <SortIcon column="date" />
                  </div>
                </th>

                {visibleColumns.client && (
                  <th 
                    className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase cursor-pointer"
                    onClick={() => handleSort('client')}
                  >
                    <div className="flex items-center gap-1">
                      CLIENTE
                      <SortIcon column="client" />
                    </div>
                  </th>
                )}

                {visibleColumns.destination && (
                  <th 
                    className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase cursor-pointer"
                    onClick={() => handleSort('destination')}
                  >
                    <div className="flex items-center gap-1">
                      DIRECCIÓN
                      <SortIcon column="destination" />
                    </div>
                  </th>
                )}

                {visibleColumns.status && (
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

                {userRole === 'operator' && visibleColumns.driver && (
                  <th 
                    className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase cursor-pointer"
                    onClick={() => handleSort('driver')}
                  >
                    <div className="flex items-center gap-1">
                      CONDUCTOR
                      <SortIcon column="driver" />
                    </div>
                  </th>
                )}

                {userRole === 'operator' && visibleColumns.vehicle && (
                  <th className="px-3.5 h-[35px] text-left text-xs font-semibold text-white uppercase">
                    VEHÍCULO
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order, index) => (
                <tr 
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } ${selectedOrder?.id === order.id ? 'bg-blue-100' : ''}`}
                >
                  <td className="px-3.5 h-[35px]">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>

                  {visibleColumns.id && (
                    <td className="px-3.5 h-[35px] text-sm text-gray-900">{order.id}</td>
                  )}

                  <td className="px-3.5 h-[35px] text-sm text-gray-900">{order.date}</td>

                  {visibleColumns.client && (
                    <td className="px-3.5 h-[35px] text-sm text-gray-900">{order.client}</td>
                  )}

                  {visibleColumns.destination && (
                    <td className="px-3.5 h-[35px] text-sm text-gray-700">{order.destination}</td>
                  )}

                  {visibleColumns.status && (
                    <td className={`px-3.5 h-[35px] text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </td>
                  )}

                  {userRole === 'operator' && visibleColumns.driver && (
                    <td className="px-3.5 h-[35px] text-sm text-gray-900">{order.driver}</td>
                  )}

                  {userRole === 'operator' && visibleColumns.vehicle && (
                    <td className="px-3.5 h-[35px] text-sm text-gray-700">{order.vehicle}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vistas de detalle en la parte inferior */}
      {selectedOrder && (
        <div className="grid grid-cols-2 gap-4">
          {/* Tarjeta Detalle de Entrega */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 rounded-lg bg-orange-100">
                <Package className="h-5 w-5 text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Detalle de Entrega</h3>
                <p className="text-xs text-muted-foreground">ID: {selectedOrder.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Fecha de Pedido</span>
                <span className="font-medium text-gray-900">{selectedOrder.date}</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Fecha Estimada</span>
                <span className="font-medium text-gray-900">10/12/2025</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Hora Estimada</span>
                <span className="font-medium text-gray-900">14:30 - 15:00</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 w-32">Destino</span>
                <span className="font-medium text-gray-900">{selectedOrder.destination}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta Información del Conductor/Cliente */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <User className="h-5 w-5 text-[#00A9CE]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {detailView === 'conductor' ? 'Información del Conductor' : 'Información del Cliente'}
                  </h3>
                  <p className="text-xs text-muted-foreground">Datos de contacto</p>
                </div>
              </div>

              {/* Toggle entre Conductor y Cliente */}
              <div className="flex gap-2">
                <button
                  onClick={() => setDetailView('conductor')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    detailView === 'conductor'
                      ? 'bg-[#00A9CE] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Conductor
                </button>
                <button
                  onClick={() => setDetailView('cliente')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    detailView === 'cliente'
                      ? 'bg-[#00A9CE] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Cliente
                </button>
              </div>
            </div>

            {detailView === 'conductor' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Nombre Completo</span>
                  <span className="font-medium text-gray-900">{selectedOrder.driver}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Cédula</span>
                  <span className="font-medium text-gray-900">12.345.678</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600 w-32">Teléfono</span>
                  <span className="font-medium text-gray-900">+598 300 123 456</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600 w-32">Email</span>
                  <span className="font-medium text-gray-900">carlos.lopez@oddy.com.uy</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Nombre Completo</span>
                  <span className="font-medium text-gray-900">{selectedOrder.client}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 w-32">Dirección</span>
                  <span className="font-medium text-gray-900">{selectedOrder.destination}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600 w-32">Teléfono</span>
                  <span className="font-medium text-gray-900">+598 99 123 456</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600 w-32">Email</span>
                  <span className="font-medium text-gray-900">{selectedOrder.client.toLowerCase().replace(' ', '.')}@email.com</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
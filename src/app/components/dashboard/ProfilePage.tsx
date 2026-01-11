/**
 * PROFILE PAGE - ODDY Entregas Lite V1
 * 
 * Pagina de perfil del usuario.
 * Muestra datos personales y direcciones guardadas.
 */

import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Building2, Shield, Loader2, MapPin, Plus, Edit2, Trash2, Home, Briefcase, Heart, Search, Printer, Save, ChevronDown, UserPlus, Settings, Clock, MessageSquare, Bell, CheckCircle2, AlertCircle, Users, FileText, Calendar, Globe, Flag } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

interface ClientProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  entity: string | null;
  entityId: string | null;
}

interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  apartment?: string;
  city: string;
  postalCode: string;
  schedule?: string;
  notes?: string;
  isDefault?: boolean;
  isNew?: boolean;
  verified?: boolean;
}

interface PhoneNumber {
  id: string;
  label: string;
  number: string;
  isDefault?: boolean;
  isNew?: boolean;
  verified?: boolean;
}

interface EmailEntry {
  id: string;
  label: string;
  email: string;
  isDefault?: boolean;
  isNew?: boolean;
  verified?: boolean;
}

interface ScheduleRange {
  enabled: boolean;
  from: string;
  to: string;
}

interface ContactPreferences {
  preferredMethod: string;
  preferredValue: string;
  scheduleWeekdays: ScheduleRange;
  scheduleSaturdays: ScheduleRange;
  scheduleSundays: ScheduleRange;
  observations: string;
}

interface AuthorizedContact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  document?: string;
  isAuthorized: boolean;
  isNew?: boolean;
}

interface AdditionalInfo {
  documentType: string;
  documentNumber: string;
  birthDate: string;
  nationality: string;
  residenceCountry: string;
}

// Mock de direcciones para demo
const mockAddresses: Address[] = [
  {
    id: '1',
    label: 'Casa',
    street: 'Av. 18 de Julio',
    number: '1234',
    apartment: 'Apto 5',
    city: 'Montevideo',
    postalCode: '11100',
    schedule: 'Lunes a Viernes 9:00 - 18:00',
    isDefault: true,
    verified: true
  },
  {
    id: '2',
    label: 'Trabajo',
    street: 'Bvar. Artigas',
    number: '567',
    city: 'Montevideo',
    postalCode: '11300',
    schedule: 'Lunes a Viernes 8:00 - 17:00',
    notes: 'Edificio Torre Sur, piso 8',
    verified: false
  }
];

// Mock de celulares para demo
const mockPhones: PhoneNumber[] = [
  {
    id: '1',
    label: 'Personal',
    number: '+598 99 123 456',
    isDefault: true,
    verified: true
  },
  {
    id: '2',
    label: 'Trabajo',
    number: '+598 99 789 012',
    verified: false
  },
  {
    id: '3',
    label: 'Emergencia',
    number: '+598 99 555 333',
    verified: false
  }
];

// Mock de emails para demo
const mockEmails: EmailEntry[] = [];

// Preferencias de contacto por defecto
const defaultPreferences: ContactPreferences = {
  preferredMethod: 'Email',
  preferredValue: '',
  scheduleWeekdays: { enabled: true, from: '09', to: '18' },
  scheduleSaturdays: { enabled: false, from: '09', to: '13' },
  scheduleSundays: { enabled: false, from: '10', to: '12' },
  observations: ''
};

// Opciones de horas disponibles (8 a 21)
const hourOptions = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 8;
  return { value: hour.toString().padStart(2, '0'), label: `${hour}:00` };
});

// Mock de contactos autorizados para demo
const mockAuthorizedContacts: AuthorizedContact[] = [
  {
    id: '1',
    firstName: 'Maria',
    lastName: 'Garcia',
    phone: '+598 99 111 222',
    document: '1.234.567-8',
    isAuthorized: true
  }
];

// Informacion adicional por defecto
const defaultAdditionalInfo: AdditionalInfo = {
  documentType: '',
  documentNumber: '',
  birthDate: '',
  nationality: '',
  residenceCountry: ''
};

// Opciones de tipos de documento
const documentTypeOptions = [
  { value: '', label: 'Seleccionar...' },
  { value: 'CI', label: 'CI (Uruguay)' },
  { value: 'DNI', label: 'DNI' },
  { value: 'Pasaporte', label: 'Pasaporte' },
  { value: 'RUT', label: 'RUT' },
  { value: 'Otro', label: 'Otro' }
];

// Opciones de paises
const countryOptions = [
  { value: '', label: 'Seleccionar...' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'AR', label: 'Argentina' },
  { value: 'BR', label: 'Brasil' },
  { value: 'CL', label: 'Chile' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'Otro', label: 'Otro' }
];

// Iconos por tipo de etiqueta de direccion
const getAddressLabelIcon = (label: string) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('casa') || lowerLabel.includes('hogar')) return Home;
  if (lowerLabel.includes('trabajo') || lowerLabel.includes('oficina')) return Briefcase;
  if (lowerLabel.includes('mama') || lowerLabel.includes('papa') || lowerLabel.includes('familia')) return Heart;
  return MapPin;
};

// Colores por tipo de etiqueta de celular
const getPhoneLabelColor = (label: string) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('personal')) return 'text-[#00A9CE]';
  if (lowerLabel.includes('trabajo') || lowerLabel.includes('oficina')) return 'text-[#FF6B35]';
  if (lowerLabel.includes('emergencia')) return 'text-red-500';
  if (lowerLabel.includes('mama') || lowerLabel.includes('papa') || lowerLabel.includes('esposa') || lowerLabel.includes('esposo') || lowerLabel.includes('hija') || lowerLabel.includes('hijo')) return 'text-purple-500';
  return 'text-green-600';
};

type SelectedItem = {
  type: 'email' | 'phone' | 'entity' | 'auth' | 'address' | 'contact';
  id: string;
} | null;

export function ProfilePage() {
  const { user, profile } = useAuth();
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [phones, setPhones] = useState<PhoneNumber[]>(mockPhones);
  const [emails, setEmails] = useState<EmailEntry[]>(mockEmails);
  const [preferences, setPreferences] = useState<ContactPreferences>(defaultPreferences);
  const [authorizedContacts, setAuthorizedContacts] = useState<AuthorizedContact[]>(mockAuthorizedContacts);
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>(defaultAdditionalInfo);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menu al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profileRef = doc(db, 'client_profiles', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setClientProfile({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || user.email || '',
            phone: data.phone || null,
            entity: data.entity || null,
            entityId: data.entityId || null
          });
        } else {
          setClientProfile({
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            phone: null,
            entity: null,
            entityId: null
          });
        }
      } catch (error) {
        console.error('[ProfilePage] Error cargando perfil:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleAdd = (type: string) => {
    setShowAddMenu(false);
    const newId = `new_${Date.now()}`;
    
    switch (type) {
      case 'Direccion':
        const newAddress: Address = {
          id: newId,
          label: '',
          street: '',
          number: '',
          apartment: '',
          city: '',
          postalCode: '',
          schedule: '',
          notes: '',
          isNew: true
        };
        setAddresses(prev => [...prev, newAddress]);
        setSelectedItem({ type: 'address', id: newId });
        break;
      case 'Email':
        const newEmail: EmailEntry = {
          id: newId,
          label: '',
          email: '',
          isNew: true
        };
        setEmails(prev => [...prev, newEmail]);
        setSelectedItem({ type: 'email', id: newId });
        break;
      case 'Celular':
      case 'Telefono':
        const newPhone: PhoneNumber = {
          id: newId,
          label: type === 'Celular' ? 'Celular' : 'Fijo',
          number: '',
          isNew: true
        };
        setPhones(prev => [...prev, newPhone]);
        setSelectedItem({ type: 'phone', id: newId });
        break;
      default:
        console.log('[ProfilePage] Agregar:', type);
        alert(`Agregar ${type}: proximamente`);
    }
  };
  
  const handleAddressChange = (id: string, field: keyof Address, value: string) => {
    setAddresses(prev => prev.map(addr => 
      addr.id === id ? { ...addr, [field]: value } : addr
    ));
  };

  const handleEmailChange = (id: string, field: keyof EmailEntry, value: string) => {
    setEmails(prev => prev.map(email => 
      email.id === id ? { ...email, [field]: value } : email
    ));
  };

  const handlePhoneChange = (id: string, field: keyof PhoneNumber, value: string) => {
    setPhones(prev => prev.map(phone => 
      phone.id === id ? { ...phone, [field]: value } : phone
    ));
  };

  const handlePreferencesChange = (field: keyof ContactPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleScheduleChange = (
    scheduleType: 'scheduleWeekdays' | 'scheduleSaturdays' | 'scheduleSundays',
    field: keyof ScheduleRange,
    value: string | boolean
  ) => {
    setPreferences(prev => ({
      ...prev,
      [scheduleType]: {
        ...prev[scheduleType],
        [field]: value
      }
    }));
  };

  const handleAuthorizedContactChange = (id: string, field: keyof AuthorizedContact, value: string | boolean) => {
    setAuthorizedContacts(prev => prev.map(contact => 
      contact.id === id ? { ...contact, [field]: value } : contact
    ));
  };

  const handleAddAuthorizedContact = () => {
    const newContact: AuthorizedContact = {
      id: `new_${Date.now()}`,
      firstName: '',
      lastName: '',
      phone: '',
      document: '',
      isAuthorized: true,
      isNew: true
    };
    setAuthorizedContacts(prev => [...prev, newContact]);
  };

  const handleAdditionalInfoChange = (field: keyof AdditionalInfo, value: string) => {
    setAdditionalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleEditProfile = () => {
    console.log('[ProfilePage] Editar perfil');
    alert('Editar perfil: proximamente');
  };

  const handleSave = () => {
    console.log('[ProfilePage] Guardar cambios');
    alert('Guardar: proximamente');
  };

  const handleDelete = () => {
    if (!selectedItem) {
      alert('Selecciona un elemento para eliminar');
      return;
    }
    console.log('[ProfilePage] Eliminar:', selectedItem);
    alert(`Eliminar ${selectedItem.type}: proximamente`);
  };

  const handleSelectItem = (type: SelectedItem['type'], id: string) => {
    if (selectedItem?.type === type && selectedItem?.id === id) {
      setSelectedItem(null);
    } else {
      setSelectedItem({ type: type!, id });
    }
  };

  const handleVerifyPhone = (phoneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[ProfilePage] Verificar telefono:', phoneId);
    alert('Proceso de verificacion por SMS: proximamente');
  };

  const handleVerifyEmail = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[ProfilePage] Verificar email:', emailId);
    alert('Proceso de verificacion por email: proximamente');
  };

  const handleVerifyAddress = (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[ProfilePage] Verificar direccion:', addressId);
    alert('Proceso de verificacion de direccion: proximamente');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayName = clientProfile 
    ? `${clientProfile.firstName} ${clientProfile.lastName}`.trim() || 'Usuario'
    : 'Usuario';

  return (
    <div className="space-y-4">
      {/* Header con titulo */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 w-[150px] min-w-[150px] shrink-0">Mi Perfil</h2>
        {/* Espacio para KPIs si se necesitan en el futuro */}
        <div className="flex-1" />
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
              placeholder="Buscar..."
              className="w-full h-[32px] pl-10 pr-4 border-0 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>

        {/* Botones a la derecha */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Editar */}
          <button
            onClick={handleEditProfile}
            disabled={!selectedItem}
            className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit2 className="h-4 w-4" />
            <span className="text-sm font-medium">Editar</span>
          </button>

          {/* Agregar - Dropdown */}
          <div className="relative" ref={addMenuRef}>
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Agregar</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showAddMenu ? 'rotate-180' : ''}`} />
            </button>

            {showAddMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-50">
                <div className="py-1">
                  <button
                    onClick={() => handleAdd('Direccion')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {`Direcci${'\u00f3'}n`}
                  </button>
                  <button
                    onClick={() => handleAdd('Celular')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Phone className="h-4 w-4 text-gray-500" />
                    Celular
                  </button>
                  <button
                    onClick={() => handleAdd('Telefono')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Phone className="h-4 w-4 text-gray-500" />
                    {`Tel${'\u00e9'}fono`}
                  </button>
                  <button
                    onClick={() => handleAdd('Email')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Mail className="h-4 w-4 text-gray-500" />
                    Email
                  </button>
                  <button
                    onClick={() => handleAdd('Contacto')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <UserPlus className="h-4 w-4 text-gray-500" />
                    Contacto
                  </button>
                  <div className="border-t my-1" />
                  <button
                    onClick={() => handleAdd('Personalizado')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 text-gray-500" />
                    Personalizado
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Eliminar */}
          <button
            onClick={handleDelete}
            disabled={!selectedItem}
            className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-sm font-medium">Eliminar</span>
          </button>

          {/* Guardar */}
          <button
            onClick={handleSave}
            className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <Save className="h-4 w-4" />
            <span className="text-sm font-medium">Guardar</span>
          </button>

          {/* Imprimir */}
          <button className="h-[32px] flex items-center gap-2 px-4 text-white hover:bg-white/10 rounded-md transition-colors">
            <Printer className="h-4 w-4" />
            <span className="text-sm font-medium">Imprimir</span>
          </button>
        </div>
      </div>

      {/* Grid principal: 50% / 50% */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Columna izquierda: Datos personales + Info Adicional */}
        <div className="space-y-4">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-[#00A9CE]/10 flex items-center justify-center">
                <User className="h-7 w-7 text-[#00A9CE]" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{displayName}</CardTitle>
                <CardDescription>
                  {profile?.role === 'admin' ? 'Administrador' : 'Usuario'}
                </CardDescription>
              </div>
              {/* Metodo de acceso - a la derecha */}
              <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">{`M${'\u00e9'}todo de acceso`}</p>
                  <p className="text-xs font-medium">
                    {profile?.provider === 'google' ? 'Google' : `Email y contrase${'\u00f1'}a`}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{`${'\u00da'}ltimo acceso: hoy 10:45`}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-2 pt-0">
            {/* Grid 2 columnas para Email y Telefonos */}
            <div className="grid grid-cols-2 gap-2">
              {/* Email principal - siempre verificado */}
              <div 
                onClick={() => handleSelectItem('email', 'main')}
                className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                  selectedItem?.type === 'email' && selectedItem?.id === 'main'
                    ? 'bg-[#00A9CE]/10 ring-2 ring-[#00A9CE]'
                    : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium truncate">{clientProfile?.email || '\u2014'}</p>
                </div>
                {/* Badge verificado - email principal siempre verificado */}
                <div className="flex items-center justify-center gap-1 w-[85px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="text-[10px] font-medium">Verificado</span>
                </div>
              </div>

              {/* Celulares y Telefonos */}
              {phones.map((phone) => (
                phone.isNew ? (
                  <div 
                    key={phone.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-green-50 ring-2 ring-green-500"
                  >
                    <Phone className="h-4 w-4 text-green-600" />
                    <div className="flex-1 min-w-0 flex gap-2">
                      <input
                        type="text"
                        value={phone.label}
                        onChange={(e) => handlePhoneChange(phone.id, 'label', e.target.value)}
                        placeholder="Etiqueta"
                        className="w-20 text-xs bg-white border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="text"
                        value={phone.number}
                        onChange={(e) => handlePhoneChange(phone.id, 'number', e.target.value)}
                        placeholder="+598 99 123 456"
                        className="flex-1 text-xs bg-white border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div 
                    key={phone.id} 
                    onClick={() => handleSelectItem('phone', phone.id)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                      selectedItem?.type === 'phone' && selectedItem?.id === phone.id
                        ? 'bg-[#00A9CE]/10 ring-2 ring-[#00A9CE]'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <Phone className={`h-4 w-4 ${getPhoneLabelColor(phone.label)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${getPhoneLabelColor(phone.label)}`}>
                          {phone.label}
                        </span>
                        {phone.isDefault && (
                          <span className="text-[9px] bg-[#00A9CE]/10 text-[#00A9CE] px-1 py-0.5 rounded">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium">{phone.number}</p>
                    </div>
                    {/* Badge de verificacion */}
                    {phone.verified ? (
                      <div className="flex items-center justify-center gap-1 w-[85px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="text-[10px] font-medium">Verificado</span>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleVerifyPhone(phone.id, e)}
                        className="flex items-center justify-center gap-1 w-[85px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-[10px] font-medium">Verificar</span>
                      </button>
                    )}
                  </div>
                )
              ))}

              {/* Emails adicionales */}
              {emails.map((emailEntry) => (
                emailEntry.isNew ? (
                  <div 
                    key={emailEntry.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-green-50 ring-2 ring-green-500"
                  >
                    <Mail className="h-4 w-4 text-green-600" />
                    <div className="flex-1 min-w-0 flex gap-2">
                      <input
                        type="text"
                        value={emailEntry.label}
                        onChange={(e) => handleEmailChange(emailEntry.id, 'label', e.target.value)}
                        placeholder="Etiqueta"
                        className="w-20 text-xs bg-white border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="email"
                        value={emailEntry.email}
                        onChange={(e) => handleEmailChange(emailEntry.id, 'email', e.target.value)}
                        placeholder="email@ejemplo.com"
                        className="flex-1 text-xs bg-white border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div 
                    key={emailEntry.id} 
                    onClick={() => handleSelectItem('email', emailEntry.id)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                      selectedItem?.type === 'email' && selectedItem?.id === emailEntry.id
                        ? 'bg-[#00A9CE]/10 ring-2 ring-[#00A9CE]'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {emailEntry.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{emailEntry.email}</p>
                    </div>
                    {/* Badge de verificacion */}
                    {emailEntry.verified ? (
                      <div className="flex items-center justify-center gap-1 w-[85px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="text-[10px] font-medium">Verificado</span>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleVerifyEmail(emailEntry.id, e)}
                        className="flex items-center justify-center gap-1 w-[85px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-[10px] font-medium">Verificar</span>
                      </button>
                    )}
                  </div>
                )
              ))}
            </div>

            {/* Entidad asociada - ancho completo */}
            {clientProfile?.entity && (
              <div 
                onClick={() => handleSelectItem('entity', 'main')}
                className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                  selectedItem?.type === 'entity' && selectedItem?.id === 'main'
                    ? 'bg-[#00A9CE]/10 ring-2 ring-[#00A9CE]'
                    : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Entidad asociada</p>
                  <p className="text-sm font-medium truncate">{clientProfile.entity}</p>
                </div>
              </div>
            )}

            {/* Separador */}
            <div className="border-t my-2" />

            {/* Medio preferente de contacto - grid 2 columnas alineado con campos superiores */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg">
                <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Medio preferente</p>
                  <select 
                    value={preferences.preferredMethod}
                    onChange={(e) => {
                      handlePreferencesChange('preferredMethod', e.target.value);
                      handlePreferencesChange('preferredValue', '');
                    }}
                    className="text-sm font-medium bg-transparent border-none p-0 w-full focus:outline-none focus:ring-0 cursor-pointer"
                  >
                    <option value="Email">Email</option>
                    <option value="Celular">Celular</option>
                    <option value="Telefono">{`Tel${'\u00e9'}fono`}</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Contacto preferente</p>
                  <select 
                    value={preferences.preferredValue}
                    onChange={(e) => handlePreferencesChange('preferredValue', e.target.value)}
                    className="text-sm font-medium bg-transparent border-none p-0 w-full focus:outline-none focus:ring-0 cursor-pointer"
                  >
                    <option value="">Seleccionar...</option>
                    {preferences.preferredMethod === 'Email' && (
                      <>
                        <option value={clientProfile?.email || ''}>{clientProfile?.email || 'Email principal'}</option>
                        {emails.filter(e => !e.isNew).map(e => (
                          <option key={e.id} value={e.email}>{e.label}: {e.email}</option>
                        ))}
                      </>
                    )}
                    {(preferences.preferredMethod === 'Celular' || preferences.preferredMethod === 'WhatsApp') && (
                      phones.filter(p => !p.isNew).map(p => (
                        <option key={p.id} value={p.number}>{p.label}: {p.number}</option>
                      ))
                    )}
                    {preferences.preferredMethod === 'Telefono' && (
                      phones.filter(p => !p.isNew).map(p => (
                        <option key={p.id} value={p.number}>{p.label}: {p.number}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Horario de contacto - 3 subdivisiones */}
            <div className="p-2.5 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium">Horario de contacto</p>
              </div>
              
              {/* Grid de 3 columnas para los horarios */}
              <div className="grid grid-cols-3 gap-2">
                {/* Habiles (Lunes a Viernes) */}
                <div className="p-2 rounded-md border bg-white border-gray-200">
                  <label className="flex items-center justify-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.scheduleWeekdays.enabled}
                      onChange={(e) => handleScheduleChange('scheduleWeekdays', 'enabled', e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-[#00A9CE] focus:ring-[#00A9CE]"
                    />
                    <span className="text-xs font-medium">{`H${'\u00e1'}biles`}</span>
                  </label>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <select
                      value={preferences.scheduleWeekdays.from}
                      onChange={(e) => handleScheduleChange('scheduleWeekdays', 'from', e.target.value)}
                      disabled={!preferences.scheduleWeekdays.enabled}
                      className="text-xs bg-white border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#00A9CE] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hourOptions.map(h => (
                        <option key={h.value} value={h.value}>{h.label}</option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground">a</span>
                    <select
                      value={preferences.scheduleWeekdays.to}
                      onChange={(e) => handleScheduleChange('scheduleWeekdays', 'to', e.target.value)}
                      disabled={!preferences.scheduleWeekdays.enabled}
                      className="text-xs bg-white border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#00A9CE] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hourOptions.map(h => (
                        <option key={h.value} value={h.value}>{h.label}</option>
                      ))}
                    </select>
                  </div>
                  {/* Barra de 24 horas */}
                  <div className="flex mt-2 h-2 rounded overflow-hidden">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const fromHour = parseInt(preferences.scheduleWeekdays.from);
                      const toHour = parseInt(preferences.scheduleWeekdays.to);
                      const isActive = preferences.scheduleWeekdays.enabled && hour >= fromHour && hour < toHour;
                      return (
                        <div 
                          key={hour} 
                          className={`flex-1 ${isActive ? 'bg-green-500' : 'bg-red-400'}`}
                          title={`${hour}:00`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Sabados y Laborables */}
                <div className="p-2 rounded-md border bg-white border-gray-200">
                  <label className="flex items-center justify-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.scheduleSaturdays.enabled}
                      onChange={(e) => handleScheduleChange('scheduleSaturdays', 'enabled', e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-[#00A9CE] focus:ring-[#00A9CE]"
                    />
                    <span className="text-xs font-medium">{`S${'\u00e1'}bados`}</span>
                  </label>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <select
                      value={preferences.scheduleSaturdays.from}
                      onChange={(e) => handleScheduleChange('scheduleSaturdays', 'from', e.target.value)}
                      disabled={!preferences.scheduleSaturdays.enabled}
                      className="text-xs bg-white border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#00A9CE] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hourOptions.map(h => (
                        <option key={h.value} value={h.value}>{h.label}</option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground">a</span>
                    <select
                      value={preferences.scheduleSaturdays.to}
                      onChange={(e) => handleScheduleChange('scheduleSaturdays', 'to', e.target.value)}
                      disabled={!preferences.scheduleSaturdays.enabled}
                      className="text-xs bg-white border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#00A9CE] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hourOptions.map(h => (
                        <option key={h.value} value={h.value}>{h.label}</option>
                      ))}
                    </select>
                  </div>
                  {/* Barra de 24 horas */}
                  <div className="flex mt-2 h-2 rounded overflow-hidden">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const fromHour = parseInt(preferences.scheduleSaturdays.from);
                      const toHour = parseInt(preferences.scheduleSaturdays.to);
                      const isActive = preferences.scheduleSaturdays.enabled && hour >= fromHour && hour < toHour;
                      return (
                        <div 
                          key={hour} 
                          className={`flex-1 ${isActive ? 'bg-green-500' : 'bg-red-400'}`}
                          title={`${hour}:00`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Domingos y No Laborables */}
                <div className="p-2 rounded-md border bg-white border-gray-200">
                  <label className="flex items-center justify-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.scheduleSundays.enabled}
                      onChange={(e) => handleScheduleChange('scheduleSundays', 'enabled', e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-[#00A9CE] focus:ring-[#00A9CE]"
                    />
                    <span className="text-xs font-medium">Domingos</span>
                  </label>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <select
                      value={preferences.scheduleSundays.from}
                      onChange={(e) => handleScheduleChange('scheduleSundays', 'from', e.target.value)}
                      disabled={!preferences.scheduleSundays.enabled}
                      className="text-xs bg-white border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#00A9CE] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hourOptions.map(h => (
                        <option key={h.value} value={h.value}>{h.label}</option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground">a</span>
                    <select
                      value={preferences.scheduleSundays.to}
                      onChange={(e) => handleScheduleChange('scheduleSundays', 'to', e.target.value)}
                      disabled={!preferences.scheduleSundays.enabled}
                      className="text-xs bg-white border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#00A9CE] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hourOptions.map(h => (
                        <option key={h.value} value={h.value}>{h.label}</option>
                      ))}
                    </select>
                  </div>
                  {/* Barra de 24 horas */}
                  <div className="flex mt-2 h-2 rounded overflow-hidden">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const fromHour = parseInt(preferences.scheduleSundays.from);
                      const toHour = parseInt(preferences.scheduleSundays.to);
                      const isActive = preferences.scheduleSundays.enabled && hour >= fromHour && hour < toHour;
                      return (
                        <div 
                          key={hour} 
                          className={`flex-1 ${isActive ? 'bg-green-500' : 'bg-red-400'}`}
                          title={`${hour}:00`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones - ancho completo */}
            <div className="flex items-start gap-3 p-2.5 bg-muted/50 rounded-lg">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Observaciones</p>
                <textarea 
                  value={preferences.observations}
                  onChange={(e) => handlePreferencesChange('observations', e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={2}
                  className="text-sm font-medium bg-transparent border-none p-0 w-full focus:outline-none focus:ring-0 resize-none placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta de Informacion Adicional - debajo del card principal */}
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#00A9CE]" />
              <CardTitle className="text-sm">{`Informaci${'\u00f3'}n Adicional`}</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {`Informaci${'\u00f3'}n voluntaria para mejorar tu experiencia`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {/* Tipo y Numero de Documento */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Tipo de documento</p>
                <select
                  value={additionalInfo.documentType}
                  onChange={(e) => handleAdditionalInfoChange('documentType', e.target.value)}
                  className="text-sm font-medium bg-transparent border-none p-0 w-full focus:outline-none focus:ring-0 cursor-pointer"
                >
                  {documentTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="p-2.5 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{`N${'\u00fa'}mero de documento`}</p>
                <input
                  type="text"
                  value={additionalInfo.documentNumber}
                  onChange={(e) => handleAdditionalInfoChange('documentNumber', e.target.value)}
                  placeholder="Ej: 1.234.567-8"
                  className="text-sm font-medium bg-transparent border-none p-0 w-full focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="p-2.5 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Fecha de nacimiento</p>
                  <input
                    type="date"
                    value={additionalInfo.birthDate}
                    onChange={(e) => handleAdditionalInfoChange('birthDate', e.target.value)}
                    className="text-sm font-medium bg-transparent border-none p-0 w-full focus:outline-none focus:ring-0"
                  />
                </div>
              </div>
            </div>

            {/* Nacionalidad y Pais de Residencia */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Nacionalidad</p>
                    <select
                      value={additionalInfo.nationality}
                      onChange={(e) => handleAdditionalInfoChange('nationality', e.target.value)}
                      className="text-sm font-medium bg-transparent border-none p-0 w-full focus:outline-none focus:ring-0 cursor-pointer"
                    >
                      {countryOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{`Pa${'\u00ed'}s de residencia`}</p>
                    <select
                      value={additionalInfo.residenceCountry}
                      onChange={(e) => handleAdditionalInfoChange('residenceCountry', e.target.value)}
                      className="text-sm font-medium bg-transparent border-none p-0 w-full focus:outline-none focus:ring-0 cursor-pointer"
                    >
                      {countryOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Columna derecha: Direcciones y Contactos Autorizados */}
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tienes direcciones guardadas</p>
                <Button variant="link" size="sm" onClick={() => handleAdd('Direccion')} className="mt-2">
                  {`Agregar primera direcci${'\u00f3'}n`}
                </Button>
              </div>
            </Card>
          ) : (
            addresses.map((address) => {
              const LabelIcon = getAddressLabelIcon(address.label);
              const isSelected = selectedItem?.type === 'address' && selectedItem?.id === address.id;
              
              return (
                <Card 
                  key={address.id} 
                  onClick={() => !address.isNew && handleSelectItem('address', address.id)}
                  className={`p-3 transition-all ${
                    address.isNew 
                      ? 'ring-2 ring-green-500 bg-green-50'
                      : isSelected
                        ? 'ring-2 ring-[#00A9CE] bg-[#00A9CE]/5 cursor-pointer'
                        : 'hover:bg-muted/50 cursor-pointer'
                  }`}
                >
                  {address.isNew ? (
                    // Vista editable para nueva direccion
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <input
                          type="text"
                          value={address.label}
                          onChange={(e) => handleAddressChange(address.id, 'label', e.target.value)}
                          placeholder="Etiqueta (Casa, Trabajo, etc.)"
                          className="flex-1 text-sm font-medium bg-white border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={address.street}
                          onChange={(e) => handleAddressChange(address.id, 'street', e.target.value)}
                          placeholder="Calle"
                          className="col-span-2 text-xs bg-white border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <input
                          type="text"
                          value={address.number}
                          onChange={(e) => handleAddressChange(address.id, 'number', e.target.value)}
                          placeholder="Nro"
                          className="text-xs bg-white border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={address.apartment || ''}
                          onChange={(e) => handleAddressChange(address.id, 'apartment', e.target.value)}
                          placeholder="Apto/Depto"
                          className="text-xs bg-white border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => handleAddressChange(address.id, 'city', e.target.value)}
                          placeholder="Ciudad"
                          className="text-xs bg-white border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <input
                          type="text"
                          value={address.postalCode}
                          onChange={(e) => handleAddressChange(address.id, 'postalCode', e.target.value)}
                          placeholder="CP"
                          className="text-xs bg-white border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <input
                        type="text"
                        value={address.schedule || ''}
                        onChange={(e) => handleAddressChange(address.id, 'schedule', e.target.value)}
                        placeholder="Horario (Ej: Lunes a Viernes 9:00 - 18:00)"
                        className="w-full text-xs bg-white border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <textarea
                        value={address.notes || ''}
                        onChange={(e) => handleAddressChange(address.id, 'notes', e.target.value)}
                        placeholder="Observaciones..."
                        rows={2}
                        className="w-full text-xs bg-white border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ) : (
                    // Vista normal
                    <div className="flex items-start gap-3">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        address.isDefault ? 'bg-[#00A9CE]/10' : 'bg-muted'
                      }`}>
                        <LabelIcon className={`h-4 w-4 ${
                          address.isDefault ? 'text-[#00A9CE]' : 'text-muted-foreground'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{address.label || 'Sin etiqueta'}</span>
                          {address.isDefault && (
                            <span className="text-[10px] bg-[#00A9CE]/10 text-[#00A9CE] px-1.5 py-0.5 rounded">
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {address.street} {address.number}
                          {address.apartment && `, ${address.apartment}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {address.city} - CP {address.postalCode}
                        </p>
                        {address.schedule && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {address.schedule}
                          </p>
                        )}
                        {address.notes && (
                          <p className="text-xs text-muted-foreground/70 mt-1 truncate italic">
                            {address.notes}
                          </p>
                        )}
                      </div>

                      {/* Badge de verificacion de direccion */}
                      <div className="shrink-0">
                        {address.verified ? (
                          <div className="flex items-center justify-center gap-1 w-[85px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="text-[10px] font-medium">Verificado</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleVerifyAddress(address.id, e)}
                            className="flex items-center justify-center gap-1 w-[85px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-[10px] font-medium">Verificar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}

          {/* Tarjeta de Contactos Autorizados */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#FF6B35]" />
                  <CardTitle className="text-sm">Contactos Autorizados</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleAddAuthorizedContact}
                  className="h-7 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar
                </Button>
              </div>
              <CardDescription className="text-xs">
                Personas autorizadas a recibir en tu nombre
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {authorizedContacts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No hay contactos autorizados</p>
                </div>
              ) : (
                authorizedContacts.map((contact) => (
                  <div 
                    key={contact.id}
                    onClick={() => !contact.isNew && handleSelectItem('contact', contact.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      contact.isNew 
                        ? 'ring-2 ring-green-500 bg-green-50'
                        : selectedItem?.type === 'contact' && selectedItem?.id === contact.id
                          ? 'ring-2 ring-[#00A9CE] bg-[#00A9CE]/5 cursor-pointer'
                          : 'bg-white hover:bg-muted/50 cursor-pointer'
                    }`}
                  >
                    {contact.isNew ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={contact.firstName}
                            onChange={(e) => handleAuthorizedContactChange(contact.id, 'firstName', e.target.value)}
                            placeholder="Nombre"
                            className="text-xs bg-white border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            type="text"
                            value={contact.lastName}
                            onChange={(e) => handleAuthorizedContactChange(contact.id, 'lastName', e.target.value)}
                            placeholder="Apellido"
                            className="text-xs bg-white border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={contact.phone}
                            onChange={(e) => handleAuthorizedContactChange(contact.id, 'phone', e.target.value)}
                            placeholder="Celular"
                            className="text-xs bg-white border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            type="text"
                            value={contact.document || ''}
                            onChange={(e) => handleAuthorizedContactChange(contact.id, 'document', e.target.value)}
                            placeholder="Documento (opcional)"
                            className="text-xs bg-white border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={contact.isAuthorized}
                            onChange={(e) => handleAuthorizedContactChange(contact.id, 'isAuthorized', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35]"
                          />
                          <span className="text-xs text-muted-foreground">
                            Autorizo a recibir env{'\u00ed'}os en mi nombre
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#FF6B35]/10 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-[#FF6B35]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{contact.firstName} {contact.lastName}</p>
                          <p className="text-xs text-muted-foreground">{contact.phone}</p>
                          {contact.document && (
                            <p className="text-xs text-muted-foreground">Doc: {contact.document}</p>
                          )}
                        </div>
                        {contact.isAuthorized && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="text-[10px] font-medium">Autorizado</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

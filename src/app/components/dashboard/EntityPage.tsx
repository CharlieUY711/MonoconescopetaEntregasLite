/**
 * ENTITY PAGE - ODDY Entregas Lite V1
 * 
 * Página de la entidad asociada al usuario.
 * Muestra información de la empresa/organización.
 */

import { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Users, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

interface EntityData {
  name: string;
  rut: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  contactName: string | null;
  memberCount?: number;
}

export function EntityPage() {
  const { user } = useAuth();
  const [entity, setEntity] = useState<EntityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEntity() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Primero obtener el entityId del perfil del cliente
        const profileRef = doc(db, 'client_profiles', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
          setError('No se encontró tu perfil');
          setLoading(false);
          return;
        }

        const profileData = profileSnap.data();
        const entityId = profileData.entityId;

        if (!entityId) {
          setError('No tienes una entidad asociada');
          setLoading(false);
          return;
        }

        // Obtener datos de la entidad
        const entityRef = doc(db, 'entities', entityId);
        const entitySnap = await getDoc(entityRef);

        if (!entitySnap.exists()) {
          setError('No se encontró la información de la entidad');
          setLoading(false);
          return;
        }

        const entityData = entitySnap.data();
        setEntity({
          name: entityData.name || 'Sin nombre',
          rut: entityData.rut || null,
          address: entityData.address || null,
          phone: entityData.phone || null,
          email: entityData.email || null,
          contactName: entityData.contactName || null,
          memberCount: entityData.memberCount
        });
      } catch (err) {
        console.error('[EntityPage] Error cargando entidad:', err);
        setError('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    }

    loadEntity();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Entidad</h1>
          <p className="text-muted-foreground">
            Información de tu empresa u organización
          </p>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Entidad</h1>
        <p className="text-muted-foreground">
          Información de tu empresa u organización
        </p>
      </div>

      {/* Card de Entidad */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <CardTitle>{entity?.name}</CardTitle>
              <CardDescription>
                {entity?.rut ? `RUT: ${entity.rut}` : 'Entidad asociada'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Dirección */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Dirección</p>
              <p className="font-medium">{entity?.address || '—'}</p>
            </div>
          </div>

          {/* Teléfono */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Teléfono</p>
              <p className="font-medium">{entity?.phone || '—'}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{entity?.email || '—'}</p>
            </div>
          </div>

          {/* Contacto */}
          {entity?.contactName && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Contacto principal</p>
                <p className="font-medium">{entity.contactName}</p>
              </div>
            </div>
          )}

          {/* Miembros */}
          {entity?.memberCount !== undefined && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Miembros</p>
                <p className="font-medium">{entity.memberCount} usuario(s)</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

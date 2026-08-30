import { useState, useEffect } from 'react'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonList, IonItem, IonLabel, IonInput, IonText, IonSelect, IonSelectOption,
} from '@ionic/react'
import type { Client, ClientCreate, ClientUpdate } from '../../types/sales'

interface ClientFormDialogProps {
  open: boolean
  client: Client | null
  onClose: () => void
  onSave: (clientId: number | null, data: ClientCreate | ClientUpdate) => void
  isLoading: boolean
  error: string | null
}

export const ClientFormDialog = ({
  open,
  client,
  onClose,
  onSave,
  isLoading,
  error,
}: ClientFormDialogProps) => {
  const isEditing = !!client
  const [tipoCliente, setTipoCliente] = useState<'empresa' | 'persona_natural'>('persona_natural')
  const [nombreRazonSocial, setNombreRazonSocial] = useState('')
  const [nitCc, setNitCc] = useState('')
  const [nombreContacto, setNombreContacto] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [estado, setEstado] = useState<Client['estado']>('activo')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (client) {
      setTipoCliente(client.tipo_cliente)
      setNombreRazonSocial(client.nombre_razon_social)
      setNitCc(client.nit_cc)
      setNombreContacto(client.nombre_contacto || '')
      setTelefono(client.telefono || '')
      setEmail(client.email || '')
      setDireccion(client.direccion || '')
      setCiudad(client.ciudad || '')
      setObservaciones(client.observaciones || '')
      setEstado(client.estado)
    } else {
      setTipoCliente('persona_natural')
      setNombreRazonSocial('')
      setNitCc('')
      setNombreContacto('')
      setTelefono('')
      setEmail('')
      setDireccion('')
      setCiudad('')
      setObservaciones('')
      setEstado('activo')
    }
    setValidationError(null)
  }, [client, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!nombreRazonSocial.trim()) {
      setValidationError('El nombre o razón social es obligatorio')
      return
    }

    if (!nitCc || nitCc.trim().length < 5) {
      setValidationError('El NIT/CC es obligatorio y debe tener al menos 5 caracteres')
      return
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('El email no tiene un formato válido')
      return
    }

    if (isEditing) {
      onSave(client!.id_cliente, {
        tipo_cliente: tipoCliente,
        nombre_razon_social: nombreRazonSocial,
        nit_cc: nitCc,
        nombre_contacto: nombreContacto || undefined,
        telefono: telefono || undefined,
        email: email || undefined,
        direccion: direccion || undefined,
        ciudad: ciudad || undefined,
        observaciones: observaciones || undefined,
        estado,
      } as ClientUpdate)
    } else {
      onSave(null, {
        tipo_cliente: tipoCliente,
        nombre_razon_social: nombreRazonSocial,
        nit_cc: nitCc,
        nombre_contacto: nombreContacto || undefined,
        telefono: telefono || undefined,
        email: email || undefined,
        direccion: direccion || undefined,
        ciudad: ciudad || undefined,
        observaciones: observaciones || undefined,
      } as ClientCreate)
    }
  }

  return (
    <IonModal isOpen={open} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonTitle>{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} style={{ color: '#fff' }}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={handleSubmit} style={{ padding: 16 }}>
          {(validationError || error) && (
            <IonText color="danger" style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
              {validationError || error}
            </IonText>
          )}

          <IonList style={{ background: 'transparent' }}>
            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Tipo de cliente</IonLabel>
                <IonSelect value={tipoCliente} onIonChange={(e) => setTipoCliente(e.detail.value)} interface="popover">
                  <IonSelectOption value="persona_natural">Persona natural</IonSelectOption>
                  <IonSelectOption value="empresa">Empresa</IonSelectOption>
                </IonSelect>
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Nombre / Razón social</IonLabel>
                <IonInput value={nombreRazonSocial} onIonChange={(e) => setNombreRazonSocial(e.detail.value || '')} required />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>NIT / CC</IonLabel>
                <IonInput value={nitCc} onIonChange={(e) => setNitCc(e.detail.value || '')} required />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Nombre de contacto</IonLabel>
                <IonInput value={nombreContacto} onIonChange={(e) => setNombreContacto(e.detail.value || '')} />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Teléfono</IonLabel>
                <IonInput type="tel" value={telefono} onIonChange={(e) => setTelefono(e.detail.value || '')} />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Email</IonLabel>
                <IonInput type="email" value={email} onIonChange={(e) => setEmail(e.detail.value || '')} />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Dirección</IonLabel>
                <IonInput value={direccion} onIonChange={(e) => setDireccion(e.detail.value || '')} />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Ciudad</IonLabel>
                <IonInput value={ciudad} onIonChange={(e) => setCiudad(e.detail.value || '')} />
              </IonItem>
            </div>

            {isEditing && (
              <div className="ion-input-wrapper">
                <IonItem lines="none" style={{ '--background': 'transparent' }}>
                  <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Estado</IonLabel>
                  <IonSelect value={estado} onIonChange={(e) => setEstado(e.detail.value)} interface="popover">
                    <IonSelectOption value="activo">Activo</IonSelectOption>
                    <IonSelectOption value="inactivo">Inactivo</IonSelectOption>
                    <IonSelectOption value="prospecto">Prospecto</IonSelectOption>
                    <IonSelectOption value="frecuente">Frecuente</IonSelectOption>
                    <IonSelectOption value="corporativo">Corporativo</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </div>
            )}

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Observaciones</IonLabel>
                <IonInput value={observaciones} onIonChange={(e) => setObservaciones(e.detail.value || '')} />
              </IonItem>
            </div>
          </IonList>

          <IonButton expand="block" type="submit" disabled={isLoading} style={{ marginTop: 24 }}>
            {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Cliente'}
          </IonButton>
        </form>
      </IonContent>
    </IonModal>
  )
}

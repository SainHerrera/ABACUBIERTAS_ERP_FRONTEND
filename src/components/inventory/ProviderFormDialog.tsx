import { useState, useEffect } from 'react'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonList, IonItem, IonLabel, IonInput, IonText, IonSelect, IonSelectOption,
} from '@ionic/react'
import type { Provider, ProviderCreate, ProviderUpdate } from '../../types/provider'
import { CATEGORIA_MATERIAL_OPTIONS } from '../../types/provider'

interface ProviderFormDialogProps {
  open: boolean
  provider: Provider | null
  onClose: () => void
  onSave: (providerId: number | null, data: ProviderCreate | ProviderUpdate) => void
  isLoading: boolean
  error: string | null
}

export const ProviderFormDialog = ({
  open,
  provider,
  onClose,
  onSave,
  isLoading,
  error,
}: ProviderFormDialogProps) => {
  const isEditing = !!provider
  const [nombreEmpresa, setNombreEmpresa] = useState('')
  const [nit, setNit] = useState('')
  const [contacto, setContacto] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [categoriaMaterial, setCategoriaMaterial] = useState('general')
  const [condicionesPago, setCondicionesPago] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (provider) {
      setNombreEmpresa(provider.nombre_empresa)
      setNit(provider.nit)
      setContacto(provider.contacto || '')
      setTelefono(provider.telefono || '')
      setEmail(provider.email || '')
      setDireccion(provider.direccion || '')
      setCiudad(provider.ciudad || '')
      setCategoriaMaterial(provider.categoria_material || 'general')
      setCondicionesPago(provider.condiciones_pago || '')
      setObservaciones(provider.observaciones || '')
    } else {
      setNombreEmpresa('')
      setNit('')
      setContacto('')
      setTelefono('')
      setEmail('')
      setDireccion('')
      setCiudad('')
      setCategoriaMaterial('general')
      setCondicionesPago('')
      setObservaciones('')
    }
    setValidationError(null)
  }, [provider, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!nombreEmpresa) {
      setValidationError('El nombre del proveedor es obligatorio')
      return
    }

    if (!nit || nit.length < 5) {
      setValidationError('El NIT es obligatorio y debe tener al menos 5 caracteres')
      return
    }

    const base = {
      nombre_empresa: nombreEmpresa,
      nit,
      contacto: contacto || undefined,
      telefono: telefono || undefined,
      email: email || undefined,
      direccion: direccion || undefined,
      ciudad: ciudad || undefined,
      categoria_material: categoriaMaterial,
      condiciones_pago: condicionesPago || undefined,
      observaciones: observaciones || undefined,
    }

    if (isEditing) {
      onSave(provider!.id_proveedor, base as ProviderUpdate)
    } else {
      onSave(null, base as ProviderCreate)
    }
  }

  return (
    <IonModal isOpen={open} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonTitle>{isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</IonTitle>
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
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Nombre del proveedor</IonLabel>
                <IonInput value={nombreEmpresa} onIonChange={(e) => setNombreEmpresa(e.detail.value || '')} required />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>NIT</IonLabel>
                <IonInput value={nit} onIonChange={(e) => setNit(e.detail.value || '')} required />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Contacto</IonLabel>
                <IonInput value={contacto} onIonChange={(e) => setContacto(e.detail.value || '')} />
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

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Categoría de material</IonLabel>
                <IonSelect value={categoriaMaterial} onIonChange={(e) => setCategoriaMaterial(e.detail.value)} interface="popover">
                  {CATEGORIA_MATERIAL_OPTIONS.map((opt) => (
                    <IonSelectOption key={opt.value} value={opt.value}>{opt.label}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Condiciones de pago</IonLabel>
                <IonInput value={condicionesPago} onIonChange={(e) => setCondicionesPago(e.detail.value || '')} placeholder="Ej: 30 días" />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Observaciones</IonLabel>
                <IonInput value={observaciones} onIonChange={(e) => setObservaciones(e.detail.value || '')} />
              </IonItem>
            </div>
          </IonList>

          <IonButton expand="block" type="submit" disabled={isLoading} style={{ marginTop: 24 }}>
            {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Proveedor'}
          </IonButton>
        </form>
      </IonContent>
    </IonModal>
  )
}

import { useState, useEffect } from 'react'
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonText } from '@ionic/react'
import type { User, UserRole, UserUpdateRequest } from '../../types/auth'

interface UserFormDialogProps {
  open: boolean
  user: User | null
  onClose: () => void
  onSave: (userId: number | null, data: UserUpdateRequest) => void
  isLoading: boolean
  error: string | null
}

const roles: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'ventas', label: 'Ventas' },
  { value: 'compras', label: 'Compras' },
  { value: 'bodega', label: 'Bodega' },
  { value: 'gerencia', label: 'Gerencia' },
]

export const UserFormDialog = ({
  open,
  user,
  onClose,
  onSave,
  isLoading,
  error,
}: UserFormDialogProps) => {
  const isEditing = !!user
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState<UserRole>('ventas')
  const [activo, setActivo] = useState(true)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setNombre(user.nombre)
      setEmail(user.email)
      setPassword('')
      setRol(user.rol)
      setActivo(user.activo)
    } else {
      setNombre('')
      setEmail('')
      setPassword('')
      setRol('ventas')
      setActivo(true)
    }
    setValidationError(null)
  }, [user, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!nombre || !email) {
      setValidationError('Nombre y email son obligatorios')
      return
    }

    if (!isEditing && !password) {
      setValidationError('La contraseña es obligatoria para nuevos usuarios')
      return
    }

    if (password && password.length < 8) {
      setValidationError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    const data: UserUpdateRequest = { nombre, email, rol, activo }
    if (password) data.password = password
    onSave(user?.id_usuario ?? null, data)
  }

  return (
    <IonModal isOpen={open} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonTitle>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</IonTitle>
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
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Nombre completo</IonLabel>
                <IonInput value={nombre} onIonInput={(e) => setNombre(e.detail.value || '')} onIonChange={(e) => setNombre(e.detail.value || '')} required />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Correo electrónico</IonLabel>
                <IonInput type="email" value={email} onIonInput={(e) => setEmail(e.detail.value || '')} onIonChange={(e) => setEmail(e.detail.value || '')} required />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>
                  {isEditing ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}
                </IonLabel>
                <IonInput type="password" value={password} onIonInput={(e) => setPassword(e.detail.value || '')} onIonChange={(e) => setPassword(e.detail.value || '')} required={!isEditing} />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Rol</IonLabel>
                <IonSelect value={rol} onIonChange={(e) => setRol(e.detail.value)} interface="popover">
                  {roles.map((r) => (
                    <IonSelectOption key={r.value} value={r.value}>{r.label}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </div>

            {isEditing && (
              <div className="ion-input-wrapper">
                <IonItem lines="none" style={{ '--background': 'transparent' }}>
                  <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Estado</IonLabel>
                  <IonSelect value={activo ? 'activo' : 'inactivo'} onIonChange={(e) => setActivo(e.detail.value === 'activo')} interface="popover">
                    <IonSelectOption value="activo">Activo</IonSelectOption>
                    <IonSelectOption value="inactivo">Inactivo</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </div>
            )}
          </IonList>

          <IonButton expand="block" type="submit" disabled={isLoading} style={{ marginTop: 24 }}>
            {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
          </IonButton>
        </form>
      </IonContent>
    </IonModal>
  )
}

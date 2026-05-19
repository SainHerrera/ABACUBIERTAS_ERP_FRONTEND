import { useState } from 'react'
import { useHistory, Link } from 'react-router-dom'
import { IonList, IonItem, IonLabel, IonInput, IonButton, IonText, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { useAppSelector } from '../../hooks/useAppSelector'
import { register, clearError } from '../../store/slices/authSlice'
import type { UserRole } from '../../types/auth'

const roles: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'ventas', label: 'Ventas' },
  { value: 'compras', label: 'Compras' },
]

export const RegisterForm = () => {
  const dispatch = useAppDispatch()
  const history = useHistory()
  const { isLoading, error } = useAppSelector((state) => state.auth)
  const [present] = useIonToast()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState<UserRole>('ventas')
  const [validationError, setValidationError] = useState<string | null>(null)

  const showError = (msg: string) => {
    present({ message: msg, duration: 3000, color: 'danger', position: 'top' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    dispatch(clearError())

    if (!nombre || !email || !password) {
      setValidationError('Todos los campos son obligatorios')
      return
    }

    if (password.length < 8) {
      setValidationError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    const result = await dispatch(register({ email, password, nombre, rol }))

    if (register.fulfilled.match(result)) {
      present({ message: 'Cuenta creada correctamente. Inicia sesión.', duration: 3000, color: 'success', position: 'top' })
      history.push('/login')
    } else {
      showError(error || 'Error al registrar')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {(validationError) && (
        <IonText color="danger" style={{ fontSize: 14, display: 'block', marginBottom: 12, textAlign: 'center' }}>
          {validationError}
        </IonText>
      )}

      <IonList style={{ background: 'transparent' }}>
        <div className="ion-input-wrapper">
          <IonItem lines="none" style={{ '--background': 'transparent' }}>
            <IonLabel position="stacked" style={{ fontSize: 12, color: '#64748b' }}>Nombre completo</IonLabel>
            <IonInput
              value={nombre}
              onIonChange={(e) => setNombre(e.detail.value || '')}
              placeholder="Tu nombre"
              required
            />
          </IonItem>
        </div>

        <div className="ion-input-wrapper">
          <IonItem lines="none" style={{ '--background': 'transparent' }}>
            <IonLabel position="stacked" style={{ fontSize: 12, color: '#64748b' }}>Correo electrónico</IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value || '')}
              placeholder="correo@ejemplo.com"
              required
            />
          </IonItem>
        </div>

        <div className="ion-input-wrapper">
          <IonItem lines="none" style={{ '--background': 'transparent' }}>
            <IonLabel position="stacked" style={{ fontSize: 12, color: '#64748b' }}>Contraseña</IonLabel>
            <IonInput
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value || '')}
              placeholder="Mínimo 8 caracteres"
              required
            />
          </IonItem>
        </div>

        <div className="ion-input-wrapper">
          <IonItem lines="none" style={{ '--background': 'transparent' }}>
            <IonLabel position="stacked" style={{ fontSize: 12, color: '#64748b' }}>Rol</IonLabel>
            <IonSelect value={rol} onIonChange={(e) => setRol(e.detail.value)} interface="popover">
              {roles.map((r) => (
                <IonSelectOption key={r.value} value={r.value}>{r.label}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </div>
      </IonList>

      <IonButton
        expand="block"
        type="submit"
        disabled={isLoading}
        style={{ marginTop: 16, marginBottom: 12, height: 48, fontSize: 16, fontWeight: 600 }}
      >
        {isLoading ? 'Registrando...' : 'Crear Cuenta'}
      </IonButton>

      <div style={{ textAlign: 'center' }}>
        <Link to="/login" style={{ color: 'var(--ion-color-primary)', fontSize: 14 }}>
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </div>
    </form>
  )
}

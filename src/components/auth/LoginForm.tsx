import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IonList, IonItem, IonLabel, IonInput, IonButton, IonText, useIonToast } from '@ionic/react'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { useAppSelector } from '../../hooks/useAppSelector'
import { login, clearError } from '../../store/slices/authSlice'

export const LoginForm = () => {
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector((state) => state.auth)
  const [present] = useIonToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const showError = (msg: string) => {
    present({ message: msg, duration: 3000, color: 'danger', position: 'top' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    dispatch(clearError())

    if (!email || !password) {
      setValidationError('Todos los campos son obligatorios')
      return
    }

    const result = await dispatch(login({ email, password }))

    if (login.fulfilled.match(result)) {
      window.location.replace('/dashboard')
    } else {
      showError((result.payload as string) || 'Error al iniciar sesión')
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
              placeholder="••••••••"
              required
            />
          </IonItem>
        </div>
      </IonList>

      <IonButton
        expand="block"
        type="submit"
        disabled={isLoading}
        style={{ marginTop: 16, marginBottom: 12, height: 48, fontSize: 16, fontWeight: 600 }}
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </IonButton>

      <div style={{ textAlign: 'center' }}>
        <Link to="/register" style={{ color: 'var(--ion-color-primary)', fontSize: 14 }}>
          ¿No tienes cuenta? Regístrate
        </Link>
      </div>
    </form>
  )
}

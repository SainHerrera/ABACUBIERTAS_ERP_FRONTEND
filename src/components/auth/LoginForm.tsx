import { useState, useEffect } from 'react'
import { Link, useHistory, Redirect } from 'react-router-dom'
import { IonList, IonItem, IonLabel, IonInput, IonButton, IonText, useIonToast } from '@ionic/react'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { useAppSelector } from '../../hooks/useAppSelector'
import { login, clearError } from '../../store/slices/authSlice'

export const LoginForm = () => {
  const dispatch = useAppDispatch()
  const history = useHistory()
  const { isLoading, isAuthenticated } = useAppSelector((state) => state.auth)
  const [present] = useIonToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  console.log('[LoginForm] render isAuthenticated=', isAuthenticated)

  useEffect(() => {
    console.log('[LoginForm] effect isAuthenticated=', isAuthenticated)
    if (isAuthenticated) {
      console.log('[LoginForm] redirecting via effect to /dashboard')
      history.push('/dashboard')
    }
  }, [isAuthenticated, history])

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

    console.log('[LoginForm] submitting login')
    const result = await dispatch(login({ email, password }))
    console.log('[LoginForm] login result', result)

    if (login.fulfilled.match(result)) {
      console.log('[LoginForm] login fulfilled, redirecting to /dashboard')
      history.push('/dashboard')
    } else {
      console.log('[LoginForm] login rejected', result.payload)
      showError((result.payload as string) || 'Error al iniciar sesión')
    }
  }

  if (isAuthenticated) {
    console.log('[LoginForm] render redirect to /dashboard')
    return <Redirect to="/dashboard" />
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

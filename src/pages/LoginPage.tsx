import { AuthLayout } from '../components/layout/AuthLayout'
import { LoginForm } from '../components/auth/LoginForm'

export const LoginPage = () => {
  return (
    <AuthLayout title="Iniciar Sesión" subtitle="Ingresa tus credenciales para acceder al sistema">
      <LoginForm />
    </AuthLayout>
  )
}

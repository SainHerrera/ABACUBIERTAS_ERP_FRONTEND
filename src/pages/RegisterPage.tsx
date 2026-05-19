import { AuthLayout } from '../components/layout/AuthLayout'
import { RegisterForm } from '../components/auth/RegisterForm'

export const RegisterPage = () => {
  return (
    <AuthLayout title="Crear Cuenta" subtitle="Regístrate para acceder al sistema">
      <RegisterForm />
    </AuthLayout>
  )
}

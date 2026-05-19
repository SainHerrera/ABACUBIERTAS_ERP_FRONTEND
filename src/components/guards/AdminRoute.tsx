import { Redirect } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useAppSelector'

interface AdminRouteProps {
  children: React.ReactNode
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  if (user?.rol !== 'admin') {
    return <Redirect to="/dashboard" />
  }

  return <>{children}</>
}

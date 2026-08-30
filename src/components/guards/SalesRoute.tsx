import { Redirect } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useAppSelector'
import { canAccessSales } from '../../utils/permissions'

interface SalesRouteProps {
  children: React.ReactNode
}

export const SalesRoute = ({ children }: SalesRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  if (!canAccessSales(user?.rol)) {
    return <Redirect to="/dashboard" />
  }

  return <>{children}</>
}

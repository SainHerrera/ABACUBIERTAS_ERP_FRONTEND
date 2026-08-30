import { Redirect } from 'react-router-dom'
import type { UserRole } from '../../types/auth'
import { useAppSelector } from '../../hooks/useAppSelector'

interface LeadershipRouteProps {
  children: React.ReactNode
}

const allowed: UserRole[] = ['admin', 'gerencia']

export const LeadershipRoute = ({ children }: LeadershipRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  if (!user?.rol || !allowed.includes(user.rol)) {
    return <Redirect to="/dashboard" />
  }

  return <>{children}</>
}

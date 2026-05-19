import { Redirect } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useAppSelector'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  return <>{children}</>
}

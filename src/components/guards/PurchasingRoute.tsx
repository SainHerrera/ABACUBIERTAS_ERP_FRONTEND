import { Redirect } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useAppSelector'
import { canManagePurchasing } from '../../utils/permissions'

interface PurchasingRouteProps {
  children: React.ReactNode
}

export const PurchasingRoute = ({ children }: PurchasingRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  if (!canManagePurchasing(user?.rol)) {
    return <Redirect to="/dashboard" />
  }

  return <>{children}</>
}

import type { PurchaseOrderStatus } from '../types/purchaseOrder'

interface StatusStyle {
  label: string
  background: string
  color: string
}

export const purchaseOrderStatusStyle = (estado: PurchaseOrderStatus): StatusStyle => {
  switch (estado) {
    case 'recibida':
      return { label: 'Recibida', background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a' }
    case 'en_transito':
      return { label: 'En tránsito', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }
    case 'pendiente_aprobacion':
      return { label: 'Pendiente de aprobación', background: 'rgba(220, 38, 38, 0.12)', color: '#dc2626' }
    case 'rechazada':
      return { label: 'Rechazada', background: 'var(--app-surface-hover)', color: 'var(--app-text-muted)' }
    case 'enviada':
    default:
      return { label: 'Enviada', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }
  }
}

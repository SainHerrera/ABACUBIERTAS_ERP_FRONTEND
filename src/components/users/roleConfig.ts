import type { UserRole } from '../../types/auth'

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  ventas: 'Ventas',
  compras: 'Compras',
  bodega: 'Bodega',
  gerencia: 'Gerencia',
}

export const roleChipClass: Record<UserRole, string> = {
  admin: 'chip chip-primary',
  ventas: 'chip chip-default',
  compras: 'chip chip-secondary',
  bodega: 'chip chip-warning',
  gerencia: 'chip chip-success',
}
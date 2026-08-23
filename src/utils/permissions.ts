import type { UserRole } from '../types/auth'

export const WAREHOUSE_ROLES: UserRole[] = ['admin', 'compras']
export const ADMIN_ROLES: UserRole[] = ['admin']

export function canManageInventory(role?: UserRole): boolean {
  return role !== undefined && WAREHOUSE_ROLES.includes(role)
}

export function isAdmin(role?: UserRole): boolean {
  return role !== undefined && ADMIN_ROLES.includes(role)
}

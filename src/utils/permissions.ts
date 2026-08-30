import type { UserRole } from '../types/auth'

export const WAREHOUSE_ROLES: UserRole[] = ['admin', 'compras', 'bodega']
export const ADMIN_ROLES: UserRole[] = ['admin']
export const SALES_ROLES: UserRole[] = ['admin', 'ventas', 'gerencia']
export const PURCHASING_ROLES: UserRole[] = ['admin', 'compras']
export const ENTRY_RECEIVERS: UserRole[] = ['admin', 'bodega']

export function canManageInventory(role?: UserRole): boolean {
  return role !== undefined && WAREHOUSE_ROLES.includes(role)
}

export function canManagePurchasing(role?: UserRole): boolean {
  return role !== undefined && PURCHASING_ROLES.includes(role)
}

export function canRecordInventoryEntry(role?: UserRole): boolean {
  return role !== undefined && ENTRY_RECEIVERS.includes(role)
}

export function canAccessSales(role?: UserRole): boolean {
  return role !== undefined && SALES_ROLES.includes(role)
}

export function isAdmin(role?: UserRole): boolean {
  return role !== undefined && ADMIN_ROLES.includes(role)
}

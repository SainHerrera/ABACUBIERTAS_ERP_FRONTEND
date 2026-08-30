export type AuditAction =
  | 'login'
  | 'logout'
  | 'user_created'
  | 'user_updated'
  | 'user_deactivated'
  | 'user_activated'
  | 'role_changed'
  | 'settings_updated'
  | 'settings_reset'
  | 'catalog_loaded'
  | 'purchase_order_created'
  | 'purchase_order_received'
  | 'purchase_order_in_transit'
  | 'purchase_order_pending_approval'
  | 'purchase_order_approved'
  | 'purchase_order_rejected'
  | 'provider_quotation_created'
  | 'provider_quotation_selected'
  | 'sale_dispatched'
  | 'stock_request_created'
  | 'stock_request_updated'

export interface AuditLogEntry {
  id: number
  fecha: string
  id_usuario: number
  nombre_usuario: string
  email_usuario: string
  rol_usuario: string
  accion: AuditAction
  detalle: string
}

export interface AuditLogListResponse {
  items: AuditLogEntry[]
  total: number
}

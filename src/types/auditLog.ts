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
  id: string
  fecha: string
  id_usuario: string | null
  nombre_usuario: string | null
  email_usuario: string | null
  rol_usuario: string | null
  accion: AuditAction
  detalle: string | null
}

export interface AuditLogListResponse {
  items: AuditLogEntry[]
  total: number
}

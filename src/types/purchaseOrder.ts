export type PurchaseOrderStatus =
  | 'enviada'
  | 'en_transito'
  | 'recibida'
  | 'pendiente_aprobacion'
  | 'rechazada'

export interface PurchaseOrderDetail {
  id_detalle_oc: number
  id_producto: number
  descripcion: string
  cantidad_ordenada: number
  cantidad_recibida: number
  precio_unitario: number
  tiempo_entrega_dias?: number
}

export interface PurchaseOrder {
  id_orden_compra: number
  numero_oc: string
  id_proveedor: number
  nombre_proveedor?: string
  fecha_emision: string
  estado: PurchaseOrderStatus
  observaciones?: string
  id_solicitud?: number
  numero_solicitud?: string
  id_cotizacion?: number
  detalles: PurchaseOrderDetail[]
}

export interface PurchaseOrderCreate {
  id_proveedor: number
  fecha_emision?: string
  observaciones?: string
  id_solicitud?: number
  id_cotizacion?: number
  detalles: {
    id_producto: number
    descripcion: string
    cantidad_ordenada: number
    precio_unitario: number
    tiempo_entrega_dias?: number
  }[]
}

export interface PurchaseOrderListResponse {
  items: PurchaseOrder[]
  total: number
  skip: number
  limit: number
}

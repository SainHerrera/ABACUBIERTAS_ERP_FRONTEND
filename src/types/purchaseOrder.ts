export type PurchaseOrderStatus =
  | 'enviada'
  | 'en_transito'
  | 'recibida'
  | 'pendiente_aprobacion'
  | 'rechazada'

export interface PurchaseOrderDetail {
  id_detalle_oc: number
  id_producto: string
  descripcion: string
  cantidad_ordenada: number
  cantidad_recibida: number
  precio_unitario: number
  tiempo_entrega_dias?: number
}

export interface PurchaseOrder {
  id_orden_compra: string
  numero_oc: string
  id_proveedor: string
  nombre_proveedor?: string
  fecha_emision: string
  estado: PurchaseOrderStatus
  observaciones?: string
  id_solicitud?: string | number
  numero_solicitud?: string
  id_cotizacion?: string | number
  total: number
  detalles: PurchaseOrderDetail[]
}

export interface PurchaseOrderCreate {
  id_proveedor: string
  fecha_emision?: string
  observaciones?: string
  id_solicitud?: string | number
  id_cotizacion?: string | number
  detalles: {
    id_producto: string
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

export interface ApiPurchaseOrderDetail {
  id_detalle: number
  id_producto: string
  descripcion: string | null
  cantidad_ordenada: number
  cantidad_recibida: number
  precio_unitario: string
  tiempo_entrega_dias?: number | null
}

export interface ApiPurchaseOrder {
  id_orden_compra: string
  numero_oc: string
  id_proveedor: string
  nombre_proveedor?: string | null
  fecha_emision: string
  estado: PurchaseOrderStatus
  observaciones?: string | null
  id_solicitud?: string | null
  numero_solicitud?: string | null
  id_cotizacion?: string | null
  total: string
  detalles: ApiPurchaseOrderDetail[]
  created_at?: string
  updated_at?: string
}

export interface ApiPurchaseOrderListResponse extends PurchaseOrderListResponse {
  items: ApiPurchaseOrder[]
}

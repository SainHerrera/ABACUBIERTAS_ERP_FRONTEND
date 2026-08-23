export interface Client {
  id_cliente: number
  tipo_cliente: 'empresa' | 'persona_natural'
  nombre_razon_social: string
  nit_cc: string
  nombre_contacto?: string
  telefono?: string
  email?: string
  direccion?: string
  ciudad?: string
  observaciones?: string
  estado: 'activo' | 'inactivo' | 'prospecto' | 'frecuente' | 'corporativo'
  activo: boolean
  created_at?: string
  updated_at?: string
}

export interface ClientCreate {
  tipo_cliente: 'empresa' | 'persona_natural'
  nombre_razon_social: string
  nit_cc: string
  nombre_contacto?: string
  telefono?: string
  email?: string
  direccion?: string
  ciudad?: string
  observaciones?: string
}

export interface ClientUpdate {
  tipo_cliente?: 'empresa' | 'persona_natural'
  nombre_razon_social?: string
  nit_cc?: string
  nombre_contacto?: string
  telefono?: string
  email?: string
  direccion?: string
  ciudad?: string
  observaciones?: string
  estado?: 'activo' | 'inactivo' | 'prospecto' | 'frecuente' | 'corporativo'
  activo?: boolean
}

export interface ClientListResponse {
  items: Client[]
  total: number
  skip: number
  limit: number
}

export interface Quotation {
  id_cotizacion: number
  numero_consecutivo: string
  id_cliente: number
  id_usuario: number
  fecha_emision: string
  fecha_vencimiento?: string
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida'
  subtotal: number
  impuestos: number
  descuento: number
  total: number
  observaciones?: string
  detalles: QuotationDetail[]
}

export interface QuotationDetail {
  id_detalle: number
  id_producto: number
  descripcion: string
  cantidad: number
  precio_unitario: number
  descuento: number
  subtotal: number
}

export interface QuotationCreate {
  id_cliente: number
  detalles: QuotationDetail[]
  fecha_vencimiento?: string
  descuento: number
  observaciones?: string
}

export interface QuotationUpdate {
  id_cliente?: number
  detalles?: QuotationDetail[]
  fecha_vencimiento?: string
  descuento?: number
  observaciones?: string
}

export interface QuotationEstadoUpdate {
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida'
}

export interface QuotationListResponse {
  items: Quotation[]
  total: number
  skip: number
  limit: number
}

export interface Sale {
  id_orden_venta: number
  numero_orden: string
  id_cliente: number
  id_cotizacion?: number
  id_usuario: number
  fecha_venta: string
  estado: 'pendiente' | 'en_proceso' | 'entregada' | 'cancelada'
  total: number
  observaciones?: string
  detalles: SaleDetail[]
}

export interface SaleDetail {
  id_detalle_venta: number
  id_producto: number
  descripcion: string
  cantidad: number
  precio_unitario: number
  descuento: number
  subtotal: number
}

export interface SaleCreate {
  id_cliente: number
  detalles: SaleDetail[]
  observaciones?: string
}

export interface SaleUpdate {
  id_cliente?: number
  estado?: 'pendiente' | 'en_proceso' | 'entregada' | 'cancelada'
  observaciones?: string
  detalles?: SaleDetail[]
}

export interface SaleListResponse {
  items: Sale[]
  total: number
  skip: number
  limit: number
}
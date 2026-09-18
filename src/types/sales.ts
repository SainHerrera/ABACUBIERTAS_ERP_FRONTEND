export interface Client {
  id_cliente: string
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

export interface ApiClient {
  id_cliente: string
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

export interface ApiClientListResponse extends ClientListResponse {
  items: ApiClient[]
}

export interface Quotation {
  id_cotizacion: string
  numero_consecutivo: string
  id_cliente: string
  nombre_cliente?: string
  id_usuario: string
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
  id_producto: string
  descripcion: string | null
  cantidad: number
  precio_unitario: number
  descuento: number
  subtotal: number
}

export interface ApiQuotationDetail {
  id_detalle: number
  id_producto: string
  descripcion: string | null
  cantidad: number
  precio_unitario: number
  descuento: number
  subtotal: number
}

export interface ApiQuotation {
  id_cotizacion: string
  numero_consecutivo: string
  id_cliente: string
  nombre_cliente?: string
  id_usuario?: string
  fecha_emision: string
  fecha_vencimiento?: string
  estado: Quotation['estado']
  subtotal: number
  impuestos: number
  descuento: number
  total: number
  observaciones?: string
  detalles: ApiQuotationDetail[]
  created_at?: string
  updated_at?: string
}

export interface ApiQuotationListResponse extends QuotationListResponse {
  items: ApiQuotation[]
}

export interface QuotationCreate {
  id_cliente: string
  detalles: QuotationDetail[]
  fecha_vencimiento?: string
  descuento: number
  observaciones?: string
}

export interface QuotationUpdate {
  id_cliente?: string
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
  id_orden_venta: string
  numero_orden: string
  id_cliente: string
  nombre_cliente?: string
  id_cotizacion?: string
  id_usuario?: string
  fecha_venta: string
  estado: 'pendiente' | 'en_proceso' | 'entregada' | 'cancelada'
  subtotal: number
  impuestos: number
  total: number
  observaciones?: string
  detalles: SaleDetail[]
}

export interface SaleDetail {
  id_detalle_venta: number
  id_producto: string
  descripcion: string
  cantidad: number
  precio_unitario: number
  descuento: number
  subtotal: number
}

export interface SaleCreate {
  id_cliente: string
  id_cotizacion?: string
  detalles: SaleDetail[]
  observaciones?: string
}

export interface SaleUpdate {
  id_cliente?: string
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

export interface ApiSaleDetail {
  id_detalle: number
  id_producto: string
  descripcion: string | null
  cantidad: number
  precio_unitario: string
  descuento: string
  subtotal: string
}

export interface ApiSale {
  id_orden_venta: string
  numero_orden: string
  id_cliente: string
  nombre_cliente?: string | null
  id_cotizacion?: string | null
  id_usuario?: string | null
  fecha_venta: string
  estado: Sale['estado']
  subtotal: string
  impuestos: string
  total: string
  observaciones?: string | null
  detalles: ApiSaleDetail[]
  created_at?: string
  updated_at?: string
}

export interface ApiSaleListResponse extends SaleListResponse {
  items: ApiSale[]
}
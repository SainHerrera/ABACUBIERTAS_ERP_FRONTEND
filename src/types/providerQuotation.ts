export interface ProviderQuotation {
  id_cotizacion: string
  numero_cotizacion: string
  id_solicitud: string
  id_producto: string
  id_proveedor: string
  nombre_proveedor?: string
  precio_unitario: number
  tiempo_entrega_dias: number
  condiciones?: string
  fecha: string
  seleccionada: boolean
}

export interface ProviderQuotationCreate {
  id_solicitud: string
  id_producto: string
  id_proveedor: string
  precio_unitario: number
  tiempo_entrega_dias: number
  condiciones?: string
}

export interface ProviderQuotationListResponse {
  items: ProviderQuotation[]
  total: number
  skip: number
  limit: number
}

export interface ApiProviderQuotation {
  id_cotizacion: string
  numero_cotizacion: string
  id_solicitud: string
  id_producto: string
  id_proveedor: string
  nombre_proveedor?: string | null
  precio_unitario: string
  tiempo_entrega_dias: number
  condiciones?: string | null
  fecha: string
  seleccionada: boolean
  created_at?: string
  updated_at?: string
}

export interface ApiProviderQuotationListResponse {
  items: ApiProviderQuotation[]
  total: number
  skip: number
  limit: number
}
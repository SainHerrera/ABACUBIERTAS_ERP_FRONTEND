export interface ProviderQuotation {
  id_cotizacion: number
  numero_cotizacion: string
  id_solicitud: number
  id_producto: number
  id_proveedor: number
  nombre_proveedor?: string
  precio_unitario: number
  tiempo_entrega_dias: number
  condiciones?: string
  fecha: string
  seleccionada: boolean
}

export interface ProviderQuotationCreate {
  id_solicitud: number
  id_producto: number
  id_proveedor: number
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

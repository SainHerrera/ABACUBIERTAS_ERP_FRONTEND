export type StockRequestStatus = 'pendiente' | 'aprobada' | 'atendida' | 'rechazada'

export interface StockRequest {
  id_solicitud: number
  numero_solicitud: string
  id_producto: number
  descripcion: string
  cantidad_sugerida: number
  stock_actual: number
  stock_minimo: number
  estado: StockRequestStatus
  fecha: string
  id_usuario: number
  nombre_usuario?: string
  observaciones?: string
}

export interface StockRequestCreate {
  id_producto: number
  cantidad_sugerida: number
  observaciones?: string
}

export interface StockRequestListResponse {
  items: StockRequest[]
  total: number
  skip: number
  limit: number
}

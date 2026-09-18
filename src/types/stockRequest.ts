export type StockRequestStatus = 'pendiente' | 'aprobada' | 'atendida' | 'rechazada'

export interface StockRequest {
  id_solicitud: string
  numero_solicitud: string
  id_producto: string
  descripcion: string
  cantidad_sugerida: number
  stock_actual: number
  stock_minimo: number
  estado: StockRequestStatus
  fecha: string
  id_usuario: string
  nombre_usuario?: string
  observaciones?: string
}

export interface StockRequestCreate {
  id_producto: string
  cantidad_sugerida: number
  observaciones?: string
}

export interface StockRequestListResponse {
  items: StockRequest[]
  total: number
  skip: number
  limit: number
}

export interface ApiStockRequest {
  id_solicitud: string
  numero_solicitud: string
  id_producto: string
  descripcion: string
  cantidad_sugerida: number
  stock_actual: number
  stock_minimo: number
  estado: StockRequestStatus
  fecha: string
  id_usuario: string
  nombre_usuario?: string | null
  observaciones?: string | null
  created_at?: string
  updated_at?: string
}

export interface ApiStockRequestListResponse {
  items: ApiStockRequest[]
  total: number
  skip: number
  limit: number
}
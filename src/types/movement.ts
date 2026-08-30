export type MovementType = 'entrada' | 'salida' | 'ajuste'

export interface Movement {
  id_movimiento: number
  id_producto: number
  nombre_producto?: string
  tipo: MovementType
  cantidad: number
  referencia?: string
  id_usuario: number
  nombre_usuario?: string
  fecha: string
  nota?: string
}

export interface MovementEntryCreate {
  product_id: number
  quantity: number
  reference?: string
  note?: string
  fecha?: string
}

export interface MovementOutputCreate {
  product_id: number
  quantity: number
  reference?: string
  note?: string
  fecha?: string
}

export interface MovementAdjustmentCreate {
  product_id: number
  quantity: number
  reference?: string
  note?: string
  fecha?: string
}

export interface MovementListResponse {
  items: Movement[]
  total: number
  skip: number
  limit: number
}

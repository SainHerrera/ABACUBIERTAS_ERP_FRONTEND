export type MovementType = 'entrada' | 'salida' | 'ajuste'

export interface Movement {
  id_movimiento: string
  id_producto: string
  nombre_producto?: string
  tipo: MovementType
  cantidad: number
  referencia?: string
  id_usuario: string | number
  nombre_usuario?: string
  fecha: string
  nota?: string
}

export interface MovementEntryCreate {
  product_id: string
  quantity: number
  reference?: string
  note?: string
  fecha?: string
}

export interface MovementOutputCreate {
  product_id: string
  quantity: number
  reference?: string
  note?: string
  fecha?: string
}

export interface MovementAdjustmentCreate {
  product_id: string
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

export interface ApiMovement {
  id_movimiento: string
  id_producto: string
  tipo: MovementType
  cantidad: number
  referencia?: string
  id_usuario: string
  fecha: string
  nota?: string
}

export interface ApiMovementListResponse extends MovementListResponse {
  items: ApiMovement[]
}

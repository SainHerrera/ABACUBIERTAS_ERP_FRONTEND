export interface Product {
  id_producto: number
  nombre: string
  descripcion?: string
  unidad_medida: string
  precio_unitario: number
  stock_actual: number
  stock_minimo: number
  id_proveedor?: number
  nombre_proveedor?: string
  activo: boolean
  status: 'low' | 'normal'
  low_stock: boolean
}

export interface ProductCreate {
  nombre: string
  descripcion?: string
  unidad_medida?: string
  precio_unitario?: number
  stock_inicial?: number
  stock_minimo?: number
  id_proveedor?: number
}

export interface ProductUpdate {
  nombre?: string
  descripcion?: string
  unidad_medida?: string
  precio_unitario?: number
  stock_minimo?: number
  id_proveedor?: number
}

export interface ProductListResponse {
  items: Product[]
  total: number
  skip: number
  limit: number
}

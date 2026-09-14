export interface Product {
  id_producto: string
  nombre: string
  descripcion?: string
  unidad_medida: string
  precio_unitario: number
  stock_actual: number
  stock_minimo: number
  id_proveedor?: string
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
  id_proveedor?: string
}

export interface ProductUpdate {
  nombre?: string
  descripcion?: string
  unidad_medida?: string
  precio_unitario?: number
  stock_minimo?: number
  id_proveedor?: string
}

export interface ProductListResponse {
  items: Product[]
  total: number
  skip: number
  limit: number
}

export interface ApiProduct {
  id_producto: string
  nombre: string
  descripcion?: string
  unidad_medida: string
  precio_unitario: number
  stock_actual: number
  stock_minimo: number
  id_proveedor?: string | null
  nombre_proveedor?: string | null
  activo: boolean
  status: 'low' | 'normal'
  low_stock: boolean
  created_at?: string
  updated_at?: string
}

export interface ApiProductListResponse {
  items: ApiProduct[]
  total: number
  skip: number
  limit: number
}

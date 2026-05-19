export interface Provider {
  id_proveedor: number
  nombre_empresa: string
  nit: string
  contacto?: string
  telefono?: string
  email?: string
  direccion?: string
  ciudad?: string
  categoria_material: string
  condiciones_pago?: string
  observaciones?: string
  estado: string
  activo: boolean
}

export interface ProviderCreate {
  nombre_empresa: string
  nit: string
  contacto?: string
  telefono?: string
  email?: string
  direccion?: string
  ciudad?: string
  categoria_material?: string
  condiciones_pago?: string
  observaciones?: string
}

export interface ProviderUpdate {
  nombre_empresa?: string
  nit?: string
  contacto?: string
  telefono?: string
  email?: string
  direccion?: string
  ciudad?: string
  categoria_material?: string
  condiciones_pago?: string
  observaciones?: string
  estado?: string
}

export interface ProviderListResponse {
  items: Provider[]
  total: number
  skip: number
  limit: number
}

export const CATEGORIA_MATERIAL_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'materia_prima', label: 'Materia prima' },
  { value: 'empaques', label: 'Empaques' },
  { value: 'herramientas', label: 'Herramientas' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'otros', label: 'Otros' },
]

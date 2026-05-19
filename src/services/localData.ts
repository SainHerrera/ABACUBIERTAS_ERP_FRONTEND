import type { Product, ProductCreate, ProductUpdate } from '../types/product'
import type { Movement, MovementEntryCreate, MovementOutputCreate, MovementAdjustmentCreate, MovementType } from '../types/movement'
import type { Provider, ProviderCreate, ProviderUpdate } from '../types/provider'

const PRODUCTS_KEY = 'abacubiertas_products'
const MOVEMENTS_KEY = 'abacubiertas_movements'
const PROVIDERS_KEY = 'abacubiertas_providers'

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function set<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

function nextId(items: { id_producto?: number; id_movimiento?: number; id_proveedor?: number }[]): number {
  if (items.length === 0) return 1
  const max = Math.max(...items.map((i) => i.id_producto ?? i.id_movimiento ?? i.id_proveedor ?? 0))
  return max + 1
}

// ========== PRODUCTS ==========

export function getLocalProducts(search?: string): Product[] {
  const products = get<Product[]>(PRODUCTS_KEY, [])
  if (!search) return products
  const q = search.toLowerCase()
  return products.filter((p) => p.nombre.toLowerCase().includes(q))
}

export function getLocalProduct(id: number): Product | undefined {
  return get<Product[]>(PRODUCTS_KEY, []).find((p) => p.id_producto === id)
}

export function createLocalProduct(data: ProductCreate): Product {
  const products = get<Product[]>(PRODUCTS_KEY, [])
  const providers = get<Provider[]>(PROVIDERS_KEY, [])
  const provider = data.id_proveedor ? providers.find((p) => p.id_proveedor === data.id_proveedor) : undefined
  const product: Product = {
    id_producto: nextId(products),
    nombre: data.nombre,
    descripcion: data.descripcion,
    unidad_medida: data.unidad_medida || 'unidad',
    precio_unitario: data.precio_unitario ?? 0,
    stock_actual: data.stock_inicial ?? 0,
    stock_minimo: data.stock_minimo ?? 0,
    id_proveedor: data.id_proveedor,
    nombre_proveedor: provider?.nombre_empresa,
    activo: true,
    status: (data.stock_inicial ?? 0) > (data.stock_minimo ?? 0) ? 'normal' : 'low',
    low_stock: (data.stock_inicial ?? 0) <= (data.stock_minimo ?? 0),
  }
  products.push(product)
  set(PRODUCTS_KEY, products)
  return product
}

export function updateLocalProduct(id: number, data: ProductUpdate): Product | undefined {
  const products = get<Product[]>(PRODUCTS_KEY, [])
  const idx = products.findIndex((p) => p.id_producto === id)
  if (idx === -1) return undefined
  const providers = get<Provider[]>(PROVIDERS_KEY, [])
  const provider = data.id_proveedor ? providers.find((p) => p.id_proveedor === data.id_proveedor) : undefined
  products[idx] = {
    ...products[idx],
    ...data,
    nombre_proveedor: provider?.nombre_empresa ?? products[idx].nombre_proveedor,
    unidad_medida: data.unidad_medida ?? products[idx].unidad_medida,
    low_stock: products[idx].stock_actual <= (data.stock_minimo ?? products[idx].stock_minimo),
    status: products[idx].stock_actual > (data.stock_minimo ?? products[idx].stock_minimo) ? 'normal' : 'low',
  }
  set(PRODUCTS_KEY, products)
  return products[idx]
}

export function deleteLocalProduct(id: number): void {
  const products = get<Product[]>(PRODUCTS_KEY, [])
  set(PRODUCTS_KEY, products.filter((p) => p.id_producto !== id))
}

// ========== MOVEMENTS ==========

export function getLocalMovements(opts?: { product_id?: number }): Movement[] {
  let movements = get<Movement[]>(MOVEMENTS_KEY, [])
  if (opts?.product_id) {
    movements = movements.filter((m) => m.id_producto === opts.product_id)
  }
  return movements.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
}

function addMovement(data: {
  product_id: number
  quantity: number
  tipo: MovementType
  reference?: string
  note?: string
}): Movement {
  const movements = get<Movement[]>(MOVEMENTS_KEY, [])
  const products = get<Product[]>(PRODUCTS_KEY, [])
  const pIdx = products.findIndex((p) => p.id_producto === data.product_id)
  const product = products[pIdx]

  const movement: Movement = {
    id_movimiento: nextId(movements),
    id_producto: data.product_id,
    nombre_producto: product?.nombre,
    tipo: data.tipo,
    cantidad: data.quantity,
    referencia: data.reference,
    id_usuario: 1,
    nombre_usuario: 'Local',
    fecha: new Date().toISOString(),
    nota: data.note,
  }

  if (product) {
    if (data.tipo === 'entrada') {
      products[pIdx].stock_actual += data.quantity
    } else if (data.tipo === 'salida') {
      products[pIdx].stock_actual = Math.max(0, products[pIdx].stock_actual - data.quantity)
    } else {
      products[pIdx].stock_actual = Math.max(0, data.quantity)
    }
    products[pIdx].low_stock = products[pIdx].stock_actual <= products[pIdx].stock_minimo
    products[pIdx].status = products[pIdx].low_stock ? 'low' : 'normal'
    set(PRODUCTS_KEY, products)
  }

  movements.unshift(movement)
  set(MOVEMENTS_KEY, movements)
  return movement
}

export function createLocalEntry(data: MovementEntryCreate): Movement {
  return addMovement({ ...data, tipo: 'entrada' })
}

export function createLocalOutput(data: MovementOutputCreate): Movement {
  return addMovement({ ...data, tipo: 'salida' })
}

export function createLocalAdjustment(data: MovementAdjustmentCreate): Movement {
  return addMovement({ ...data, tipo: 'ajuste' })
}

// ========== PROVIDERS ==========

export function getLocalProviders(search?: string): Provider[] {
  let providers = get<Provider[]>(PROVIDERS_KEY, [])
  if (search) {
    const q = search.toLowerCase()
    providers = providers.filter((p) => p.nombre_empresa.toLowerCase().includes(q))
  }
  return providers
}

export function createLocalProvider(data: ProviderCreate): Provider {
  const providers = get<Provider[]>(PROVIDERS_KEY, [])
  const provider: Provider = {
    id_proveedor: nextId(providers),
    nombre_empresa: data.nombre_empresa,
    nit: data.nit,
    contacto: data.contacto,
    telefono: data.telefono,
    email: data.email,
    direccion: data.direccion,
    ciudad: data.ciudad,
    categoria_material: data.categoria_material || 'general',
    condiciones_pago: data.condiciones_pago,
    observaciones: data.observaciones,
    estado: 'Activo',
    activo: true,
  }
  providers.push(provider)
  set(PROVIDERS_KEY, providers)
  return provider
}

export function updateLocalProvider(id: number, data: ProviderUpdate): Provider | undefined {
  const providers = get<Provider[]>(PROVIDERS_KEY, [])
  const idx = providers.findIndex((p) => p.id_proveedor === id)
  if (idx === -1) return undefined
  providers[idx] = { ...providers[idx], ...data }
  if (data.estado !== undefined) {
    providers[idx].activo = data.estado === 'Activo'
  }
  set(PROVIDERS_KEY, providers)
  return providers[idx]
}

// ========== SEED ==========

export const SEED_PROVIDERS: Provider[] = [
  { id_proveedor: 1, nombre_empresa: 'Distribuidora ABC', nit: '123456789-0', contacto: 'Carlos López', telefono: '3001112233', email: 'carlos@abc.com', direccion: 'Calle 1 #2-3', ciudad: 'Bogotá', categoria_material: 'general', condiciones_pago: '30 días', observaciones: '', estado: 'Activo', activo: true },
  { id_proveedor: 2, nombre_empresa: 'Materiales XYZ', nit: '987654321-0', contacto: 'Ana Pérez', telefono: '3004445566', email: 'ana@xyz.com', direccion: 'Carrera 5 #10-20', ciudad: 'Medellín', categoria_material: 'materia_prima', condiciones_pago: '15 días', observaciones: '', estado: 'Activo', activo: true },
]

export const SEED_PRODUCTS: Product[] = [
  { id_producto: 1, nombre: 'Tornillo 1/2 pulgada', descripcion: 'Tornillo hexagonal galvanizado', unidad_medida: 'unidad', precio_unitario: 500, stock_actual: 200, stock_minimo: 20, id_proveedor: 1, nombre_proveedor: 'Distribuidora ABC', activo: true, status: 'normal', low_stock: false },
  { id_producto: 2, nombre: 'Varilla 3/8', descripcion: 'Varilla de acero corrugado', unidad_medida: 'unidad', precio_unitario: 12000, stock_actual: 50, stock_minimo: 10, id_proveedor: 2, nombre_proveedor: 'Materiales XYZ', activo: true, status: 'normal', low_stock: false },
  { id_producto: 3, nombre: 'Cemento gris 50kg', descripcion: 'Cemento Portland tipo I', unidad_medida: 'unidad', precio_unitario: 35000, stock_actual: 5, stock_minimo: 15, id_proveedor: 2, nombre_proveedor: 'Materiales XYZ', activo: true, status: 'low', low_stock: true },
]

export const SEED_MOVEMENTS: Movement[] = [
  { id_movimiento: 1, id_producto: 1, nombre_producto: 'Tornillo 1/2 pulgada', tipo: 'entrada', cantidad: 200, referencia: 'ENT-001', id_usuario: 1, nombre_usuario: 'Admin', fecha: new Date(Date.now() - 86400000 * 2).toISOString(), nota: 'Compra inicial' },
  { id_movimiento: 2, id_producto: 2, nombre_producto: 'Varilla 3/8', tipo: 'entrada', cantidad: 50, referencia: 'ENT-002', id_usuario: 1, nombre_usuario: 'Admin', fecha: new Date(Date.now() - 86400000).toISOString(), nota: 'Compra inicial' },
]

export function seedLocalData(): void {
  const products = get<Product[]>(PRODUCTS_KEY, [])
  if (products.length > 0) return
  set(PROVIDERS_KEY, SEED_PROVIDERS)
  set(PRODUCTS_KEY, SEED_PRODUCTS)
  set(MOVEMENTS_KEY, SEED_MOVEMENTS)
}

export function hasLocalData(): boolean {
  return get<Product[]>(PRODUCTS_KEY, []).length > 0
}

export function resetLocalData(): void {
  localStorage.removeItem(PRODUCTS_KEY)
  localStorage.removeItem(MOVEMENTS_KEY)
  localStorage.removeItem(PROVIDERS_KEY)
}

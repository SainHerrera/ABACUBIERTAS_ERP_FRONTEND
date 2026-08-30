import type {
  User,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserUpdateRequest,
} from '../../types/auth'
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductListResponse,
} from '../../types/product'
import type {
  Movement,
  MovementEntryCreate,
  MovementOutputCreate,
  MovementAdjustmentCreate,
  MovementListResponse,
} from '../../types/movement'
import type {
  Provider,
  ProviderCreate,
  ProviderUpdate,
  ProviderListResponse,
} from '../../types/provider'
import type {
  Client,
  ClientCreate,
  ClientUpdate,
  ClientListResponse,
  Quotation,
  QuotationDetail,
  QuotationCreate,
  QuotationUpdate,
  QuotationEstadoUpdate,
  QuotationListResponse,
  Sale,
  SaleCreate,
  SaleUpdate,
  SaleListResponse,
} from '../../types/sales'
import type { SystemSettings, SystemSettingsUpdate } from '../../types/settings'
import type {
  PurchaseOrder,
  PurchaseOrderCreate,
  PurchaseOrderDetail,
  PurchaseOrderListResponse,
} from '../../types/purchaseOrder'
import type {
  StockRequest,
  StockRequestCreate,
  StockRequestListResponse,
  StockRequestStatus,
} from '../../types/stockRequest'
import type {
  ProviderQuotation,
  ProviderQuotationCreate,
  ProviderQuotationListResponse,
} from '../../types/providerQuotation'
import type {
  AuditAction,
  AuditLogEntry,
  AuditLogListResponse,
} from '../../types/auditLog'
import {
  SEED_USERS,
  SEED_PROVIDERS,
  SEED_PRODUCTS,
  SEED_MOVEMENTS,
  SEED_CLIENTS,
  SEED_QUOTATIONS,
  SEED_SALES,
  SEED_PASSWORDS,
  SEED_SETTINGS,
  SEED_AUDIT_LOG,
  SEED_PURCHASE_ORDERS,
  SEED_STOCK_REQUESTS,
  SEED_PROVIDER_QUOTATIONS,
} from './seedData'
import { getCurrentUserFromToken } from '../../utils/jwt'
import { hashPassword, verifyPassword } from '../../utils/password'

const KEYS = {
  USERS: 'abacubiertas_users',
  PRODUCTS: 'abacubiertas_products',
  MOVEMENTS: 'abacubiertas_movements',
  PROVIDERS: 'abacubiertas_providers',
  CLIENTS: 'abacubiertas_clients',
  QUOTATIONS: 'abacubiertas_quotations',
  SALES: 'abacubiertas_sales',
  SETTINGS: 'abacubiertas_settings',
  AUDIT_LOG: 'abacubiertas_audit_log',
  INITIALIZED: 'abacubiertas_initialized',
  POS: 'abacubiertas_pos',
  STOCK_REQUESTS: 'abacubiertas_stock_requests',
  PROVIDER_QUOTATIONS: 'abacubiertas_provider_quotations',
}

const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export class StorageEngine {
  public static isInitialized(): boolean {
    return localStorage.getItem(KEYS.INITIALIZED) === 'true'
  }

  public static init(forceReset = false): void {
    if (!StorageEngine.isInitialized() || forceReset) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS))
      localStorage.setItem(KEYS.PROVIDERS, JSON.stringify(SEED_PROVIDERS))
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS))
      localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(SEED_MOVEMENTS))
      localStorage.setItem(KEYS.CLIENTS, JSON.stringify(SEED_CLIENTS))
      localStorage.setItem(KEYS.QUOTATIONS, JSON.stringify(SEED_QUOTATIONS))
      localStorage.setItem(KEYS.SALES, JSON.stringify(SEED_SALES))
      StorageEngine.setSettingsRaw(SEED_SETTINGS)
      localStorage.setItem(KEYS.AUDIT_LOG, JSON.stringify(SEED_AUDIT_LOG))
      localStorage.setItem(KEYS.POS, JSON.stringify(SEED_PURCHASE_ORDERS))
      localStorage.setItem(KEYS.STOCK_REQUESTS, JSON.stringify(SEED_STOCK_REQUESTS))
      localStorage.setItem(KEYS.PROVIDER_QUOTATIONS, JSON.stringify(SEED_PROVIDER_QUOTATIONS))
      localStorage.setItem(KEYS.INITIALIZED, 'true')
    } else {
      // Ensure collections exist if previous init lacked them
      if (!localStorage.getItem(KEYS.CLIENTS)) {
        localStorage.setItem(KEYS.CLIENTS, JSON.stringify(SEED_CLIENTS))
      }
      if (!localStorage.getItem(KEYS.QUOTATIONS)) {
        localStorage.setItem(KEYS.QUOTATIONS, JSON.stringify(SEED_QUOTATIONS))
      }
      if (!localStorage.getItem(KEYS.SALES)) {
        localStorage.setItem(KEYS.SALES, JSON.stringify(SEED_SALES))
      }
      if (!localStorage.getItem(KEYS.SETTINGS)) {
        StorageEngine.setSettingsRaw(SEED_SETTINGS)
      }
      if (!localStorage.getItem(KEYS.AUDIT_LOG)) {
        localStorage.setItem(KEYS.AUDIT_LOG, JSON.stringify(SEED_AUDIT_LOG))
      }
      if (!localStorage.getItem(KEYS.POS)) {
        localStorage.setItem(KEYS.POS, JSON.stringify(SEED_PURCHASE_ORDERS))
      }
      if (!localStorage.getItem(KEYS.STOCK_REQUESTS)) {
        localStorage.setItem(KEYS.STOCK_REQUESTS, JSON.stringify(SEED_STOCK_REQUESTS))
      }
      if (!localStorage.getItem(KEYS.PROVIDER_QUOTATIONS)) {
        localStorage.setItem(KEYS.PROVIDER_QUOTATIONS, JSON.stringify(SEED_PROVIDER_QUOTATIONS))
      }
    }
  }

  public static reset(): void {
    StorageEngine.init(true)
  }

  // ----------------------------------------------------
  // Helpers
  // ----------------------------------------------------
  private static getUsersRaw(): User[] {
    StorageEngine.init()
    const users = safeJsonParse<User[]>(localStorage.getItem(KEYS.USERS), SEED_USERS)

    // Migration: backfill default passwords for seed accounts created before
    // password support was added.
    let changed = false
    for (const user of users) {
      const seedPassword = SEED_PASSWORDS[user.email.toLowerCase()]
      if (seedPassword && !user.password_hash) {
        user.password_hash = hashPassword(seedPassword)
        changed = true
      }
    }
    if (changed) {
      StorageEngine.setUsersRaw(users)
    }

    return users
  }

  private static setUsersRaw(users: User[]): void {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users))
  }

  private static getProductsRaw(): Product[] {
    StorageEngine.init()
    return safeJsonParse<Product[]>(localStorage.getItem(KEYS.PRODUCTS), SEED_PRODUCTS)
  }

  private static setProductsRaw(products: Product[]): void {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products))
  }

  private static getMovementsRaw(): Movement[] {
    StorageEngine.init()
    return safeJsonParse<Movement[]>(localStorage.getItem(KEYS.MOVEMENTS), SEED_MOVEMENTS)
  }

  private static setMovementsRaw(movements: Movement[]): void {
    localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(movements))
  }

  private static getProvidersRaw(): Provider[] {
    StorageEngine.init()
    return safeJsonParse<Provider[]>(localStorage.getItem(KEYS.PROVIDERS), SEED_PROVIDERS)
  }

  private static setProvidersRaw(providers: Provider[]): void {
    localStorage.setItem(KEYS.PROVIDERS, JSON.stringify(providers))
  }

  private static getClientsRaw(): Client[] {
    StorageEngine.init()
    return safeJsonParse<Client[]>(localStorage.getItem(KEYS.CLIENTS), SEED_CLIENTS)
  }

  private static setClientsRaw(clients: Client[]): void {
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients))
  }

  private static getQuotationsRaw(): Quotation[] {
    StorageEngine.init()
    return safeJsonParse<Quotation[]>(localStorage.getItem(KEYS.QUOTATIONS), SEED_QUOTATIONS)
  }

  private static setQuotationsRaw(quotations: Quotation[]): void {
    localStorage.setItem(KEYS.QUOTATIONS, JSON.stringify(quotations))
  }

  private static getSalesRaw(): Sale[] {
    StorageEngine.init()
    return safeJsonParse<Sale[]>(localStorage.getItem(KEYS.SALES), SEED_SALES)
  }

  private static setSalesRaw(sales: Sale[]): void {
    localStorage.setItem(KEYS.SALES, JSON.stringify(sales))
  }

  private static getSettingsRaw(): SystemSettings {
    return safeJsonParse<SystemSettings>(localStorage.getItem(KEYS.SETTINGS), SEED_SETTINGS)
  }

  private static setSettingsRaw(settings: SystemSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
  }

  private static getAuditLogRaw(): AuditLogEntry[] {
    StorageEngine.init()
    return safeJsonParse<AuditLogEntry[]>(
      localStorage.getItem(KEYS.AUDIT_LOG),
      SEED_AUDIT_LOG,
    )
  }

  private static setAuditLogRaw(entries: AuditLogEntry[]): void {
    localStorage.setItem(KEYS.AUDIT_LOG, JSON.stringify(entries))
  }

  private static getCurrentUser(): User {
    const token = localStorage.getItem('accessToken')
    if (token) {
      const user = getCurrentUserFromToken(token)
      if (user) return user
    }
    const users = StorageEngine.getUsersRaw()
    return users[0] || SEED_USERS[0]
  }

  private static createMockToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(
      JSON.stringify({
        sub: user.email,
        email: user.email,
        id: user.id_usuario,
        id_usuario: user.id_usuario,
        rol: user.rol,
        nombre: user.nombre,
        activo: user.activo,
        exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 7,
      }),
    )
    const signature = btoa('mock_signature_for_local_storage')
    return `${header}.${payload}.${signature}`
  }

  // ----------------------------------------------------
  // SETTINGS METHODS
  // ----------------------------------------------------
  public static getSettings(): SystemSettings {
    StorageEngine.init()
    return StorageEngine.getSettingsRaw()
  }

  public static updateSettings(data: SystemSettingsUpdate): SystemSettings {
    StorageEngine.init()
    const current = StorageEngine.getSettingsRaw()

    if (data.stockMinimoDefault !== undefined) {
      const value = Number(data.stockMinimoDefault)
      if (!Number.isFinite(value) || value < 0) {
        throw new Error('El stock mínimo por defecto no puede ser negativo')
      }
      current.stockMinimoDefault = value
    }

    if (data.margenUtilidadDefault !== undefined) {
      const value = Number(data.margenUtilidadDefault)
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        throw new Error('El margen de utilidad debe estar entre 0 y 100')
      }
      current.margenUtilidadDefault = value
    }

    if (data.aprobacionOcHabilitada !== undefined) {
      current.aprobacionOcHabilitada = Boolean(data.aprobacionOcHabilitada)
    }

    if (data.aprobacionOcMontoMinimo !== undefined) {
      const value = Number(data.aprobacionOcMontoMinimo)
      if (!Number.isFinite(value) || value < 0) {
        throw new Error('El monto mínimo de aprobación no puede ser negativo')
      }
      current.aprobacionOcMontoMinimo = value
    }

    current.updatedAt = new Date().toISOString()
    StorageEngine.setSettingsRaw(current)
    StorageEngine.recordAuditLog(
      'settings_updated',
      `Parámetros del sistema actualizados (stock mínimo: ${current.stockMinimoDefault}, margen de utilidad: ${current.margenUtilidadDefault}%)`,
    )
    return current
  }

  public static resetSettings(): SystemSettings {
    StorageEngine.init()
    StorageEngine.setSettingsRaw(SEED_SETTINGS)
    StorageEngine.recordAuditLog(
      'settings_reset',
      'Parámetros del sistema restablecidos a valores por defecto',
    )
    return StorageEngine.getSettingsRaw()
  }

  public static loadInitialCatalog(): { products: number; providers: number } {
    StorageEngine.init()
    const products = StorageEngine.getProductsRaw()
    const providers = StorageEngine.getProvidersRaw()
    const settings = StorageEngine.getSettingsRaw()

    const initialProducts = products.length > 0 ? products : [...SEED_PRODUCTS]
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(initialProducts))

    const initialProviders = providers.length > 0 ? providers : [...SEED_PROVIDERS]
    localStorage.setItem(KEYS.PROVIDERS, JSON.stringify(initialProviders))

    settings.catalogoInicialCargado = true
    settings.updatedAt = new Date().toISOString()
    StorageEngine.setSettingsRaw(settings)

    StorageEngine.recordAuditLog(
      'catalog_loaded',
      `Catálogo inicial cargado (${initialProducts.length} productos, ${initialProviders.length} proveedores)`,
    )

    return { products: initialProducts.length, providers: initialProviders.length }
  }

  // ----------------------------------------------------
  // AUDIT LOG METHODS
  // ----------------------------------------------------
  public static recordAuditLog(
    accion: AuditAction,
    detalle: string,
    actor?: User,
  ): AuditLogEntry {
    const user = actor || StorageEngine.getCurrentUser()
    const entries = StorageEngine.getAuditLogRaw()
    const nextId =
      entries.length > 0 ? Math.max(...entries.map((e) => e.id)) + 1 : 1

    const entry: AuditLogEntry = {
      id: nextId,
      fecha: new Date().toISOString(),
      id_usuario: user.id_usuario,
      nombre_usuario: user.nombre,
      email_usuario: user.email,
      rol_usuario: user.rol,
      accion,
      detalle,
    }

    entries.unshift(entry)
    StorageEngine.setAuditLogRaw(entries)
    return entry
  }

  public static getAuditLog(
    skip = 0,
    limit = 50,
    filters?: { usuario?: string; accion?: string },
  ): AuditLogListResponse {
    let list = StorageEngine.getAuditLogRaw()

    if (filters?.usuario && filters.usuario.trim()) {
      const term = filters.usuario.trim().toLowerCase()
      list = list.filter(
        (e) =>
          e.nombre_usuario.toLowerCase().includes(term) ||
          e.email_usuario.toLowerCase().includes(term),
      )
    }

    if (filters?.accion && filters.accion.trim()) {
      const accion = filters.accion.trim().toLowerCase()
      list = list.filter((e) => e.accion.toLowerCase().includes(accion))
    }

    const total = list.length
    const items = list.slice(skip, skip + limit)
    return { items, total, skip, limit }
  }

  public static clearAuditLog(): void {
    StorageEngine.init()
    StorageEngine.setAuditLogRaw([])
  }

  private static applyDefaultMargin(detalles: QuotationDetail[]): QuotationDetail[] {
    const margin = StorageEngine.getSettings().margenUtilidadDefault
    const products = StorageEngine.getProductsRaw()
    return detalles.map((d) => {
      const hasExplicitPrice = Number(d.precio_unitario) > 0
      let precio = Number(d.precio_unitario) || 0
      let subtotal = Number(d.subtotal) || 0

      if (!hasExplicitPrice) {
        const product = products.find((p) => p.id_producto === d.id_producto)
        const basePrice = Number(product?.precio_unitario ?? 0)
        precio = Math.round(basePrice * (1 + margin / 100))
        subtotal = precio * d.cantidad - (Number(d.descuento) || 0)
      }

      return { ...d, precio_unitario: precio, subtotal }
    })
  }

  // ----------------------------------------------------
  // PRODUCT METHODS
  // ----------------------------------------------------
  public static getProducts(
    skip = 0,
    limit = 50,
    search?: string,
  ): ProductListResponse {
    let list = StorageEngine.getProductsRaw().filter((p) => p.activo !== false)

    if (search && search.trim()) {
      const term = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(term)),
      )
    }

    const total = list.length
    const items = list.slice(skip, skip + limit)
    return { items, total, skip, limit }
  }

  public static getProduct(productId: number): Product {
    const products = StorageEngine.getProductsRaw()
    const product = products.find((p) => p.id_producto === productId && p.activo !== false)
    if (!product) {
      throw new Error(`Producto con ID ${productId} no encontrado`)
    }
    return product
  }

  public static createProduct(data: ProductCreate): Product {
    const products = StorageEngine.getProductsRaw()
    const trimmedName = data.nombre.trim()

    // Validation: Duplicate name
    const exists = products.some(
      (p) => p.activo !== false && p.nombre.trim().toLowerCase() === trimmedName.toLowerCase(),
    )
    if (exists) {
      throw new Error(`Ya existe un producto registrado con el nombre "${trimmedName}"`)
    }

    const nextId =
      products.length > 0 ? Math.max(...products.map((p) => p.id_producto)) + 1 : 1
    const stockActual = Number(data.stock_inicial || 0)
    const stockMinimo = Number(data.stock_minimo || 0)
    const lowStock = stockActual <= stockMinimo

    let nombreProveedor: string | undefined
    if (data.id_proveedor) {
      const providers = StorageEngine.getProvidersRaw()
      const prov = providers.find((p) => p.id_proveedor === data.id_proveedor)
      nombreProveedor = prov?.nombre_empresa
    }

    const newProduct: Product = {
      id_producto: nextId,
      nombre: trimmedName,
      descripcion: data.descripcion?.trim() || undefined,
      unidad_medida: data.unidad_medida || 'unidad',
      precio_unitario: Number(data.precio_unitario || 0),
      stock_actual: stockActual,
      stock_minimo: stockMinimo,
      id_proveedor: data.id_proveedor || undefined,
      nombre_proveedor: nombreProveedor,
      activo: true,
      status: lowStock ? 'low' : 'normal',
      low_stock: lowStock,
    }

    products.unshift(newProduct)
    StorageEngine.setProductsRaw(products)

    // If initial stock > 0, generate initial movement
    if (stockActual > 0) {
      const currentUser = StorageEngine.getCurrentUser()
      const movements = StorageEngine.getMovementsRaw()
      const nextMovId =
        movements.length > 0 ? Math.max(...movements.map((m) => m.id_movimiento)) + 1 : 1

      const initMovement: Movement = {
        id_movimiento: nextMovId,
        id_producto: nextId,
        nombre_producto: newProduct.nombre,
        tipo: 'entrada',
        cantidad: stockActual,
        referencia: 'INVENTARIO INICIAL',
        id_usuario: currentUser.id_usuario,
        nombre_usuario: currentUser.nombre,
        fecha: new Date().toISOString(),
        nota: 'Stock inicial registrado al crear producto',
      }
      movements.unshift(initMovement)
      StorageEngine.setMovementsRaw(movements)
    }

    return newProduct
  }

  public static updateProduct(productId: number, data: ProductUpdate): Product {
    const products = StorageEngine.getProductsRaw()
    const index = products.findIndex((p) => p.id_producto === productId && p.activo !== false)
    if (index === -1) {
      throw new Error(`Producto con ID ${productId} no encontrado`)
    }

    const current = products[index]

    if (data.nombre && data.nombre.trim()) {
      const trimmedName = data.nombre.trim()
      const duplicate = products.some(
        (p) =>
          p.id_producto !== productId &&
          p.activo !== false &&
          p.nombre.trim().toLowerCase() === trimmedName.toLowerCase(),
      )
      if (duplicate) {
        throw new Error(`Ya existe otro producto con el nombre "${trimmedName}"`)
      }
      current.nombre = trimmedName
    }

    if (data.descripcion !== undefined) current.descripcion = data.descripcion
    if (data.unidad_medida !== undefined) current.unidad_medida = data.unidad_medida
    if (data.precio_unitario !== undefined) current.precio_unitario = Number(data.precio_unitario)
    if (data.stock_minimo !== undefined) current.stock_minimo = Number(data.stock_minimo)

    if (data.id_proveedor !== undefined) {
      current.id_proveedor = data.id_proveedor || undefined
      if (data.id_proveedor) {
        const providers = StorageEngine.getProvidersRaw()
        const prov = providers.find((p) => p.id_proveedor === data.id_proveedor)
        current.nombre_proveedor = prov?.nombre_empresa
      } else {
        current.nombre_proveedor = undefined
      }
    }

    // Recalculate status & low_stock
    current.low_stock = current.stock_actual <= current.stock_minimo
    current.status = current.low_stock ? 'low' : 'normal'

    products[index] = current
    StorageEngine.setProductsRaw(products)

    return current
  }

  public static deleteProduct(productId: number): void {
    const products = StorageEngine.getProductsRaw()
    const index = products.findIndex((p) => p.id_producto === productId)
    if (index === -1) {
      throw new Error(`Producto con ID ${productId} no encontrado`)
    }

    const movements = StorageEngine.getMovementsRaw()
    const hasMovements = movements.some((m) => m.id_producto === productId)

    if (hasMovements) {
      // Soft delete
      products[index].activo = false
    } else {
      // Hard delete
      products.splice(index, 1)
    }

    StorageEngine.setProductsRaw(products)
  }

  // ----------------------------------------------------
  // MOVEMENT METHODS
  // ----------------------------------------------------
  public static getMovements(
    skip = 0,
    limit = 50,
    productId?: number,
    dateFrom?: string,
    dateTo?: string,
  ): MovementListResponse {
    let list = StorageEngine.getMovementsRaw()

    if (productId) {
      list = list.filter((m) => m.id_producto === productId)
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom).getTime()
      list = list.filter((m) => new Date(m.fecha).getTime() >= fromDate)
    }

    if (dateTo) {
      const toDate = new Date(dateTo).getTime()
      list = list.filter((m) => new Date(m.fecha).getTime() <= toDate)
    }

    const total = list.length
    const items = list.slice(skip, skip + limit)
    return { items, total, skip, limit }
  }

  public static createEntry(data: MovementEntryCreate): Movement {
    if (!data.quantity || data.quantity <= 0) {
      throw new Error('La cantidad a ingresar debe ser mayor a 0')
    }

    const products = StorageEngine.getProductsRaw()
    const productIndex = products.findIndex(
      (p) => p.id_producto === data.product_id && p.activo !== false,
    )
    if (productIndex === -1) {
      throw new Error(`Producto con ID ${data.product_id} no encontrado`)
    }

    const product = products[productIndex]
    product.stock_actual += Number(data.quantity)
    product.low_stock = product.stock_actual <= product.stock_minimo
    product.status = product.low_stock ? 'low' : 'normal'
    products[productIndex] = product
    StorageEngine.setProductsRaw(products)

    const movements = StorageEngine.getMovementsRaw()
    const nextId =
      movements.length > 0 ? Math.max(...movements.map((m) => m.id_movimiento)) + 1 : 1
    const currentUser = StorageEngine.getCurrentUser()

    const newMovement: Movement = {
      id_movimiento: nextId,
      id_producto: product.id_producto,
      nombre_producto: product.nombre,
      tipo: 'entrada',
      cantidad: Number(data.quantity),
      referencia: data.reference?.trim() || undefined,
      id_usuario: currentUser.id_usuario,
      nombre_usuario: currentUser.nombre,
      fecha: data.fecha || new Date().toISOString(),
      nota: data.note?.trim() || undefined,
    }

    movements.unshift(newMovement)
    StorageEngine.setMovementsRaw(movements)

    return newMovement
  }

  public static createOutput(data: MovementOutputCreate): Movement {
    if (!data.quantity || data.quantity <= 0) {
      throw new Error('La cantidad a retirar debe ser mayor a 0')
    }

    const products = StorageEngine.getProductsRaw()
    const productIndex = products.findIndex(
      (p) => p.id_producto === data.product_id && p.activo !== false,
    )
    if (productIndex === -1) {
      throw new Error(`Producto con ID ${data.product_id} no encontrado`)
    }

    const product = products[productIndex]

    // Stock sufficiency check: prevent negative stock
    if (data.quantity > product.stock_actual) {
      throw new Error(
        `Stock insuficiente para "${product.nombre}". Stock disponible: ${product.stock_actual}, solicitado: ${data.quantity}`,
      )
    }

    product.stock_actual -= Number(data.quantity)
    product.low_stock = product.stock_actual <= product.stock_minimo
    product.status = product.low_stock ? 'low' : 'normal'
    products[productIndex] = product
    StorageEngine.setProductsRaw(products)

    const movements = StorageEngine.getMovementsRaw()
    const nextId =
      movements.length > 0 ? Math.max(...movements.map((m) => m.id_movimiento)) + 1 : 1
    const currentUser = StorageEngine.getCurrentUser()

    const newMovement: Movement = {
      id_movimiento: nextId,
      id_producto: product.id_producto,
      nombre_producto: product.nombre,
      tipo: 'salida',
      cantidad: Number(data.quantity),
      referencia: data.reference?.trim() || undefined,
      id_usuario: currentUser.id_usuario,
      nombre_usuario: currentUser.nombre,
      fecha: data.fecha || new Date().toISOString(),
      nota: data.note?.trim() || undefined,
    }

    movements.unshift(newMovement)
    StorageEngine.setMovementsRaw(movements)

    return newMovement
  }

  public static createAdjustment(data: MovementAdjustmentCreate): Movement {
    if (data.quantity === undefined || data.quantity < 0) {
      throw new Error('La cantidad del ajuste no puede ser negativa')
    }

    if (!data.note || !data.note.trim()) {
      throw new Error('El motivo del ajuste es obligatorio')
    }

    const products = StorageEngine.getProductsRaw()
    const productIndex = products.findIndex(
      (p) => p.id_producto === data.product_id && p.activo !== false,
    )
    if (productIndex === -1) {
      throw new Error(`Producto con ID ${data.product_id} no encontrado`)
    }

    const product = products[productIndex]
    const previousStock = product.stock_actual
    product.stock_actual = Number(data.quantity)
    product.low_stock = product.stock_actual <= product.stock_minimo
    product.status = product.low_stock ? 'low' : 'normal'
    products[productIndex] = product
    StorageEngine.setProductsRaw(products)

    const movements = StorageEngine.getMovementsRaw()
    const nextId =
      movements.length > 0 ? Math.max(...movements.map((m) => m.id_movimiento)) + 1 : 1
    const currentUser = StorageEngine.getCurrentUser()

    const newMovement: Movement = {
      id_movimiento: nextId,
      id_producto: product.id_producto,
      nombre_producto: product.nombre,
      tipo: 'ajuste',
      cantidad: Number(data.quantity),
      referencia: data.reference?.trim() || `Ajuste (anterior: ${previousStock})`,
      id_usuario: currentUser.id_usuario,
      nombre_usuario: currentUser.nombre,
      fecha: data.fecha || new Date().toISOString(),
      nota: data.note?.trim() || undefined,
    }

    movements.unshift(newMovement)
    StorageEngine.setMovementsRaw(movements)

    return newMovement
  }

  // ----------------------------------------------------
  // PROVIDER METHODS
  // ----------------------------------------------------
  public static getProviders(
    skip = 0,
    limit = 50,
    search?: string,
    estado?: string,
    categoria?: string,
  ): ProviderListResponse {
    let list = StorageEngine.getProvidersRaw().filter((p) => p.estado !== 'inactivo')

    if (search && search.trim()) {
      const term = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.nombre_empresa.toLowerCase().includes(term) ||
          p.nit.toLowerCase().includes(term) ||
          (p.contacto && p.contacto.toLowerCase().includes(term)) ||
          (p.ciudad && p.ciudad.toLowerCase().includes(term)),
      )
    }

    if (estado) {
      list = list.filter((p) => p.estado === estado)
    }

    if (categoria) {
      list = list.filter((p) => p.categoria_material === categoria)
    }

    const total = list.length
    const items = list.slice(skip, skip + limit)
    return { items, total, skip, limit }
  }

  public static getProvider(providerId: number): Provider {
    const providers = StorageEngine.getProvidersRaw()
    const provider = providers.find((p) => p.id_proveedor === providerId && p.estado !== 'inactivo')
    if (!provider) {
      throw new Error(`Proveedor con ID ${providerId} no encontrado`)
    }
    return provider
  }

  public static createProvider(data: ProviderCreate): Provider {
    const providers = StorageEngine.getProvidersRaw()
    const trimmedNit = data.nit.trim()

    // Validate unique NIT
    const exists = providers.some(
      (p) => p.estado !== 'inactivo' && p.nit.trim().toLowerCase() === trimmedNit.toLowerCase(),
    )
    if (exists) {
      throw new Error(`Ya existe un proveedor registrado con el NIT "${trimmedNit}"`)
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      throw new Error('El formato del correo electrónico es inválido')
    }

    const nextId =
      providers.length > 0 ? Math.max(...providers.map((p) => p.id_proveedor)) + 1 : 1
    const now = new Date().toISOString()

    const newProvider: Provider = {
      id_proveedor: nextId,
      nombre_empresa: data.nombre_empresa.trim(),
      nit: trimmedNit,
      contacto: data.contacto?.trim() || undefined,
      telefono: data.telefono?.trim() || undefined,
      email: data.email?.trim() || undefined,
      direccion: data.direccion?.trim() || undefined,
      ciudad: data.ciudad?.trim() || undefined,
      categoria_material: data.categoria_material || 'general',
      condiciones_pago: data.condiciones_pago?.trim() || undefined,
      estado: data.estado || 'activo',
      observaciones: data.observaciones?.trim() || undefined,
      creado_en: now,
      actualizado_en: now,
    }

    providers.unshift(newProvider)
    StorageEngine.setProvidersRaw(providers)

    return newProvider
  }

  public static updateProvider(providerId: number, data: ProviderUpdate): Provider {
    const providers = StorageEngine.getProvidersRaw()
    const index = providers.findIndex((p) => p.id_proveedor === providerId && p.estado !== 'inactivo')
    if (index === -1) {
      throw new Error(`Proveedor con ID ${providerId} no encontrado`)
    }

    const current = providers[index]

    if (data.nit && data.nit.trim()) {
      const trimmedNit = data.nit.trim()
      const duplicate = providers.some(
        (p) =>
          p.id_proveedor !== providerId &&
          p.estado !== 'inactivo' &&
          p.nit.trim().toLowerCase() === trimmedNit.toLowerCase(),
      )
      if (duplicate) {
        throw new Error(`Ya existe otro proveedor con el NIT "${trimmedNit}"`)
      }
      current.nit = trimmedNit
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      throw new Error('El formato del correo electrónico es inválido')
    }

    if (data.nombre_empresa !== undefined) current.nombre_empresa = data.nombre_empresa.trim()
    if (data.contacto !== undefined) current.contacto = data.contacto?.trim() || undefined
    if (data.telefono !== undefined) current.telefono = data.telefono?.trim() || undefined
    if (data.email !== undefined) current.email = data.email?.trim() || undefined
    if (data.direccion !== undefined) current.direccion = data.direccion?.trim() || undefined
    if (data.ciudad !== undefined) current.ciudad = data.ciudad?.trim() || undefined
    if (data.categoria_material !== undefined) current.categoria_material = data.categoria_material
    if (data.condiciones_pago !== undefined) current.condiciones_pago = data.condiciones_pago?.trim() || undefined
    if (data.estado !== undefined) current.estado = data.estado
    if (data.observaciones !== undefined) current.observaciones = data.observaciones?.trim() || undefined

    current.actualizado_en = new Date().toISOString()
    providers[index] = current
    StorageEngine.setProvidersRaw(providers)

    return current
  }

  public static deleteProvider(providerId: number): void {
    const providers = StorageEngine.getProvidersRaw()
    const index = providers.findIndex((p) => p.id_proveedor === providerId)
    if (index === -1) {
      throw new Error(`Proveedor con ID ${providerId} no encontrado`)
    }

    // Soft delete
    providers[index].estado = 'inactivo'
    providers[index].actualizado_en = new Date().toISOString()
    StorageEngine.setProvidersRaw(providers)
  }

  // ----------------------------------------------------
  // CLIENT METHODS
  // ----------------------------------------------------
  public static getClients(
    skip = 0,
    limit = 50,
    search?: string,
    estado?: string,
    tipo?: string,
  ): ClientListResponse {
    let list = StorageEngine.getClientsRaw().filter((c) => c.activo !== false)

    if (search && search.trim()) {
      const term = search.trim().toLowerCase()
      list = list.filter(
        (c) =>
          c.nombre_razon_social.toLowerCase().includes(term) ||
          c.nit_cc.toLowerCase().includes(term) ||
          (c.nombre_contacto && c.nombre_contacto.toLowerCase().includes(term)) ||
          (c.email && c.email.toLowerCase().includes(term)) ||
          (c.ciudad && c.ciudad.toLowerCase().includes(term)),
      )
    }

    if (estado && estado !== 'Todos los estados' && estado !== '') {
      list = list.filter((c) => c.estado === estado)
    }

    if (tipo && tipo !== '') {
      list = list.filter((c) => c.tipo_cliente === tipo)
    }

    const total = list.length
    const items = list.slice(skip, skip + limit)
    return { items, total, skip, limit }
  }

  public static getClient(clientId: number): Client {
    const clients = StorageEngine.getClientsRaw()
    const client = clients.find((c) => c.id_cliente === clientId && c.activo !== false)
    if (!client) {
      throw new Error(`Cliente con ID ${clientId} no encontrado`)
    }
    return client
  }

  public static createClient(data: ClientCreate): Client {
    const clients = StorageEngine.getClientsRaw()
    const trimmedNit = data.nit_cc.trim()

    // Validate unique NIT/CC
    const exists = clients.some(
      (c) => c.activo !== false && c.nit_cc.trim().toLowerCase() === trimmedNit.toLowerCase(),
    )
    if (exists) {
      throw new Error(`Ya existe un cliente registrado con el NIT/CC "${trimmedNit}"`)
    }

    const nextId =
      clients.length > 0 ? Math.max(...clients.map((c) => c.id_cliente)) + 1 : 1
    const now = new Date().toISOString()

    const newClient: Client = {
      id_cliente: nextId,
      tipo_cliente: data.tipo_cliente,
      nombre_razon_social: data.nombre_razon_social.trim(),
      nit_cc: trimmedNit,
      nombre_contacto: data.nombre_contacto?.trim() || undefined,
      telefono: data.telefono?.trim() || undefined,
      email: data.email?.trim() || undefined,
      direccion: data.direccion?.trim() || undefined,
      ciudad: data.ciudad?.trim() || undefined,
      observaciones: data.observaciones?.trim() || undefined,
      estado: 'activo',
      activo: true,
      created_at: now,
      updated_at: now,
    }

    clients.unshift(newClient)
    StorageEngine.setClientsRaw(clients)

    return newClient
  }

  public static updateClient(clientId: number, data: ClientUpdate): Client {
    const clients = StorageEngine.getClientsRaw()
    const index = clients.findIndex((c) => c.id_cliente === clientId && c.activo !== false)
    if (index === -1) {
      throw new Error(`Cliente con ID ${clientId} no encontrado`)
    }

    const current = clients[index]

    if (data.nit_cc && data.nit_cc.trim()) {
      const trimmedNit = data.nit_cc.trim()
      const duplicate = clients.some(
        (c) =>
          c.id_cliente !== clientId &&
          c.activo !== false &&
          c.nit_cc.trim().toLowerCase() === trimmedNit.toLowerCase(),
      )
      if (duplicate) {
        throw new Error(`Ya existe otro cliente con el NIT/CC "${trimmedNit}"`)
      }
      current.nit_cc = trimmedNit
    }

    if (data.tipo_cliente !== undefined) current.tipo_cliente = data.tipo_cliente
    if (data.nombre_razon_social !== undefined) current.nombre_razon_social = data.nombre_razon_social.trim()
    if (data.nombre_contacto !== undefined) current.nombre_contacto = data.nombre_contacto?.trim() || undefined
    if (data.telefono !== undefined) current.telefono = data.telefono?.trim() || undefined
    if (data.email !== undefined) current.email = data.email?.trim() || undefined
    if (data.direccion !== undefined) current.direccion = data.direccion?.trim() || undefined
    if (data.ciudad !== undefined) current.ciudad = data.ciudad?.trim() || undefined
    if (data.observaciones !== undefined) current.observaciones = data.observaciones?.trim() || undefined
    if (data.estado !== undefined) current.estado = data.estado
    if (data.activo !== undefined) current.activo = data.activo

    current.updated_at = new Date().toISOString()
    clients[index] = current
    StorageEngine.setClientsRaw(clients)

    return current
  }

  public static deleteClient(clientId: number): void {
    const clients = StorageEngine.getClientsRaw()
    const index = clients.findIndex((c) => c.id_cliente === clientId)
    if (index === -1) {
      throw new Error(`Cliente con ID ${clientId} no encontrado`)
    }

    clients[index].activo = false
    clients[index].estado = 'inactivo'
    clients[index].updated_at = new Date().toISOString()
    StorageEngine.setClientsRaw(clients)
  }

  // ----------------------------------------------------
  // QUOTATION METHODS
  // ----------------------------------------------------
  public static getQuotes(
    skip = 0,
    limit = 50,
    idCliente?: number,
    estado?: string,
  ): QuotationListResponse {
    let list = StorageEngine.getQuotationsRaw()

    if (idCliente) {
      list = list.filter((q) => q.id_cliente === idCliente)
    }

    if (estado && estado !== 'Todos los estados' && estado !== '') {
      list = list.filter((q) => q.estado === estado)
    }

    const total = list.length
    const items = list.slice(skip, skip + limit)
    return { items, total, skip, limit }
  }

  public static getQuote(quoteId: number): Quotation {
    const quotations = StorageEngine.getQuotationsRaw()
    const quote = quotations.find((q) => q.id_cotizacion === quoteId)
    if (!quote) {
      throw new Error(`Cotización con ID ${quoteId} no encontrada`)
    }
    return quote
  }

  public static createQuote(data: QuotationCreate): Quotation {
    const quotations = StorageEngine.getQuotationsRaw()
    const nextId =
      quotations.length > 0 ? Math.max(...quotations.map((q) => q.id_cotizacion)) + 1 : 1
    const currentUser = StorageEngine.getCurrentUser()
    const detalles = StorageEngine.applyDefaultMargin(data.detalles || [])

    const subtotal = (detalles || []).reduce(
      (sum, d) => sum + (d.subtotal || d.cantidad * d.precio_unitario - (d.descuento || 0)),
      0,
    )
    const descuento = Number(data.descuento || 0)
    const subtotalAfterDescuento = Math.max(0, subtotal - descuento)
    const impuestos = Math.round(subtotalAfterDescuento * 0.19)
    const total = subtotalAfterDescuento + impuestos

    const newQuote: Quotation = {
      id_cotizacion: nextId,
      numero_consecutivo: `COT-${String(nextId).padStart(4, '0')}`,
      id_cliente: data.id_cliente,
      id_usuario: currentUser.id_usuario,
      fecha_emision: new Date().toISOString(),
      fecha_vencimiento: data.fecha_vencimiento || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      estado: 'borrador',
      subtotal,
      impuestos,
      descuento,
      total,
      observaciones: data.observaciones?.trim() || undefined,
      detalles,
    }

    quotations.unshift(newQuote)
    StorageEngine.setQuotationsRaw(quotations)

    return newQuote
  }

  public static updateQuote(quoteId: number, data: QuotationUpdate): Quotation {
    const quotations = StorageEngine.getQuotationsRaw()
    const index = quotations.findIndex((q) => q.id_cotizacion === quoteId)
    if (index === -1) {
      throw new Error(`Cotización con ID ${quoteId} no encontrada`)
    }

    const current = quotations[index]
    if (data.id_cliente !== undefined) current.id_cliente = data.id_cliente
    if (data.fecha_vencimiento !== undefined) current.fecha_vencimiento = data.fecha_vencimiento
    if (data.observaciones !== undefined) current.observaciones = data.observaciones?.trim() || undefined
    if (data.descuento !== undefined) current.descuento = Number(data.descuento)
    if (data.detalles !== undefined) current.detalles = StorageEngine.applyDefaultMargin(data.detalles)

    const subtotal = (current.detalles || []).reduce(
      (sum, d) => sum + (d.subtotal || d.cantidad * d.precio_unitario - (d.descuento || 0)),
      0,
    )
    const subtotalAfterDescuento = Math.max(0, subtotal - current.descuento)
    current.subtotal = subtotal
    current.impuestos = Math.round(subtotalAfterDescuento * 0.19)
    current.total = subtotalAfterDescuento + current.impuestos

    quotations[index] = current
    StorageEngine.setQuotationsRaw(quotations)

    return current
  }

  public static updateQuoteStatus(quoteId: number, data: QuotationEstadoUpdate): Quotation {
    const quotations = StorageEngine.getQuotationsRaw()
    const index = quotations.findIndex((q) => q.id_cotizacion === quoteId)
    if (index === -1) {
      throw new Error(`Cotización con ID ${quoteId} no encontrada`)
    }

    quotations[index].estado = data.estado
    StorageEngine.setQuotationsRaw(quotations)

    return quotations[index]
  }

  public static deleteQuote(quoteId: number): void {
    const quotations = StorageEngine.getQuotationsRaw()
    const index = quotations.findIndex((q) => q.id_cotizacion === quoteId)
    if (index === -1) {
      throw new Error(`Cotización con ID ${quoteId} no encontrada`)
    }

    quotations.splice(index, 1)
    StorageEngine.setQuotationsRaw(quotations)
  }

  // ----------------------------------------------------
  // SALE / ORDER METHODS
  // ----------------------------------------------------
  public static getSales(
    skip = 0,
    limit = 50,
    idCliente?: number,
    estado?: string,
  ): SaleListResponse {
    let list = StorageEngine.getSalesRaw()

    if (idCliente) {
      list = list.filter((s) => s.id_cliente === idCliente)
    }

    if (estado && estado !== 'Todos los estados' && estado !== '') {
      list = list.filter((s) => s.estado === estado)
    }

    const total = list.length
    const items = list.slice(skip, skip + limit)
    return { items, total, skip, limit }
  }

  public static getSale(saleId: number): Sale {
    const sales = StorageEngine.getSalesRaw()
    const sale = sales.find((s) => s.id_orden_venta === saleId)
    if (!sale) {
      throw new Error(`Pedido con ID ${saleId} no encontrado`)
    }
    return sale
  }

  public static createSale(data: SaleCreate): Sale {
    // El stock NO se descuenta al crear el pedido. Se descuenta cuando Bodega
    // confirma el despacho físico (confirmDispatch).
    const products = StorageEngine.getProductsRaw()
    for (const detail of data.detalles) {
      const prod = products.find((p) => p.id_producto === detail.id_producto && p.activo !== false)
      if (!prod) {
        throw new Error(`Producto con ID ${detail.id_producto} no encontrado`)
      }
    }

    const currentUser = StorageEngine.getCurrentUser()
    const sales = StorageEngine.getSalesRaw()
    const nextSaleId =
      sales.length > 0 ? Math.max(...sales.map((s) => s.id_orden_venta)) + 1 : 1
    const orderNumber = `PED-${String(nextSaleId).padStart(4, '0')}`

    const total = data.detalles.reduce(
      (sum, d) => sum + (d.subtotal || d.cantidad * d.precio_unitario - (d.descuento || 0)),
      0,
    )

    const newSale: Sale = {
      id_orden_venta: nextSaleId,
      numero_orden: orderNumber,
      id_cliente: data.id_cliente,
      id_cotizacion: data.id_cotizacion,
      id_usuario: currentUser.id_usuario,
      fecha_venta: new Date().toISOString(),
      estado: 'pendiente',
      total,
      observaciones: data.observaciones?.trim() || undefined,
      detalles: data.detalles,
    }

    sales.unshift(newSale)
    StorageEngine.setSalesRaw(sales)

    return newSale
  }

  public static confirmDispatch(saleId: number, observaciones?: string): Sale {
    const sales = StorageEngine.getSalesRaw()
    const index = sales.findIndex((s) => s.id_orden_venta === saleId)
    if (index === -1) {
      throw new Error(`Pedido con ID ${saleId} no encontrado`)
    }

    const sale = sales[index]
    if (sale.estado === 'entregada') {
      return sale
    }

    const products = StorageEngine.getProductsRaw()
    const movements = StorageEngine.getMovementsRaw()
    const currentUser = StorageEngine.getCurrentUser()

    // 1. Verify sufficient stock for all items
    for (const detail of sale.detalles) {
      const prod = products.find((p) => p.id_producto === detail.id_producto && p.activo !== false)
      if (!prod) {
        throw new Error(`Producto con ID ${detail.id_producto} no encontrado`)
      }
      if (prod.stock_actual < detail.cantidad) {
        throw new Error(
          `Stock insuficiente para "${prod.nombre}". Stock disponible: ${prod.stock_actual}, solicitado: ${detail.cantidad}`,
        )
      }
    }

    // 2. Deduct stock and register output movements
    for (const detail of sale.detalles) {
      const prodIndex = products.findIndex((p) => p.id_producto === detail.id_producto)
      if (prodIndex !== -1) {
        const prod = products[prodIndex]
        prod.stock_actual -= detail.cantidad
        prod.low_stock = prod.stock_actual <= prod.stock_minimo
        prod.status = prod.low_stock ? 'low' : 'normal'
        products[prodIndex] = prod

        const nextMovId =
          movements.length > 0 ? Math.max(...movements.map((m) => m.id_movimiento)) + 1 : 1
        movements.unshift({
          id_movimiento: nextMovId,
          id_producto: prod.id_producto,
          nombre_producto: prod.nombre,
          tipo: 'salida',
          cantidad: detail.cantidad,
          referencia: sale.numero_orden,
          id_usuario: currentUser.id_usuario,
          nombre_usuario: currentUser.nombre,
          fecha: new Date().toISOString(),
          nota: `Despacho confirmado del pedido ${sale.numero_orden}`,
        })
      }
    }

    StorageEngine.setProductsRaw(products)
    StorageEngine.setMovementsRaw(movements)

    sale.estado = 'entregada'
    if (observaciones !== undefined) sale.observaciones = observaciones.trim() || sale.observaciones
    sales[index] = sale
    StorageEngine.setSalesRaw(sales)

    StorageEngine.recordAuditLog(
      'sale_dispatched',
      `Bodega confirmó el despacho del pedido ${sale.numero_orden}`,
      currentUser,
    )

    return sale
  }

  public static updateSale(saleId: number, data: SaleUpdate): Sale {
    const sales = StorageEngine.getSalesRaw()
    const index = sales.findIndex((s) => s.id_orden_venta === saleId)
    if (index === -1) {
      throw new Error(`Pedido con ID ${saleId} no encontrado`)
    }

    const current = sales[index]
    if (data.estado !== undefined) current.estado = data.estado
    if (data.observaciones !== undefined) current.observaciones = data.observaciones?.trim() || undefined

    sales[index] = current
    StorageEngine.setSalesRaw(sales)

    return current
  }

  public static cancelSale(saleId: number): Sale {
    const sales = StorageEngine.getSalesRaw()
    const index = sales.findIndex((s) => s.id_orden_venta === saleId)
    if (index === -1) {
      throw new Error(`Pedido con ID ${saleId} no encontrado`)
    }

    const sale = sales[index]
    if (sale.estado === 'cancelada') {
      return sale
    }

    // Solo se restaura stock si el pedido ya fue despachado (entregada) y por lo
    // tanto el stock ya fue descontado al confirmar el despacho.
    const wasDispatched = sale.estado === 'entregada'

    if (wasDispatched) {
      // Restore stock and create entry movements
      const products = StorageEngine.getProductsRaw()
      const movements = StorageEngine.getMovementsRaw()
      const currentUser = StorageEngine.getCurrentUser()

      for (const detail of sale.detalles) {
        const prodIndex = products.findIndex((p) => p.id_producto === detail.id_producto)
        if (prodIndex !== -1) {
          const prod = products[prodIndex]
          prod.stock_actual += detail.cantidad
          prod.low_stock = prod.stock_actual <= prod.stock_minimo
          prod.status = prod.low_stock ? 'low' : 'normal'
          products[prodIndex] = prod

          const nextMovId =
            movements.length > 0 ? Math.max(...movements.map((m) => m.id_movimiento)) + 1 : 1
          movements.unshift({
            id_movimiento: nextMovId,
            id_producto: prod.id_producto,
            nombre_producto: prod.nombre,
            tipo: 'entrada',
            cantidad: detail.cantidad,
            referencia: `REVERSIÓN ${sale.numero_orden}`,
            id_usuario: currentUser.id_usuario,
            nombre_usuario: currentUser.nombre,
            fecha: new Date().toISOString(),
            nota: `Restauración de stock por cancelación del despacho ${sale.numero_orden}`,
          })
        }
      }

      StorageEngine.setProductsRaw(products)
      StorageEngine.setMovementsRaw(movements)
    }

    sale.estado = 'cancelada'
    sales[index] = sale
    StorageEngine.setSalesRaw(sales)

    return sale
  }

  public static convertQuoteToSale(quoteId: number, observaciones?: string): Sale {
    const quotation = StorageEngine.getQuote(quoteId)
    const saleCreateData: SaleCreate = {
      id_cliente: quotation.id_cliente,
      observaciones: observaciones || `Convertido desde ${quotation.numero_consecutivo}`,
      detalles: quotation.detalles.map((d, idx) => ({
        id_detalle_venta: idx + 1,
        id_producto: d.id_producto,
        descripcion: d.descripcion,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        descuento: d.descuento || 0,
        subtotal: d.subtotal,
      })),
    }

    // createSale verifies stock, creates output movements and updates products
    const sale = StorageEngine.createSale(saleCreateData)
    sale.id_cotizacion = quoteId

    // Update quote status to aprobada
    StorageEngine.updateQuoteStatus(quoteId, { estado: 'aprobada' })

    const sales = StorageEngine.getSalesRaw()
    const sIdx = sales.findIndex((s) => s.id_orden_venta === sale.id_orden_venta)
    if (sIdx !== -1) {
      sales[sIdx] = sale
      StorageEngine.setSalesRaw(sales)
    }

    return sale
  }

  // ----------------------------------------------------
  // AUTH METHODS
  // ----------------------------------------------------
  public static login(data: LoginRequest): TokenResponse {
    const users = StorageEngine.getUsersRaw()
    const email = data.email.trim().toLowerCase()
    let user = users.find((u) => u.email.toLowerCase() === email)

    if (!user) {
      // If user logging in is one of default seed accounts, initialize it
      const seedMatch = SEED_USERS.find((u) => u.email.toLowerCase() === email)
      if (seedMatch) {
        user = seedMatch
        users.push(user)
        StorageEngine.setUsersRaw(users)
      } else {
        throw new Error('Credenciales incorrectas. Usuario no encontrado.')
      }
    }

    if (user.activo === false) {
      throw new Error('El usuario se encuentra desactivado. Contacte al administrador.')
    }

    if (!user.password_hash || !verifyPassword(data.password, user.password_hash)) {
      throw new Error('Credenciales incorrectas. Verifique su correo y contraseña.')
    }

    const accessToken = StorageEngine.createMockToken(user)
    const refreshToken = `mock_refresh_${user.id_usuario}_${Date.now()}`

    StorageEngine.recordAuditLog('login', `Inicio de sesión de ${user.nombre}`, user)

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
    }
  }

  public static register(data: RegisterRequest): User {
    const users = StorageEngine.getUsersRaw()
    const email = data.email.trim().toLowerCase()

    const exists = users.some((u) => u.email.toLowerCase() === email)
    if (exists) {
      throw new Error(`El correo ${data.email} ya se encuentra registrado`)
    }

    if (!data.password || data.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres')
    }

    const nextId =
      users.length > 0 ? Math.max(...users.map((u) => u.id_usuario)) + 1 : 1

    const newUser: User = {
      id_usuario: nextId,
      email: data.email.trim(),
      nombre: data.nombre.trim(),
      rol: data.rol || 'admin',
      activo: true,
      creado_en: new Date().toISOString(),
      password_hash: hashPassword(data.password),
    }

    users.push(newUser)
    StorageEngine.setUsersRaw(users)

    const actor = StorageEngine.getCurrentUser()
    StorageEngine.recordAuditLog(
      'user_created',
      `Se creó el usuario ${newUser.nombre} (${newUser.email}, rol ${newUser.rol})`,
      actor,
    )

    return newUser
  }

  public static refresh(refreshToken: string): TokenResponse {
    if (!refreshToken) {
      throw new Error('Token de refresco inválido')
    }
    const currentUser = StorageEngine.getCurrentUser()
    const accessToken = StorageEngine.createMockToken(currentUser)
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
    }
  }

  public static getUsers(skip = 0, limit = 100): User[] {
    const users = StorageEngine.getUsersRaw()
    return users.slice(skip, skip + limit)
  }

  public static getUser(userId: number): User {
    const users = StorageEngine.getUsersRaw()
    const user = users.find((u) => u.id_usuario === userId)
    if (!user) {
      throw new Error(`Usuario con ID ${userId} no encontrado`)
    }
    return user
  }

  public static updateUser(userId: number, data: UserUpdateRequest): User {
    const users = StorageEngine.getUsersRaw()
    const index = users.findIndex((u) => u.id_usuario === userId)
    if (index === -1) {
      throw new Error(`Usuario con ID ${userId} no encontrado`)
    }

    const current = users[index]

    const previousRol = current.rol
    const previousActivo = current.activo

    if (data.email && data.email.trim()) {
      const trimmedEmail = data.email.trim().toLowerCase()
      const duplicate = users.some(
        (u) => u.id_usuario !== userId && u.email.toLowerCase() === trimmedEmail,
      )
      if (duplicate) {
        throw new Error(`El correo ${data.email} ya está en uso por otro usuario`)
      }
      current.email = data.email.trim()
    }

    if (data.nombre !== undefined && data.nombre.trim()) {
      current.nombre = data.nombre.trim()
    }
    if (data.rol !== undefined) {
      current.rol = data.rol
    }
    if (data.activo !== undefined) {
      current.activo = data.activo
    }
    if (data.password) {
      if (data.password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres')
      }
      current.password_hash = hashPassword(data.password)
    }

    users[index] = current
    StorageEngine.setUsersRaw(users)

    const actor = StorageEngine.getCurrentUser()
    if (data.activo !== undefined && data.activo !== previousActivo) {
      StorageEngine.recordAuditLog(
        data.activo ? 'user_activated' : 'user_deactivated',
        data.activo
          ? `Se activó el usuario ${current.nombre} (${current.email})`
          : `Se desactivó el usuario ${current.nombre} (${current.email})`,
        actor,
      )
    } else if (data.rol !== undefined && data.rol !== previousRol) {
      StorageEngine.recordAuditLog(
        'role_changed',
        `Cambio de rol de ${current.nombre}: ${previousRol} → ${current.rol}`,
        actor,
      )
    } else {
      StorageEngine.recordAuditLog(
        'user_updated',
        `Se actualizó el usuario ${current.nombre} (${current.email})`,
        actor,
      )
    }

    return current
  }

  public static deleteUser(userId: number): void {
    const users = StorageEngine.getUsersRaw()
    const index = users.findIndex((u) => u.id_usuario === userId)
    if (index === -1) {
      throw new Error(`Usuario con ID ${userId} no encontrado`)
    }

    users[index].activo = false
    StorageEngine.setUsersRaw(users)

    const actor = StorageEngine.getCurrentUser()
    const target = users[index]
    StorageEngine.recordAuditLog(
      'user_deactivated',
      `Se desactivó el usuario ${target.nombre} (${target.email})`,
      actor,
    )
  }

  // ----------------------------------------------------
  // PURCHASE ORDERS (Órdenes de Compra)
  // ----------------------------------------------------
  public static getPurchaseOrdersRaw(): PurchaseOrder[] {
    const raw = localStorage.getItem(KEYS.POS)
    if (!raw) {
      return []
    }
    try {
      return JSON.parse(raw) as PurchaseOrder[]
    } catch {
      return []
    }
  }

  public static setPurchaseOrdersRaw(orders: PurchaseOrder[]): void {
    localStorage.setItem(KEYS.POS, JSON.stringify(orders))
  }

  public static getPurchaseOrders(
    skip = 0,
    limit = 50,
    estado?: string,
  ): PurchaseOrderListResponse {
    let items = StorageEngine.getPurchaseOrdersRaw()
    if (estado) {
      items = items.filter((o) => o.estado === estado)
    }
    const total = items.length
    const sliced = items.slice(skip, skip + limit)
    return { items: sliced, total, skip, limit }
  }

  public static getPurchaseOrder(poId: number): PurchaseOrder {
    const order = StorageEngine.getPurchaseOrdersRaw().find((o) => o.id_orden_compra === poId)
    if (!order) {
      throw new Error(`Orden de compra con ID ${poId} no encontrada`)
    }
    return order
  }

  public static createPurchaseOrder(data: PurchaseOrderCreate): PurchaseOrder {
    const products = StorageEngine.getProductsRaw()
    const providers = StorageEngine.getProvidersRaw()
    const provider = providers.find((p) => p.id_proveedor === data.id_proveedor)

    for (const d of data.detalles) {
      const prod = products.find((p) => p.id_producto === d.id_producto && p.activo !== false)
      if (!prod) {
        throw new Error(`Producto con ID ${d.id_producto} no encontrado`)
      }
      if (!d.cantidad_ordenada || d.cantidad_ordenada <= 0) {
        throw new Error(`La cantidad ordenada del producto "${d.descripcion}" debe ser mayor a 0`)
      }
      if (!d.precio_unitario || d.precio_unitario <= 0) {
        throw new Error(`El precio unitario del producto "${d.descripcion}" debe ser mayor a 0`)
      }
    }

    // Validación de la cotización elegida (flujo Compras): la OC se genera sobre una
    // solicitud de abastecimiento con su cotización "seleccionada".
    let numero_solicitud: string | undefined
    let selectedQuotation: ProviderQuotation | undefined
    if (data.id_cotizacion) {
      const quotations = StorageEngine.getProviderQuotationsRaw()
      selectedQuotation = quotations.find((q) => q.id_cotizacion === data.id_cotizacion)
      if (!selectedQuotation) {
        throw new Error(`Cotización con ID ${data.id_cotizacion} no encontrada`)
      }
      // La cotización debe estar seleccionada y pertenecer a una solicitud con 2+ cotizaciones
      if (!selectedQuotation.seleccionada) {
        throw new Error('La cotización no está marcada como seleccionada')
      }
      const requestQuotes = quotations.filter(
        (q) => q.id_solicitud === selectedQuotation!.id_solicitud,
      )
      if (requestQuotes.length < 2) {
        throw new Error('Se requieren al menos dos cotizaciones para generar la orden de compra')
      }
      const request = StorageEngine.getStockRequestsRaw().find(
        (r) => r.id_solicitud === selectedQuotation!.id_solicitud,
      )
      numero_solicitud = request?.numero_solicitud
    }

    const orders = StorageEngine.getPurchaseOrdersRaw()
    const nextId =
      orders.length > 0 ? Math.max(...orders.map((o) => o.id_orden_compra)) + 1 : 1
    const numero_oc = `OC-${String(nextId).padStart(4, '0')}`

    const currentUser = StorageEngine.getCurrentUser()

    const detalles: PurchaseOrderDetail[] = data.detalles.map((d, idx) => {
      const prod = products.find((p) => p.id_producto === d.id_producto)!
      return {
        id_detalle_oc: idx + 1,
        id_producto: d.id_producto,
        descripcion: d.descripcion || prod.nombre,
        cantidad_ordenada: d.cantidad_ordenada,
        cantidad_recibida: 0,
        precio_unitario: d.precio_unitario,
        tiempo_entrega_dias: d.tiempo_entrega_dias,
      }
    })

    const totalOc = data.detalles.reduce(
      (sum, d) => sum + d.cantidad_ordenada * d.precio_unitario,
      0,
    )
    const settings = StorageEngine.getSettings()
    const requiereAprobacion =
      settings.aprobacionOcHabilitada &&
      totalOc >= settings.aprobacionOcMontoMinimo

    const newOrder: PurchaseOrder = {
      id_orden_compra: nextId,
      numero_oc,
      id_proveedor: data.id_proveedor,
      nombre_proveedor: provider?.nombre_empresa || undefined,
      fecha_emision: data.fecha_emision || new Date().toISOString(),
      estado: requiereAprobacion ? 'pendiente_aprobacion' : 'enviada',
      observaciones: data.observaciones?.trim() || undefined,
      id_solicitud: selectedQuotation?.id_solicitud ?? data.id_solicitud,
      numero_solicitud,
      id_cotizacion: selectedQuotation?.id_cotizacion ?? data.id_cotizacion,
      detalles,
    }

    orders.unshift(newOrder)
    StorageEngine.setPurchaseOrdersRaw(orders)

    StorageEngine.recordAuditLog(
      requiereAprobacion ? 'purchase_order_pending_approval' : 'purchase_order_created',
      requiereAprobacion
        ? `La orden de compra ${numero_oc} supera el umbral de aprobación ($${totalOc.toLocaleString('es-CO')}) y queda pendiente de aprobación`
        : `Se creó la orden de compra ${numero_oc}`,
      currentUser,
    )

    return newOrder
  }

  public static markPoTransit(poId: number): PurchaseOrder {
    const orders = StorageEngine.getPurchaseOrdersRaw()
    const index = orders.findIndex((o) => o.id_orden_compra === poId)
    if (index === -1) {
      throw new Error(`Orden de compra con ID ${poId} no encontrada`)
    }
    const order = orders[index]
    if (order.estado !== 'enviada') {
      throw new Error(`La orden de compra ${order.numero_oc} debe estar en estado "enviada" para marcar en tránsito`)
    }
    order.estado = 'en_transito'
    orders[index] = order
    StorageEngine.setPurchaseOrdersRaw(orders)

    StorageEngine.recordAuditLog(
      'purchase_order_in_transit',
      `La orden de compra ${order.numero_oc} está en tránsito`,
      StorageEngine.getCurrentUser(),
    )
    return order
  }

  public static approvePurchaseOrder(
    poId: number,
    aprobar: boolean,
  ): PurchaseOrder {
    const orders = StorageEngine.getPurchaseOrdersRaw()
    const index = orders.findIndex((o) => o.id_orden_compra === poId)
    if (index === -1) {
      throw new Error(`Orden de compra con ID ${poId} no encontrada`)
    }
    const order = orders[index]
    if (order.estado !== 'pendiente_aprobacion') {
      throw new Error(
        `La orden de compra ${order.numero_oc} no está pendiente de aprobación`,
      )
    }

    if (aprobar) {
      order.estado = 'enviada'
      orders[index] = order
      StorageEngine.setPurchaseOrdersRaw(orders)
      StorageEngine.recordAuditLog(
        'purchase_order_approved',
        `La orden de compra ${order.numero_oc} fue aprobada`,
        StorageEngine.getCurrentUser(),
      )
    } else {
      order.estado = 'rechazada'
      orders[index] = order
      StorageEngine.setPurchaseOrdersRaw(orders)
      StorageEngine.recordAuditLog(
        'purchase_order_rejected',
        `La orden de compra ${order.numero_oc} fue rechazada`,
        StorageEngine.getCurrentUser(),
      )
    }

    return order
  }

  public static getPurchaseOrdersPendingApproval(): PurchaseOrder[] {
    return StorageEngine.getPurchaseOrdersRaw().filter(
      (o) => o.estado === 'pendiente_aprobacion',
    )
  }

  public static receiveAgainstPo(
    poId: number,
    data: { product_id: number; quantity: number; fecha?: string; note?: string },
  ): PurchaseOrder {
    const orders = StorageEngine.getPurchaseOrdersRaw()
    const index = orders.findIndex((o) => o.id_orden_compra === poId)
    if (index === -1) {
      throw new Error(`Orden de compra con ID ${poId} no encontrada`)
    }

    const order = orders[index]
    if (order.estado !== 'en_transito') {
      throw new Error(`La orden de compra ${order.numero_oc} debe estar en tránsito para registrar la entrada`)
    }

    if (!data.quantity || data.quantity <= 0) {
      throw new Error('La cantidad a recibir debe ser mayor a 0')
    }

    const detail = order.detalles.find((d) => d.id_producto === data.product_id)
    if (!detail) {
      throw new Error(`El producto con ID ${data.product_id} no pertenece a la orden ${order.numero_oc}`)
    }

    const nuevoRecibido = detail.cantidad_recibida + data.quantity
    if (nuevoRecibido > detail.cantidad_ordenada) {
      throw new Error(
        `No se puede recibir más de lo ordenado para "${detail.descripcion}". Ordenado: ${detail.cantidad_ordenada}, recibido: ${detail.cantidad_recibida}, solicitado: ${data.quantity}`,
      )
    }

    // Registrar la entrada de inventario (stock + movimiento) con fecha manual
    const currentUser = StorageEngine.getCurrentUser()
    StorageEngine.createEntry({
      product_id: data.product_id,
      quantity: data.quantity,
      reference: order.numero_oc,
      note: data.note?.trim() || `Recepción de mercancía de la orden ${order.numero_oc}`,
      fecha: data.fecha,
    })

    detail.cantidad_recibida = nuevoRecibido
    const allReceived = order.detalles.every((d) => d.cantidad_recibida >= d.cantidad_ordenada)
    if (allReceived) {
      order.estado = 'recibida'
    }

    orders[index] = order
    StorageEngine.setPurchaseOrdersRaw(orders)

    StorageEngine.recordAuditLog(
      'purchase_order_received',
      `Se recibió mercancía (${data.quantity}) en la orden ${order.numero_oc}`,
      currentUser,
    )

    return order
  }

  // ----------------------------------------------------
  // STOCK REQUESTS (Solicitudes de abastecimiento)
  // ----------------------------------------------------
  public static getStockRequestsRaw(): StockRequest[] {
    const raw = localStorage.getItem(KEYS.STOCK_REQUESTS)
    if (!raw) return []
    try {
      return JSON.parse(raw) as StockRequest[]
    } catch {
      return []
    }
  }

  public static setStockRequestsRaw(requests: StockRequest[]): void {
    localStorage.setItem(KEYS.STOCK_REQUESTS, JSON.stringify(requests))
  }

  public static getStockRequests(
    skip = 0,
    limit = 50,
    estado?: string,
  ): StockRequestListResponse {
    let items = StorageEngine.getStockRequestsRaw()
    if (estado) {
      const estados = estado.split(',').map((s) => s.trim())
      items = items.filter((r) => estados.includes(r.estado))
    }
    const total = items.length
    const sliced = items.slice(skip, skip + limit)
    return { items: sliced, total, skip, limit }
  }

  public static getStockRequest(requestId: number): StockRequest {
    const request = StorageEngine.getStockRequestsRaw().find((r) => r.id_solicitud === requestId)
    if (!request) {
      throw new Error(`Solicitud de abastecimiento con ID ${requestId} no encontrada`)
    }
    return request
  }

  public static createStockRequest(data: StockRequestCreate): StockRequest {
    if (!data.cantidad_sugerida || data.cantidad_sugerida <= 0) {
      throw new Error('La cantidad sugerida debe ser mayor a 0')
    }

    const products = StorageEngine.getProductsRaw()
    const product = products.find(
      (p) => p.id_producto === data.id_producto && p.activo !== false,
    )
    if (!product) {
      throw new Error(`Producto con ID ${data.id_producto} no encontrado`)
    }
    if (!product.low_stock) {
      throw new Error(`El producto "${product.nombre}" no está en stock bajo`)
    }

    const requests = StorageEngine.getStockRequestsRaw()
    const nextId =
      requests.length > 0 ? Math.max(...requests.map((r) => r.id_solicitud)) + 1 : 1
    const numero_solicitud = `SOL-${String(nextId).padStart(4, '0')}`
    const currentUser = StorageEngine.getCurrentUser()

    const newRequest: StockRequest = {
      id_solicitud: nextId,
      numero_solicitud,
      id_producto: product.id_producto,
      descripcion: product.nombre,
      cantidad_sugerida: data.cantidad_sugerida,
      stock_actual: product.stock_actual,
      stock_minimo: product.stock_minimo,
      estado: 'pendiente',
      fecha: new Date().toISOString(),
      id_usuario: currentUser.id_usuario,
      nombre_usuario: currentUser.nombre,
      observaciones: data.observaciones?.trim() || undefined,
    }

    requests.unshift(newRequest)
    StorageEngine.setStockRequestsRaw(requests)

    StorageEngine.recordAuditLog(
      'stock_request_created',
      `Bodega generó la solicitud de abastecimiento ${numero_solicitud} para "${product.nombre}"`,
      currentUser,
    )

    return newRequest
  }

  public static updateStockRequestStatus(
    requestId: number,
    estado: StockRequestStatus,
    observaciones?: string,
  ): StockRequest {
    const requests = StorageEngine.getStockRequestsRaw()
    const index = requests.findIndex((r) => r.id_solicitud === requestId)
    if (index === -1) {
      throw new Error(`Solicitud de abastecimiento con ID ${requestId} no encontrada`)
    }

    const current = requests[index]
    current.estado = estado
    if (observaciones !== undefined) {
      current.observaciones = observaciones.trim() || current.observaciones
    }
    requests[index] = current
    StorageEngine.setStockRequestsRaw(requests)

    StorageEngine.recordAuditLog(
      'stock_request_updated',
      `La solicitud ${current.numero_solicitud} cambió a estado "${estado}"`,
      StorageEngine.getCurrentUser(),
    )

    return current
  }

  // ----------------------------------------------------
  // PROVIDER QUOTATIONS (Cotizaciones de proveedores)
  // ----------------------------------------------------
  public static getProviderQuotationsRaw(): ProviderQuotation[] {
    const raw = localStorage.getItem(KEYS.PROVIDER_QUOTATIONS)
    if (!raw) return []
    try {
      return JSON.parse(raw) as ProviderQuotation[]
    } catch {
      return []
    }
  }

  public static setProviderQuotationsRaw(quotations: ProviderQuotation[]): void {
    localStorage.setItem(KEYS.PROVIDER_QUOTATIONS, JSON.stringify(quotations))
  }

  public static getProviderQuotations(
    skip = 0,
    limit = 50,
    id_solicitud?: number,
  ): ProviderQuotationListResponse {
    let items = StorageEngine.getProviderQuotationsRaw()
    if (id_solicitud !== undefined) {
      items = items.filter((q) => q.id_solicitud === id_solicitud)
    }
    const total = items.length
    const sliced = items.slice(skip, skip + limit)
    return { items: sliced, total, skip, limit }
  }

  public static getProviderQuotation(quotationId: number): ProviderQuotation {
    const quotation = StorageEngine.getProviderQuotationsRaw().find(
      (q) => q.id_cotizacion === quotationId,
    )
    if (!quotation) {
      throw new Error(`Cotización con ID ${quotationId} no encontrada`)
    }
    return quotation
  }

  public static createProviderQuotation(data: ProviderQuotationCreate): ProviderQuotation {
    const requests = StorageEngine.getStockRequestsRaw()
    const request = requests.find((r) => r.id_solicitud === data.id_solicitud)
    if (!request) {
      throw new Error(`Solicitud de abastecimiento con ID ${data.id_solicitud} no encontrada`)
    }

    const products = StorageEngine.getProductsRaw()
    const product = products.find(
      (p) => p.id_producto === data.id_producto && p.activo !== false,
    )
    if (!product) {
      throw new Error(`Producto con ID ${data.id_producto} no encontrado`)
    }
    if (product.id_producto !== request.id_producto) {
      throw new Error('El producto de la cotización no corresponde a la solicitud')
    }

    const providers = StorageEngine.getProvidersRaw()
    const provider = providers.find((p) => p.id_proveedor === data.id_proveedor)
    if (!provider) {
      throw new Error(`Proveedor con ID ${data.id_proveedor} no encontrado`)
    }

    if (!data.precio_unitario || data.precio_unitario <= 0) {
      throw new Error('El precio unitario debe ser mayor a 0')
    }
    if (!data.tiempo_entrega_dias || data.tiempo_entrega_dias <= 0) {
      throw new Error('El tiempo de entrega debe ser mayor a 0')
    }

    const quotations = StorageEngine.getProviderQuotationsRaw()
    const nextId =
      quotations.length > 0 ? Math.max(...quotations.map((q) => q.id_cotizacion)) + 1 : 1
    const numero_cotizacion = `COT-${String(nextId).padStart(4, '0')}`
    const currentUser = StorageEngine.getCurrentUser()

    const newQuotation: ProviderQuotation = {
      id_cotizacion: nextId,
      numero_cotizacion,
      id_solicitud: request.id_solicitud,
      id_producto: request.id_producto,
      id_proveedor: provider.id_proveedor,
      nombre_proveedor: provider.nombre_empresa,
      precio_unitario: data.precio_unitario,
      tiempo_entrega_dias: data.tiempo_entrega_dias,
      condiciones: data.condiciones?.trim() || undefined,
      fecha: new Date().toISOString(),
      seleccionada: false,
    }

    quotations.unshift(newQuotation)
    StorageEngine.setProviderQuotationsRaw(quotations)

    StorageEngine.recordAuditLog(
      'provider_quotation_created',
      `Se registró la cotización ${numero_cotizacion} de "${provider.nombre_empresa}" para la solicitud ${request.numero_solicitud}`,
      currentUser,
    )

    return newQuotation
  }

  public static selectProviderQuotation(quotationId: number): ProviderQuotation {
    const quotations = StorageEngine.getProviderQuotationsRaw()
    const target = quotations.find((q) => q.id_cotizacion === quotationId)
    if (!target) {
      throw new Error(`Cotización con ID ${quotationId} no encontrada`)
    }

    const requestQuotes = quotations.filter((q) => q.id_solicitud === target.id_solicitud)
    if (requestQuotes.length < 2) {
      throw new Error('Se requieren al menos dos cotizaciones para elegir el mejor proveedor')
    }

    if (quotations.some((q) => q.id_solicitud === target.id_solicitud && q.seleccionada)) {
      throw new Error('Esta solicitud ya tiene una cotización seleccionada')
    }

    let updated: ProviderQuotation | undefined
    const next = quotations.map((q) => {
      if (q.id_cotizacion === quotationId) {
        q.seleccionada = true
        updated = q
      }
      return q
    })
    StorageEngine.setProviderQuotationsRaw(next)

    StorageEngine.recordAuditLog(
      'provider_quotation_selected',
      `Se seleccionó la cotización ${target.numero_cotizacion} de "${target.nombre_proveedor}" para la solicitud ${target.id_solicitud}`,
      StorageEngine.getCurrentUser(),
    )

    return updated!
  }

  // ----------------------------------------------------
  // REPORTS (Reporte de gasto por proveedor y tiempos de entrega)
  // ----------------------------------------------------
  public static getProviderExpenseReport(): Array<{
    id_proveedor: number
    nombre_proveedor: string
    gasto_total: number
    numero_oc: number
  }> {
    const orders = StorageEngine.getPurchaseOrdersRaw()
    const byProvider = new Map<number, { nombre_proveedor: string; gasto_total: number; numero_oc: number }>()

    for (const order of orders) {
      let gasto = 0
      for (const d of order.detalles) {
        gasto += d.cantidad_recibida * d.precio_unitario
      }
      const existing = byProvider.get(order.id_proveedor)
      if (existing) {
        existing.gasto_total += gasto
        existing.numero_oc += 1
      } else {
        byProvider.set(order.id_proveedor, {
          nombre_proveedor: order.nombre_proveedor || `Proveedor ${order.id_proveedor}`,
          gasto_total: gasto,
          numero_oc: gasto > 0 ? 1 : 0,
        })
      }
    }

    return Array.from(byProvider.entries())
      .map(([id_proveedor, value]) => ({
        id_proveedor,
        nombre_proveedor: value.nombre_proveedor,
        gasto_total: value.gasto_total,
        numero_oc: value.numero_oc,
      }))
      .sort((a, b) => b.gasto_total - a.gasto_total)
  }

  public static getProviderDeliveryReport(): Array<{
    id_proveedor: number
    nombre_proveedor: string
    tiempo_promedio_dias: number
    cotizaciones: number
  }> {
    const quotations = StorageEngine.getProviderQuotationsRaw()
    const orders = StorageEngine.getPurchaseOrdersRaw()
    const byProvider = new Map<number, { nombre_proveedor: string; total_dias: number; count: number }>()

    for (const q of quotations) {
      const existing = byProvider.get(q.id_proveedor)
      if (existing) {
        existing.total_dias += q.tiempo_entrega_dias
        existing.count += 1
      } else {
        byProvider.set(q.id_proveedor, {
          nombre_proveedor: q.nombre_proveedor || `Proveedor ${q.id_proveedor}`,
          total_dias: q.tiempo_entrega_dias,
          count: 1,
        })
      }
    }

    // Sumar tiempos de las órdenes de compra (fuente complementaria)
    for (const order of orders) {
      const dias = order.detalles.reduce(
        (acc, d) => acc + (d.tiempo_entrega_dias || 0),
        0,
      )
      const numDetalles = order.detalles.length || 1
      if (dias > 0) {
        const existing = byProvider.get(order.id_proveedor)
        const prom = dias / numDetalles
        if (existing) {
          existing.total_dias += prom
          existing.count += 1
        } else {
          byProvider.set(order.id_proveedor, {
            nombre_proveedor: order.nombre_proveedor || `Proveedor ${order.id_proveedor}`,
            total_dias: prom,
            count: 1,
          })
        }
      }
    }

    return Array.from(byProvider.entries())
      .map(([id_proveedor, value]) => ({
        id_proveedor,
        nombre_proveedor: value.nombre_proveedor,
        tiempo_promedio_dias: value.count > 0 ? value.total_dias / value.count : 0,
        cotizaciones: value.count,
      }))
      .sort((a, b) => a.tiempo_promedio_dias - b.tiempo_promedio_dias)
  }

  // ----------------------------------------------------
  // DASHBOARD KPIs
  // ----------------------------------------------------
  public static getDashboardKpis(): {
    ventasDelMes: number
    totalVentas: number
    cotizacionesPendientes: number
    stockCritico: number
    comprasPendientes: number
    aprobacionesPendientes: number
  } {
    const sales = StorageEngine.getSalesRaw()
    const quotations = StorageEngine.getQuotationsRaw()
    const products = StorageEngine.getProductsRaw()
    const orders = StorageEngine.getPurchaseOrdersRaw()

    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    const ventasDelMes = sales
      .filter((s) => {
        const d = new Date(s.fecha_venta)
        return d.getMonth() === month && d.getFullYear() === year && s.estado !== 'cancelada'
      })
      .reduce((sum, s) => sum + s.total, 0)

    const totalVentas = sales
      .filter((s) => s.estado !== 'cancelada')
      .reduce((sum, s) => sum + s.total, 0)

    const cotizacionesPendientes = quotations.filter(
      (q) => q.estado === 'enviada',
    ).length

    const stockCritico = products.filter((p) => p.low_stock === true).length

    const comprasPendientes = orders.filter(
      (o) =>
        o.estado === 'enviada' ||
        o.estado === 'en_transito' ||
        o.estado === 'pendiente_aprobacion',
    ).length

    const aprobacionesPendientes = orders.filter(
      (o) => o.estado === 'pendiente_aprobacion',
    ).length

    return {
      ventasDelMes,
      totalVentas,
      cotizacionesPendientes,
      stockCritico,
      comprasPendientes,
      aprobacionesPendientes,
    }
  }

  public static getSalesBySellerReport(): Array<{
    id_usuario: number
    vendedor: string
    total: number
    ventas: number
  }> {
    const sales = StorageEngine.getSalesRaw()
    const users = StorageEngine.getUsersRaw()
    const bySeller = new Map<number, { total: number; ventas: number }>()

    for (const sale of sales) {
      if (sale.estado === 'cancelada') continue
      const existing = bySeller.get(sale.id_usuario)
      if (existing) {
        existing.total += sale.total
        existing.ventas += 1
      } else {
        bySeller.set(sale.id_usuario, { total: sale.total, ventas: 1 })
      }
    }

    return Array.from(bySeller.entries())
      .map(([id_usuario, value]) => {
        const user = users.find((u) => u.id_usuario === id_usuario)
        return {
          id_usuario,
          vendedor: user ? user.nombre : `Usuario ${id_usuario}`,
          total: value.total,
          ventas: value.ventas,
        }
      })
      .sort((a, b) => b.total - a.total)
  }

  public static getSalesMonthlyTrend(): Array<{
    mes: string
    total: number
  }> {
    const sales = StorageEngine.getSalesRaw()
    const byMonth = new Map<string, number>()

    for (const sale of sales) {
      if (sale.estado === 'cancelada') continue
      const d = new Date(sale.fecha_venta)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      byMonth.set(key, (byMonth.get(key) || 0) + sale.total)
    }

    return Array.from(byMonth.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([mes, total]) => ({ mes, total }))
  }

  public static getInventoryValuationReport(): {
    valorTotal: number
    porProducto: Array<{
      id_producto: number
      nombre: string
      stock_actual: number
      precio_unitario: number
      valor: number
    }>
  } {
    const products = StorageEngine.getProductsRaw()
    const porProducto = products
      .map((p) => {
        const valor = p.stock_actual * p.precio_unitario
        return {
          id_producto: p.id_producto,
          nombre: p.nombre,
          stock_actual: p.stock_actual,
          precio_unitario: p.precio_unitario,
          valor,
        }
      })
      .sort((a, b) => b.valor - a.valor)

    const valorTotal = porProducto.reduce((sum, p) => sum + p.valor, 0)

    return { valorTotal, porProducto }
  }
}

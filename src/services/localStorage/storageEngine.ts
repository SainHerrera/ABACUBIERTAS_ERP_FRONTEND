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
  QuotationCreate,
  QuotationUpdate,
  QuotationEstadoUpdate,
  QuotationListResponse,
  Sale,
  SaleCreate,
  SaleUpdate,
  SaleListResponse,
} from '../../types/sales'
import {
  SEED_USERS,
  SEED_PROVIDERS,
  SEED_PRODUCTS,
  SEED_MOVEMENTS,
  SEED_CLIENTS,
  SEED_QUOTATIONS,
  SEED_SALES,
} from './seedData'

const KEYS = {
  USERS: 'abacubiertas_users',
  PRODUCTS: 'abacubiertas_products',
  MOVEMENTS: 'abacubiertas_movements',
  PROVIDERS: 'abacubiertas_providers',
  CLIENTS: 'abacubiertas_clients',
  QUOTATIONS: 'abacubiertas_quotations',
  SALES: 'abacubiertas_sales',
  INITIALIZED: 'abacubiertas_initialized',
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
    return safeJsonParse<User[]>(localStorage.getItem(KEYS.USERS), SEED_USERS)
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

  private static getCurrentUser(): User {
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        const payloadStr = token.split('.')[1]
        if (payloadStr) {
          const payload = JSON.parse(atob(payloadStr))
          return {
            id_usuario: payload.id || 1,
            email: payload.sub || 'admin@test.com',
            nombre: payload.nombre || 'Administrador ERP',
            rol: payload.rol || 'admin',
            activo: true,
            creado_en: new Date().toISOString(),
          }
        }
      } catch {
        // fallback to default admin
      }
    }
    return SEED_USERS[0]
  }

  private static createMockToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(
      JSON.stringify({
        sub: user.email,
        id: user.id_usuario,
        rol: user.rol,
        nombre: user.nombre,
        exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 7,
      }),
    )
    const signature = btoa('mock_signature_for_local_storage')
    return `${header}.${payload}.${signature}`
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
      fecha: new Date().toISOString(),
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
      fecha: new Date().toISOString(),
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
      fecha: new Date().toISOString(),
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

    const subtotal = (data.detalles || []).reduce(
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
      detalles: data.detalles || [],
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
    if (data.detalles !== undefined) current.detalles = data.detalles

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
    const products = StorageEngine.getProductsRaw()

    // 1. Verify sufficient stock for all items
    for (const detail of data.detalles) {
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
    const currentUser = StorageEngine.getCurrentUser()
    const movements = StorageEngine.getMovementsRaw()
    const sales = StorageEngine.getSalesRaw()
    const nextSaleId =
      sales.length > 0 ? Math.max(...sales.map((s) => s.id_orden_venta)) + 1 : 1
    const orderNumber = `PED-${String(nextSaleId).padStart(4, '0')}`

    for (const detail of data.detalles) {
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
          referencia: orderNumber,
          id_usuario: currentUser.id_usuario,
          nombre_usuario: currentUser.nombre,
          fecha: new Date().toISOString(),
          nota: `Despacho automático por pedido ${orderNumber}`,
        })
      }
    }

    StorageEngine.setProductsRaw(products)
    StorageEngine.setMovementsRaw(movements)

    const total = data.detalles.reduce(
      (sum, d) => sum + (d.subtotal || d.cantidad * d.precio_unitario - (d.descuento || 0)),
      0,
    )

    const newSale: Sale = {
      id_orden_venta: nextSaleId,
      numero_orden: orderNumber,
      id_cliente: data.id_cliente,
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
          nota: `Restauración de stock por cancelación de pedido ${sale.numero_orden}`,
        })
      }
    }

    StorageEngine.setProductsRaw(products)
    StorageEngine.setMovementsRaw(movements)

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
    let user = users.find((u) => u.email.toLowerCase() === email && u.activo !== false)

    if (!user) {
      // If user logging in is one of default test accounts, create it
      const seedMatch = SEED_USERS.find((u) => u.email.toLowerCase() === email)
      if (seedMatch) {
        user = seedMatch
        users.push(user)
        StorageEngine.setUsersRaw(users)
      } else {
        // Fallback create admin if logging in with test credentials
        user = {
          id_usuario: users.length + 1,
          email: data.email,
          nombre: data.email.split('@')[0],
          rol: 'admin',
          activo: true,
          creado_en: new Date().toISOString(),
        }
        users.push(user)
        StorageEngine.setUsersRaw(users)
      }
    }

    const accessToken = StorageEngine.createMockToken(user)
    const refreshToken = `mock_refresh_${user.id_usuario}_${Date.now()}`

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
    }
  }

  public static register(data: RegisterRequest): User {
    const users = StorageEngine.getUsersRaw()
    const email = data.email.trim().toLowerCase()

    const exists = users.some((u) => u.email.toLowerCase() === email && u.activo !== false)
    if (exists) {
      throw new Error(`El correo ${data.email} ya se encuentra registrado`)
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
    }

    users.push(newUser)
    StorageEngine.setUsersRaw(users)

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
    const users = StorageEngine.getUsersRaw().filter((u) => u.activo !== false)
    return users.slice(skip, skip + limit)
  }

  public static getUser(userId: number): User {
    const users = StorageEngine.getUsersRaw()
    const user = users.find((u) => u.id_usuario === userId && u.activo !== false)
    if (!user) {
      throw new Error(`Usuario con ID ${userId} no encontrado`)
    }
    return user
  }

  public static updateUser(userId: number, data: UserUpdateRequest): User {
    const users = StorageEngine.getUsersRaw()
    const index = users.findIndex((u) => u.id_usuario === userId && u.activo !== false)
    if (index === -1) {
      throw new Error(`Usuario con ID ${userId} no encontrado`)
    }

    const current = users[index]
    if (data.nombre !== undefined) current.nombre = data.nombre.trim()
    if (data.rol !== undefined) current.rol = data.rol
    if (data.activo !== undefined) current.activo = data.activo

    users[index] = current
    StorageEngine.setUsersRaw(users)

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
  }
}

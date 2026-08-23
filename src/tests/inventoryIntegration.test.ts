import { describe, it, expect, beforeEach } from 'vitest'
import {
  getProductsApi,
  getProductApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from '../api/productApi'
import {
  getMovementsApi,
  createEntryApi,
  createOutputApi,
  createAdjustmentApi,
} from '../api/movementApi'
import {
  getProvidersApi,
  getProviderApi,
  createProviderApi,
  updateProviderApi,
  deleteProviderApi,
} from '../api/providerApi'
import { loginApi } from '../api/authApi'
import { StorageEngine } from '../services/localStorage/storageEngine'

describe('INTEGRATION TEST INVENTORY - Frontend Full Flow with LocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
  })

  describe('1. InventoryDashboardPage Flow (/inventory)', () => {
    it('should load products, movements, and providers to calculate dashboard metrics and low stock alerts', async () => {
      const [productsRes, providersRes, movementsRes] = await Promise.all([
        getProductsApi(0, 1000),
        getProvidersApi(0, 1000),
        getMovementsApi(0, 10),
      ])

      expect(productsRes.items.length).toBeGreaterThan(0)
      expect(providersRes.items.length).toBeGreaterThan(0)
      expect(movementsRes.items.length).toBeGreaterThan(0)

      const lowStockList = productsRes.items.filter((p) => p.low_stock)
      expect(lowStockList.length).toBeGreaterThan(0)

      // Verify that every product with low_stock has stock_actual <= stock_minimo
      lowStockList.forEach((p) => {
        expect(p.stock_actual).toBeLessThanOrEqual(p.stock_minimo)
        expect(p.status).toBe('low')
      })

      // Verify recent movements
      expect(movementsRes.items[0]).toHaveProperty('nombre_producto')
      expect(movementsRes.items[0]).toHaveProperty('tipo')
      expect(movementsRes.items[0]).toHaveProperty('cantidad')
    })
  })

  describe('2. ProductsPage Flow (/inventory/products)', () => {
    it('should create, list, search, edit, and delete products with persistence in localStorage', async () => {
      // 1. Initial product count
      const initial = await getProductsApi(0, 1000)
      const initialCount = initial.total

      // 2. Create new product
      const newProduct = await createProductApi({
        nombre: 'Caballete Esmaltado Color Gris 2m',
        descripcion: 'Remate de cubierta galvanizado prepintado',
        unidad_medida: 'unidad',
        precio_unitario: 42000,
        stock_inicial: 15,
        stock_minimo: 20,
      })

      expect(newProduct.id_producto).toBeDefined()
      expect(newProduct.nombre).toBe('Caballete Esmaltado Color Gris 2m')
      expect(newProduct.stock_actual).toBe(15)
      expect(newProduct.stock_minimo).toBe(20)
      expect(newProduct.low_stock).toBe(true) // 15 <= 20
      expect(newProduct.status).toBe('low')

      // 3. List should be updated
      const afterCreate = await getProductsApi(0, 1000)
      expect(afterCreate.total).toBe(initialCount + 1)
      expect(afterCreate.items.some((p) => p.id_producto === newProduct.id_producto)).toBe(true)

      // 4. Search by name
      const searchRes = await getProductsApi(0, 10, 'Esmaltado')
      expect(searchRes.items.length).toBeGreaterThanOrEqual(1)
      expect(searchRes.items.some((p) => p.id_producto === newProduct.id_producto)).toBe(true)

      // 5. Edit product
      const updated = await updateProductApi(newProduct.id_producto, {
        precio_unitario: 45000,
        stock_minimo: 10, // 15 > 10 => should become normal
      })

      expect(updated.precio_unitario).toBe(45000)
      expect(updated.stock_minimo).toBe(10)
      expect(updated.low_stock).toBe(false)
      expect(updated.status).toBe('normal')

      // 6. Delete product
      await deleteProductApi(newProduct.id_producto)
      const afterDelete = await getProductsApi(0, 1000)
      expect(afterDelete.items.some((p) => p.id_producto === newProduct.id_producto)).toBe(false)
    })
  })

  describe('3. MovementsPage Flow (/inventory/movements)', () => {
    it('should register entry, output (with stock validation), and adjustment movements', async () => {
      // 1. Create a base product
      const product = await createProductApi({
        nombre: 'Perfil Estructural 80x40',
        unidad_medida: 'unidad',
        precio_unitario: 55000,
        stock_inicial: 50,
        stock_minimo: 20,
      })
      expect(product.stock_actual).toBe(50)

      // 2. Register an Entry (+30) -> stock becomes 80
      const entryMov = await createEntryApi({
        product_id: product.id_producto,
        quantity: 30,
        reference: 'FACT-10023',
        note: 'Ingreso lote adicional',
      })
      expect(entryMov.tipo).toBe('entrada')
      expect(entryMov.cantidad).toBe(30)

      const prodAfterEntry = await getProductApi(product.id_producto)
      expect(prodAfterEntry.stock_actual).toBe(80)
      expect(prodAfterEntry.low_stock).toBe(false)

      // 3. Register an Output (-25) -> stock becomes 55
      const outMov = await createOutputApi({
        product_id: product.id_producto,
        quantity: 25,
        reference: 'REM-4001',
        note: 'Entrega en sitio de obra',
      })
      expect(outMov.tipo).toBe('salida')
      expect(outMov.cantidad).toBe(25)

      const prodAfterOutput = await getProductApi(product.id_producto)
      expect(prodAfterOutput.stock_actual).toBe(55)

      // 4. Validate output with insufficient stock: trying to withdraw 100 should throw Error
      await expect(
        createOutputApi({
          product_id: product.id_producto,
          quantity: 100,
          reference: 'FAIL-DRAIN',
        }),
      ).rejects.toThrow(/Stock insuficiente/)

      // Stock should remain untouched at 55
      const prodCheck = await getProductApi(product.id_producto)
      expect(prodCheck.stock_actual).toBe(55)

      // 5. Register an Adjustment to exact quantity 15 -> stock becomes 15 (and low_stock triggers because 15 <= 20)
      const adjMov = await createAdjustmentApi({
        product_id: product.id_producto,
        quantity: 15,
        reference: 'AUDIT-2026',
        note: 'Ajuste tras conteo físico',
      })
      expect(adjMov.tipo).toBe('ajuste')
      expect(adjMov.cantidad).toBe(15)

      const prodAfterAdj = await getProductApi(product.id_producto)
      expect(prodAfterAdj.stock_actual).toBe(15)
      expect(prodAfterAdj.low_stock).toBe(true)
      expect(prodAfterAdj.status).toBe('low')

      // 6. Filter movements history for this product
      const productMovements = await getMovementsApi(0, 100, product.id_producto)
      expect(productMovements.items.length).toBeGreaterThanOrEqual(4) // Initial + Entry + Output + Adjustment
      expect(productMovements.items.every((m) => m.id_producto === product.id_producto)).toBe(true)
    })
  })

  describe('4. ProductDetailPage Flow (/inventory/products/:id)', () => {
    it('should load product details, associate provider, and track movement history', async () => {
      // 1. Create a provider first
      const provider = await createProviderApi({
        nombre_empresa: 'Tornillería Especializada S.A.S.',
        nit: '901234567-8',
        contacto: 'Marta Rincón',
        categoria_material: 'tornilleria',
      })

      // 2. Create product assigned to this provider
      const product = await createProductApi({
        nombre: 'Tornillo Hexagonal 3 pulgadas',
        unidad_medida: 'caja',
        precio_unitario: 35000,
        stock_inicial: 20,
        stock_minimo: 10,
        id_proveedor: provider.id_proveedor,
      })

      // 3. Load product detail
      const loadedProduct = await getProductApi(product.id_producto)
      expect(loadedProduct.id_producto).toBe(product.id_producto)
      expect(loadedProduct.nombre).toBe('Tornillo Hexagonal 3 pulgadas')
      expect(loadedProduct.nombre_proveedor).toBe('Tornillería Especializada S.A.S.')

      // 4. Update product from detail
      const updatedProduct = await updateProductApi(product.id_producto, {
        precio_unitario: 38000,
        descripcion: 'Tornillos hexagonales galvanizados de grado 5',
      })
      expect(updatedProduct.precio_unitario).toBe(38000)
      expect(updatedProduct.descripcion).toBe('Tornillos hexagonales galvanizados de grado 5')

      // 5. Verify movements for product
      const movements = await getMovementsApi(0, 50, product.id_producto)
      expect(movements.items.length).toBeGreaterThanOrEqual(1)
      expect(movements.items[0].id_producto).toBe(product.id_producto)
    })
  })

  describe('5. Providers Management Flow (/inventory/providers)', () => {
    it('should create, list, filter, update and delete providers', async () => {
      const newProvider = await createProviderApi({
        nombre_empresa: 'Vidrios y Aluminios Industriales',
        nit: '811222333-5',
        contacto: 'Roberto Gómez',
        telefono: '3161112233',
        email: 'ventas@vidriosyaluminios.co',
        ciudad: 'Medellín',
        categoria_material: 'cubiertas',
      })

      expect(newProvider.id_proveedor).toBeDefined()
      expect(newProvider.nit).toBe('811222333-5')

      // List providers
      const list = await getProvidersApi(0, 100, 'Vidrios')
      expect(list.items.some((p) => p.id_proveedor === newProvider.id_proveedor)).toBe(true)

      // Update provider
      const updated = await updateProviderApi(newProvider.id_proveedor, {
        telefono: '3169998877',
      })
      expect(updated.telefono).toBe('3169998877')

      // Delete provider
      await deleteProviderApi(newProvider.id_proveedor)
      await expect(getProviderApi(newProvider.id_proveedor)).rejects.toThrow(/no encontrado/)
    })
  })

  describe('6. Authentication Flow in LocalStorage', () => {
    it('should authenticate user and store token in localStorage', async () => {
      const tokenRes = await loginApi({
        email: 'admin@test.com',
        password: 'Test123!',
      })

      expect(tokenRes.access_token).toBeDefined()
      expect(tokenRes.refresh_token).toBeDefined()

      localStorage.setItem('accessToken', tokenRes.access_token)
      localStorage.setItem('refreshToken', tokenRes.refresh_token)

      expect(localStorage.getItem('accessToken')).toBe(tokenRes.access_token)
    })
  })
})

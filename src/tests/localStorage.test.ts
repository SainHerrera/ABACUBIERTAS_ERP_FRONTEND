import { describe, it, expect, beforeEach } from 'vitest'
import { StorageEngine } from '../services/localStorage/storageEngine'

describe('StorageEngine - Unit & Integration Tests (LocalStorage)', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
  })

  describe('Products Management', () => {
    it('should create a product with stock_inicial and calculate status correctly', () => {
      const product = StorageEngine.createProduct({
        nombre: 'Teja UPVC Especial 3m',
        descripcion: 'Teja de alta resistencia',
        unidad_medida: 'unidad',
        precio_unitario: 95000,
        stock_inicial: 5,
        stock_minimo: 10,
      })

      expect(product.id_producto).toBeDefined()
      expect(product.nombre).toBe('Teja UPVC Especial 3m')
      expect(product.stock_actual).toBe(5)
      expect(product.stock_minimo).toBe(10)
      expect(product.low_stock).toBe(true)
      expect(product.status).toBe('low')

      // Verify that initial movement was automatically created
      const movements = StorageEngine.getMovements(0, 10, product.id_producto)
      expect(movements.total).toBe(1)
      expect(movements.items[0].tipo).toBe('entrada')
      expect(movements.items[0].cantidad).toBe(5)
      expect(movements.items[0].referencia).toBe('INVENTARIO INICIAL')
    })

    it('should throw error when creating duplicate product name', () => {
      StorageEngine.createProduct({
        nombre: 'Producto Repetido',
        stock_minimo: 5,
      })

      expect(() => {
        StorageEngine.createProduct({
          nombre: 'Producto Repetido',
          stock_minimo: 10,
        })
      }).toThrow('Ya existe un producto registrado')
    })

    it('should list products with pagination and search filter', () => {
      StorageEngine.createProduct({ nombre: 'Cubierta Termoacustica Alfa' })
      StorageEngine.createProduct({ nombre: 'Cubierta Termoacustica Beta' })
      StorageEngine.createProduct({ nombre: 'Perfil Omega Galvanizado' })

      const page1 = StorageEngine.getProducts(0, 2)
      expect(page1.items.length).toBe(2)

      const searchResults = StorageEngine.getProducts(0, 50, 'Termoacustica')
      expect(searchResults.items.length).toBeGreaterThanOrEqual(2)
      expect(searchResults.items.every((p) => p.nombre.toLowerCase().includes('termoacustica'))).toBe(true)
    })

    it('should get product by id and throw if not found', () => {
      const created = StorageEngine.createProduct({ nombre: 'Producto Unico ID' })
      const found = StorageEngine.getProduct(created.id_producto)
      expect(found.nombre).toBe('Producto Unico ID')

      expect(() => StorageEngine.getProduct(999999)).toThrow('no encontrado')
    })

    it('should update product fields and recalculate low_stock status', () => {
      const product = StorageEngine.createProduct({
        nombre: 'Producto Para Update',
        precio_unitario: 10000,
        stock_inicial: 15,
        stock_minimo: 10,
      })
      expect(product.low_stock).toBe(false)
      expect(product.status).toBe('normal')

      // Updating stock_minimo to 20 should make it low_stock
      const updated = StorageEngine.updateProduct(product.id_producto, {
        precio_unitario: 12000,
        stock_minimo: 20,
      })

      expect(updated.precio_unitario).toBe(12000)
      expect(updated.stock_minimo).toBe(20)
      expect(updated.stock_actual).toBe(15)
      expect(updated.low_stock).toBe(true)
      expect(updated.status).toBe('low')
    })

    it('should soft delete product if it has movements, or hard delete if not', () => {
      // Product with movements
      const prodWithMov = StorageEngine.createProduct({
        nombre: 'Prod Con Movimientos',
        stock_inicial: 10,
      })
      StorageEngine.deleteProduct(prodWithMov.id_producto)
      expect(() => StorageEngine.getProduct(prodWithMov.id_producto)).toThrow('no encontrado')

      // Product without movements
      const prodNoMov = StorageEngine.createProduct({
        nombre: 'Prod Sin Movimientos',
        stock_inicial: 0,
      })
      StorageEngine.deleteProduct(prodNoMov.id_producto)
      expect(() => StorageEngine.getProduct(prodNoMov.id_producto)).toThrow('no encontrado')
    })
  })

  describe('Movements & Stock Control', () => {
    it('should register entry movement and increase stock_actual', () => {
      const product = StorageEngine.createProduct({
        nombre: 'Prod Entrada Test',
        stock_inicial: 0,
        stock_minimo: 10,
      })
      expect(product.stock_actual).toBe(0)
      expect(product.low_stock).toBe(true)

      const movement = StorageEngine.createEntry({
        product_id: product.id_producto,
        quantity: 50,
        reference: 'OC-TEST-001',
        note: 'Ingreso prueba',
      })

      expect(movement.tipo).toBe('entrada')
      expect(movement.cantidad).toBe(50)

      const updatedProd = StorageEngine.getProduct(product.id_producto)
      expect(updatedProd.stock_actual).toBe(50)
      expect(updatedProd.low_stock).toBe(false)
      expect(updatedProd.status).toBe('normal')
    })

    it('should register output movement and decrease stock_actual', () => {
      const product = StorageEngine.createProduct({
        nombre: 'Prod Salida Test',
        stock_inicial: 100,
        stock_minimo: 10,
      })

      const movement = StorageEngine.createOutput({
        product_id: product.id_producto,
        quantity: 30,
        reference: 'PED-TEST-001',
        note: 'Despacho cliente',
      })

      expect(movement.tipo).toBe('salida')
      expect(movement.cantidad).toBe(30)

      const updatedProd = StorageEngine.getProduct(product.id_producto)
      expect(updatedProd.stock_actual).toBe(70)
    })

    it('should reject output movement when stock is insufficient and never allow negative stock', () => {
      const product = StorageEngine.createProduct({
        nombre: 'Prod Insuficiente Test',
        stock_inicial: 10,
        stock_minimo: 5,
      })

      expect(() => {
        StorageEngine.createOutput({
          product_id: product.id_producto,
          quantity: 25,
          reference: 'FAIL-OUTPUT',
        })
      }).toThrow('Stock insuficiente')

      const updatedProd = StorageEngine.getProduct(product.id_producto)
      expect(updatedProd.stock_actual).toBe(10) // Stock remains unchanged
    })

    it('should register adjustment movement and set exact stock_actual', () => {
      const product = StorageEngine.createProduct({
        nombre: 'Prod Ajuste Test',
        stock_inicial: 50,
        stock_minimo: 20,
      })

      const movement = StorageEngine.createAdjustment({
        product_id: product.id_producto,
        quantity: 80,
        reference: 'CONTEO-FISICO-ANUAL',
      })

      expect(movement.tipo).toBe('ajuste')
      expect(movement.cantidad).toBe(80)

      const updatedProd = StorageEngine.getProduct(product.id_producto)
      expect(updatedProd.stock_actual).toBe(80)
    })

    it('should reject non-positive quantities on entries and outputs', () => {
      const product = StorageEngine.createProduct({
        nombre: 'Prod Validacion Cantidad',
        stock_inicial: 10,
      })

      expect(() => {
        StorageEngine.createEntry({
          product_id: product.id_producto,
          quantity: -5,
        })
      }).toThrow('mayor a 0')

      expect(() => {
        StorageEngine.createOutput({
          product_id: product.id_producto,
          quantity: 0,
        })
      }).toThrow('mayor a 0')
    })
  })

  describe('Providers Management', () => {
    it('should create and retrieve a provider', () => {
      const provider = StorageEngine.createProvider({
        nombre_empresa: 'Proveedor Nuevo S.A.S.',
        nit: '999888777-1',
        contacto: 'Juan Pérez',
        email: 'juan@proveedor.com',
        telefono: '3001234567',
        categoria_material: 'cubiertas',
      })

      expect(provider.id_proveedor).toBeDefined()
      expect(provider.nombre_empresa).toBe('Proveedor Nuevo S.A.S.')
      expect(provider.nit).toBe('999888777-1')

      const found = StorageEngine.getProvider(provider.id_proveedor)
      expect(found.email).toBe('juan@proveedor.com')
    })

    it('should throw error on duplicate NIT', () => {
      StorageEngine.createProvider({
        nombre_empresa: 'Proveedor Uno',
        nit: '123456789-0',
      })

      expect(() => {
        StorageEngine.createProvider({
          nombre_empresa: 'Proveedor Dos',
          nit: '123456789-0',
        })
      }).toThrow('Ya existe un proveedor registrado con el NIT')
    })

    it('should update and soft delete provider', () => {
      const provider = StorageEngine.createProvider({
        nombre_empresa: 'Proveedor Para Borrar',
        nit: '777666555-4',
      })

      const updated = StorageEngine.updateProvider(provider.id_proveedor, {
        ciudad: 'Cali',
      })
      expect(updated.ciudad).toBe('Cali')

      StorageEngine.deleteProvider(provider.id_proveedor)
      expect(() => StorageEngine.getProvider(provider.id_proveedor)).toThrow('no encontrado')
    })
  })

  describe('Authentication and Users', () => {
    it('should login admin and return valid mock JWT tokens', () => {
      const tokens = StorageEngine.login({
        email: 'admin@test.com',
        password: 'Test123!',
      })

      expect(tokens.access_token).toBeDefined()
      expect(tokens.refresh_token).toBeDefined()

      const payload = JSON.parse(atob(tokens.access_token.split('.')[1]))
      expect(payload.sub).toBe('admin@test.com')
      expect(payload.rol).toBe('admin')
    })

    it('should register a new user and prevent duplicates', () => {
      const user = StorageEngine.register({
        email: 'nuevo@empresa.com',
        nombre: 'Nuevo Usuario',
        password: 'Password123!',
        rol: 'ventas',
      })

      expect(user.email).toBe('nuevo@empresa.com')
      expect(user.rol).toBe('ventas')

      expect(() => {
        StorageEngine.register({
          email: 'nuevo@empresa.com',
          nombre: 'Duplicado',
          password: 'Password123!',
        })
      }).toThrow('ya se encuentra registrado')
    })
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getProductsApi,
  getProductApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from '../api/productApi'
import {
  createEntryApi,
  createOutputApi,
  createAdjustmentApi,
} from '../api/movementApi'
import { loginApi } from '../api/authApi'
import { SEED_PASSWORDS } from '../services/localStorage/seedData'

describe('INVENTORY BACKEND - Integration with Real API', () => {
  beforeEach(() => {
    // Limpiar localStorage pero los tests ahora usan el backend real
    localStorage.clear()
  })

  describe('1. Product Management via API', () => {
    it('should create a product via backend API', async () => {
      const product = await createProductApi({
        nombre: 'Producto Backend Test',
        descripcion: 'Producto creado por test de integración backend',
        unidad_medida: 'unidad',
        precio_unitario: 10000,
        stock_inicial: 50,
        stock_minimo: 10,
      })
      expect(product.id_producto).toBeDefined()
      expect(product.nombre).toBe('Producto Backend Test')
      expect(product.stock_actual).toBe(50)
      expect(product.stock_minimo).toBe(10)
      expect(product.low_stock).toBe(false)
      expect(product.status).toBe('normal')
    })

    it('should list products via backend API', async () => {
      const products = await getProductsApi(0, 100)
      expect(products.items.length).toBeGreaterThan(0)
      expect(products.total).toBeGreaterThan(0)
    })

    it('should show low_stock flag correctly via backend', async () => {
      const products = await getProductsApi(0, 100)
      const lowStockList = products.items.filter((p) => p.low_stock)
      // Al menos algunos productos deberían tener low_stock configurado
      lowStockList.forEach((p) => {
        expect(p.stock_actual).toBeLessThanOrEqual(p.stock_minimo)
        expect(p.status).toBe('low')
      })
    })

    it('should update product via backend API', async () => {
      // Primero creamos un producto
      const created = await createProductApi({
        nombre: 'Producto A Actualizar',
        descripcion: 'Antiguo',
        unidad_medida: 'unidad',
        precio_unitario: 5000,
        stock_inicial: 100,
        stock_minimo: 30,
      })

      // Lo actualizamos
      const updated = await updateProductApi(created.id_producto!, {
        precio_unitario: 6000,
        stock_minimo: 15,
      })
      expect(updated.precio_unitario).toBe(6000)
      expect(updated.stock_minimo).toBe(15)
    })

    it('should delete product via backend API', async () => {
      const toDelete = await createProductApi({
        nombre: 'Producto A Eliminar',
        descripcion: 'Test de borrado',
        unidad_medida: 'unidad',
        precio_unitario: 2000,
        stock_inicial: 5,
        stock_minimo: 2,
      })

      await deleteProductApi(toDelete.id_producto!)
      const products = await getProductsApi(0, 100)
      expect(products.items.some((p) => p.id_producto === toDelete.id_producto)).toBe(false)
    })
  })

  describe('2. Movements via Backend API', () => {
    it('should register an entry movement via backend', async () => {
      const product = await createProductApi({
        nombre: 'Producto Movimiento Entrada',
        stock_inicial: 0,
        stock_minimo: 5,
      })

      const movement = await createEntryApi({
        product_id: product.id_producto,
        quantity: 25,
        reference: 'TEST-ENTRADA-001',
        note: 'Test de entrada via backend',
      })

      expect(movement.tipo).toBe('entrada')
      expect(movement.cantidad).toBe(25)

      const prodAfter = await getProductApi(product.id_producto)
      expect(prodAfter.stock_actual).toBe(25)
      expect(prodAfter.low_stock).toBe(false)
    })

    it('should register an output movement with stock validation via backend', async () => {
      const product = await createProductApi({
        nombre: 'Producto Movimiento Salida',
        stock_inicial: 50,
        stock_minimo: 10,
      })

      // Output exitosa (25 de 50)
      const outMov = await createOutputApi({
        product_id: product.id_producto,
        quantity: 25,
        reference: 'TEST-SALIDA-001',
        note: 'Test de salida via backend',
      })
      expect(outMov.tipo).toBe('salida')
      expect(outMov.cantidad).toBe(25)

      const prodAfterOutput = await getProductApi(product.id_producto)
      expect(prodAfterOutput.stock_actual).toBe(25)

      // Output que excede stock debería fallar
      await expect(
        createOutputApi({
          product_id: product.id_producto,
          quantity: 100,
          reference: 'FAIL-DRAIN',
        }),
      ).rejects.toThrow(/Stock insuficiente/)
    })

    it('should register adjustment with mandatory motive via backend', async () => {
      const product = await createProductApi({
        nombre: 'Producto Ajuste Backend',
        stock_inicial: 40,
        stock_minimo: 10,
      })

      // Ajuste sin motivo debe fallar
      await expect(
        createAdjustmentApi({
          product_id: product.id_producto,
          quantity: 30,
        }),
      ).rejects.toThrow('El motivo del ajuste es obligatorio')

      // Stock debería estar unchanged
      const prod = await getProductApi(product.id_producto)
      expect(prod.stock_actual).toBe(40)

      // Ajuste con motivo debería aceptarse
      const adjMov = await createAdjustmentApi({
        product_id: product.id_producto,
        quantity: 35,
        reference: 'CONTEO-BACKEND',
        note: 'Ajuste de prueba backend',
      })
      expect(adjMov.tipo).toBe('ajuste')
      expect(adjMov.cantidad).toBe(35)

      const prodAfterAdj = await getProductApi(product.id_producto)
      expect(prodAfterAdj.stock_actual).toBe(35)
    })
  })

  describe('3. Authentication via Backend API', () => {
    it('should login with seed user via backend API', async () => {
      const tokenRes = await loginApi({
        email: 'admin@test.com',
        password: SEED_PASSWORDS['admin@test.com'],
      })

      expect(tokenRes.access_token).toBeDefined()
      expect(tokenRes.refresh_token).toBeDefined()
    })

    it('should login with ventas user via backend API', async () => {
      const tokenRes = await loginApi({
        email: 'ventas@test.com',
        password: SEED_PASSWORDS['ventas@test.com'],
      })

      expect(tokenRes.access_token).toBeDefined()
      expect(tokenRes.refresh_token).toBeDefined()
    })

    it('should login with bodega user via backend API', async () => {
      const tokenRes = await loginApi({
        email: 'bodega@test.com',
        password: SEED_PASSWORDS['bodega@test.com'],
      })

      expect(tokenRes.access_token).toBeDefined()
      expect(tokenRes.refresh_token).toBeDefined()
    })

    it('should login with compras user via backend API', async () => {
      const tokenRes = await loginApi({
        email: 'compras@test.com',
        password: SEED_PASSWORDS['compras@test.com'],
      })

      expect(tokenRes.access_token).toBeDefined()
      expect(tokenRes.refresh_token).toBeDefined()
    })

    it('should login with gerencia user via backend API', async () => {
      const tokenRes = await loginApi({
        email: 'gerencia@test.com',
        password: SEED_PASSWORDS['gerencia@test.com'],
      })

      expect(tokenRes.access_token).toBeDefined()
      expect(tokenRes.refresh_token).toBeDefined()
    })
  })
})
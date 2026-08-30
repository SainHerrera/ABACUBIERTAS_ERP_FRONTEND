import { describe, it, expect, beforeEach } from 'vitest'
import {
  getProductsApi,
  createProductApi,
} from '../api/productApi'
import {
  createEntryApi,
  createOutputApi,
  createAdjustmentApi,
} from '../api/movementApi'
import { loginApi } from '../api/authApi'
import { SEED_PASSWORDS } from '../services/localStorage/seedData'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { canManageInventory, canAccessSales } from '../utils/permissions'
import type { UserRole } from '../types/auth'

describe('INTEGRATION TEST ACCESO POR ROL - Bodega / Inventario', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
  })

  describe('1. Permisos por rol', () => {
    it.each([
      ['admin', true],
      ['compras', true],
      ['bodega', true],
      ['ventas', false],
      ['gerencia', false],
    ] as [UserRole, boolean][])(
      'canManageInventory(%s) debería ser %s',
      (rol, expected) => {
        expect(canManageInventory(rol)).toBe(expected)
      },
    )

    it.each([
      ['admin', true],
      ['ventas', true],
      ['gerencia', true],
      ['bodega', false],
      ['compras', false],
    ] as [UserRole, boolean][])(
      'canAccessSales(%s) debería ser %s',
      (rol, expected) => {
        expect(canAccessSales(rol)).toBe(expected)
      },
    )

    it('canManageInventory(undefined) debería ser false', () => {
      expect(canManageInventory(undefined)).toBe(false)
    })

    it('canAccessSales(undefined) debería ser false', () => {
      expect(canAccessSales(undefined)).toBe(false)
    })
  })

  describe('2. Bodega gestiona productos', () => {
    it('bodega puede crear un producto y persiste en localStorage', async () => {
      const tokenRes = await loginApi({
        email: 'bodega@test.com',
        password: SEED_PASSWORDS['bodega@test.com'],
      })
      localStorage.setItem('accessToken', tokenRes.access_token)
      localStorage.setItem('refreshToken', tokenRes.refresh_token)

      const newProduct = await createProductApi({
        nombre: 'Caballete Bodega Inventario',
        unidad_medida: 'unidad',
        precio_unitario: 30000,
        stock_inicial: 25,
        stock_minimo: 10,
      })

      expect(newProduct.id_producto).toBeDefined()
      expect(newProduct.stock_actual).toBe(25)

      const stored = JSON.parse(
        localStorage.getItem('abacubiertas_products') || '[]',
      )
      expect(
        stored.some((p: { id_producto: number }) => p.id_producto === newProduct.id_producto),
      ).toBe(true)

      const list = await getProductsApi(0, 1000, 'Caballete Bodega')
      expect(list.items.some((p) => p.id_producto === newProduct.id_producto)).toBe(true)
    })
  })

  describe('3. Bodega registra movimientos', () => {
    it('bodega registra entrada, salida y ajuste con actualización de stock', async () => {
      const tokenRes = await loginApi({
        email: 'bodega@test.com',
        password: SEED_PASSWORDS['bodega@test.com'],
      })
      localStorage.setItem('accessToken', tokenRes.access_token)
      localStorage.setItem('refreshToken', tokenRes.refresh_token)

      const product = await createProductApi({
        nombre: 'Perfil Bodega Ajuste',
        unidad_medida: 'unidad',
        precio_unitario: 50000,
        stock_inicial: 40,
        stock_minimo: 15,
      })

      const entry = await createEntryApi({
        product_id: product.id_producto,
        quantity: 10,
        reference: 'OC-BODEGA-1',
        note: 'Recepción de compra',
      })
      expect(entry.tipo).toBe('entrada')
      expect(entry.cantidad).toBe(10)

      const out = await createOutputApi({
        product_id: product.id_producto,
        quantity: 5,
        reference: 'PED-BODEGA-1',
        note: 'Despacho verificado',
      })
      expect(out.tipo).toBe('salida')
      expect(out.cantidad).toBe(5)

      const adj = await createAdjustmentApi({
        product_id: product.id_producto,
        quantity: 20,
        reference: 'AJUSTE-FISICO',
        note: 'Diferencia por conteo físico',
      })
      expect(adj.tipo).toBe('ajuste')

      const movements = JSON.parse(
        localStorage.getItem('abacubiertas_movements') || '[]',
      )
      const productMovements = movements.filter(
        (m: { id_producto: number }) => m.id_producto === product.id_producto,
      )
      expect(productMovements.length).toBeGreaterThanOrEqual(4) // inicial + entrada + salida + ajuste
      expect(
        productMovements.every(
          (m: { nombre_usuario: string }) => m.nombre_usuario === 'Encargado Bodega',
        ),
      ).toBe(true)
    })
  })

  describe('4. Autenticación de bodega', () => {
    it('el login de bodega guarda el rol bodega en el token', async () => {
      const tokenRes = await loginApi({
        email: 'bodega@test.com',
        password: SEED_PASSWORDS['bodega@test.com'],
      })

      const payload = JSON.parse(atob(tokenRes.access_token.split('.')[1]))
      expect(payload.rol).toBe('bodega')
      expect(payload.email).toBe('bodega@test.com')
    })
  })
})

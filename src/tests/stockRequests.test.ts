import { describe, it, expect, beforeEach } from 'vitest'
import {
  getStockRequestsApi,
  getStockRequestApi,
  createStockRequestApi,
  updateStockRequestStatusApi,
} from '../api/stockRequestApi'
import { getProductApi } from '../api/productApi'
import { StorageEngine } from '../services/localStorage/storageEngine'

describe('STOCK REQUESTS - Solicitudes de abastecimiento (LocalStorage)', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
  })

  describe('1. Seed de solicitudes', () => {
    it('should seed pending stock requests for low-stock products', async () => {
      const res = await getStockRequestsApi(0, 100)
      expect(res.total).toBeGreaterThan(0)

      const first = res.items[0]
      expect(first.estado).toBe('pendiente')
      expect(first.numero_solicitud).toMatch(/^SOL-/)
      // Seeded request references a product that is low stock in the seed
      expect(first.id_producto).toBeGreaterThan(0)
    })
  })

  describe('2. Crear solicitud de abastecimiento', () => {
    it('should create a pending request for a low-stock product and persist it', async () => {
      // Product 2 (Perfil C) is low stock in the seed (stock 8 / min 15)
      const product = await getProductApi(2)
      expect(product.low_stock).toBe(true)

      const request = await createStockRequestApi({
        id_producto: product.id_producto,
        cantidad_sugerida: 15,
        observaciones: 'Reposición urgente',
      })

      expect(request.estado).toBe('pendiente')
      expect(request.numero_solicitud).toMatch(/^SOL-/)
      expect(request.id_producto).toBe(product.id_producto)
      expect(request.cantidad_sugerida).toBe(15)
      expect(request.stock_actual).toBe(product.stock_actual)

      // Persisted in abacubiertas_stock_requests
      const raw: Array<{ numero_solicitud: string; estado: string }> = JSON.parse(
        localStorage.getItem('abacubiertas_stock_requests') || '[]',
      )
      const persisted = raw.find((r) => r.numero_solicitud === request.numero_solicitud)
      expect(persisted).toBeDefined()
      expect(persisted!.estado).toBe('pendiente')
    })

    it('should reject creating a request for a product that is NOT low stock', async () => {
      // Product 1 (Cubierta UPVC) has stock 45 / min 20 -> normal (not low stock)
      const product = await getProductApi(1)
      expect(product.low_stock).toBe(false)

      await expect(
        createStockRequestApi({
          id_producto: product.id_producto,
          cantidad_sugerida: 10,
        }),
      ).rejects.toThrow(/no está en stock bajo/)
    })

    it('should reject creating a request with an invalid suggested quantity', async () => {
      await expect(
        createStockRequestApi({ id_producto: 2, cantidad_sugerida: 0 }),
      ).rejects.toThrow(/mayor a 0/)
    })
  })

  describe('3. Cambiar estado de una solicitud', () => {
    it('should update the status and persist it', async () => {
      const created = await createStockRequestApi({
        id_producto: 2,
        cantidad_sugerida: 20,
        observaciones: 'Para reposición',
      })

      const updated = await updateStockRequestStatusApi(created.id_solicitud, 'aprobada')
      expect(updated.estado).toBe('aprobada')

      const persisted = await getStockRequestApi(created.id_solicitud)
      expect(persisted.estado).toBe('aprobada')
    })
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getProviderQuotationsApi,
  getProviderQuotationApi,
  createProviderQuotationApi,
  selectProviderQuotationApi,
} from '../api/providerQuotationApi'
import { getAuditLogApi } from '../api/auditLogApi'
import { StorageEngine } from '../services/localStorage/storageEngine'

const KEYS = {
  PROVIDER_QUOTATIONS: 'abacubiertas_provider_quotations',
}

describe('PROVIDER QUOTATIONS (Compras) - LocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
  })

  describe('1. Seed de cotizaciones', () => {
    it('should seed quotations for SOL-0001 and SOL-0002 with provider data', async () => {
      const sol1 = await getProviderQuotationsApi(0, 100, 1)
      expect(sol1.total).toBe(2)
      expect(sol1.items[0].numero_cotizacion).toBe('COT-0001')
      expect(sol1.items[0].seleccionada).toBe(true)
      expect(sol1.items[0].precio_unitario).toBeGreaterThan(0)

      const sol2 = await getProviderQuotationsApi(0, 100, 2)
      expect(sol2.total).toBe(2)
      expect(sol2.items.some((q) => q.seleccionada)).toBe(false)
    })

    it('should expose a single quotation by id', async () => {
      const q = await getProviderQuotationApi(1)
      expect(q.numero_cotizacion).toBe('COT-0001')
      expect(q.nombre_proveedor).toBe('Aceros del Caribe S.A.S.')
    })
  })

  describe('2. Registro de cotizaciones', () => {
    it('should create a new quotation with COT number and persist it', async () => {
      const created = await createProviderQuotationApi({
        id_solicitud: 2,
        id_producto: 5,
        id_proveedor: 3,
        precio_unitario: 31000,
        tiempo_entrega_dias: 6,
        condiciones: 'Pago contado',
      })
      expect(created.numero_cotizacion).toBe('COT-0005')
      expect(created.id_proveedor).toBe(3)
      expect(created.precio_unitario).toBe(31000)
      expect(created.seleccionada).toBe(false)

      const raw = JSON.parse(localStorage.getItem(KEYS.PROVIDER_QUOTATIONS) || '[]')
      expect(raw.find((q: { id_cotizacion: number }) => q.id_cotizacion === created.id_cotizacion)).toBeDefined()
    })

    it('should reject a quotation whose product does not match the request', async () => {
      await expect(
        createProviderQuotationApi({
          id_solicitud: 1,
          id_producto: 5,
          id_proveedor: 1,
          precio_unitario: 60000,
          tiempo_entrega_dias: 10,
        }),
      ).rejects.toThrow(/no corresponde a la solicitud/i)
    })

    it('should reject non-positive price and delivery time', async () => {
      await expect(
        createProviderQuotationApi({
          id_solicitud: 2,
          id_producto: 5,
          id_proveedor: 1,
          precio_unitario: 0,
          tiempo_entrega_dias: 7,
        }),
      ).rejects.toThrow(/precio unitario debe ser mayor a 0/i)

      await expect(
        createProviderQuotationApi({
          id_solicitud: 2,
          id_producto: 5,
          id_proveedor: 1,
          precio_unitario: 30000,
          tiempo_entrega_dias: 0,
        }),
      ).rejects.toThrow(/tiempo de entrega debe ser mayor a 0/i)
    })

    it('should audit log the creation', async () => {
      await createProviderQuotationApi({
        id_solicitud: 2,
        id_producto: 5,
        id_proveedor: 3,
        precio_unitario: 31000,
        tiempo_entrega_dias: 6,
      })
      const logs = await getAuditLogApi(0, 100)
      expect(logs.items.some((l) => l.accion === 'provider_quotation_created')).toBe(true)
    })
  })

  describe('3. Selección del mejor proveedor', () => {
    it('should select a quotation when the request has 2+ quotes and none selected', async () => {
      const selected = await selectProviderQuotationApi(4)
      expect(selected.seleccionada).toBe(true)

      const quotes = await getProviderQuotationsApi(0, 100, 2)
      expect(quotes.items.filter((q) => q.seleccionada)).toHaveLength(1)
    })

    it('should reject selecting a second quotation for an already-selected request', async () => {
      await expect(selectProviderQuotationApi(2)).rejects.toThrow(/ya tiene una cotización seleccionada/i)
    })

    it('should audit log the selection', async () => {
      await selectProviderQuotationApi(4)
      const logs = await getAuditLogApi(0, 100)
      expect(logs.items.some((l) => l.accion === 'provider_quotation_selected')).toBe(true)
    })
  })
})

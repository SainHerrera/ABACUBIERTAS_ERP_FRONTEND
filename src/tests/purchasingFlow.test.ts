import { describe, it, expect, beforeEach } from 'vitest'
import {
  createPurchaseOrderApi,
  getPurchaseOrdersApi,
  markPoTransitApi,
  receiveAgainstPoApi,
  getProviderExpenseReportApi,
  getProviderDeliveryReportApi,
} from '../api/purchaseOrderApi'
import { selectProviderQuotationApi } from '../api/providerQuotationApi'
import { getProductApi } from '../api/productApi'
import { StorageEngine } from '../services/localStorage/storageEngine'

describe('PURCHASING FLOW (Compras) - LocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
  })

  describe('1. Generación de orden de compra desde cotización seleccionada', () => {
    it('should create an OC in "enviada" copying quotation price and delivery, linking request', async () => {
      // SOL-0002 (producto 5) tiene COT-0003 y COT-0004, ninguna seleccionada.
      const selected = await selectProviderQuotationApi(4)
      expect(selected.seleccionada).toBe(true)

      const oc = await createPurchaseOrderApi({
        id_proveedor: selected.id_proveedor,
        id_solicitud: 2,
        id_cotizacion: selected.id_cotizacion,
        observaciones: 'Compra por solicitud SOL-0002',
        detalles: [
          {
            id_producto: 5,
            descripcion: 'Caballete Articulado UPVC Blanco 1.05m',
            cantidad_ordenada: 40,
            precio_unitario: selected.precio_unitario,
            tiempo_entrega_dias: selected.tiempo_entrega_dias,
          },
        ],
      })

      expect(oc.numero_oc).toBe('OC-0003')
      expect(oc.estado).toBe('enviada')
      expect(oc.nombre_proveedor).toBe('Aceros del Caribe S.A.S.')
      expect(oc.id_solicitud).toBe(2)
      expect(oc.numero_solicitud).toBe('SOL-0002')
      expect(oc.id_cotizacion).toBe(4)
      expect(oc.detalles[0].precio_unitario).toBe(35000)
      expect(oc.detalles[0].tiempo_entrega_dias).toBe(9)
      expect(oc.detalles[0].cantidad_recibida).toBe(0)
    })

    it('should reject creating an OC from a non-selected quotation', async () => {
      await expect(
        createPurchaseOrderApi({
          id_proveedor: 2,
          id_solicitud: 2,
          id_cotizacion: 3,
          detalles: [
            { id_producto: 5, descripcion: 'x', cantidad_ordenada: 10, precio_unitario: 100 },
          ],
        }),
      ).rejects.toThrow(/no está marcada como seleccionada/i)
    })
  })

  describe('2. Ciclo de estados: enviada -> en_transito -> recibida', () => {
    it('should not receive while "enviada", mark transit, then receive', async () => {
      const selected = await selectProviderQuotationApi(4)
      const oc = await createPurchaseOrderApi({
        id_proveedor: selected.id_proveedor,
        id_solicitud: 2,
        id_cotizacion: selected.id_cotizacion,
        detalles: [
          {
            id_producto: 5,
            descripcion: 'Caballete Articulado UPVC Blanco 1.05m',
            cantidad_ordenada: 40,
            precio_unitario: selected.precio_unitario,
            tiempo_entrega_dias: selected.tiempo_entrega_dias,
          },
        ],
      })
      expect(oc.estado).toBe('enviada')

      // Compras no puede registrar la entrada estando "enviada"
      await expect(
        receiveAgainstPoApi(oc.id_orden_compra, { product_id: 5, quantity: 10 }),
      ).rejects.toThrow(/en tránsito para registrar la entrada/i)

      const inTransit = await markPoTransitApi(oc.id_orden_compra)
      expect(inTransit.estado).toBe('en_transito')

      // Bodega registra la entrada total -> OC recibida
      const prodBefore = await getProductApi(5)
      const received = await receiveAgainstPoApi(oc.id_orden_compra, {
        product_id: 5,
        quantity: 40,
        note: 'Mercancía recibida en bodega',
      })
      expect(received.estado).toBe('recibida')
      const prodAfter = await getProductApi(5)
      expect(prodAfter.stock_actual).toBe(prodBefore.stock_actual + 40)
    })

    it('should reject marking transit when the OC is not "enviada"', async () => {
      // OC-0001 is already in transit (seed), so it cannot be marked again
      await expect(markPoTransitApi(1)).rejects.toThrow(/en estado "enviada"/i)
    })
  })

  describe('3. Reporte de gasto y tiempos por proveedor', () => {
    it('should report gasto_total as sum of received * price grouped by provider', async () => {
      const selected = await selectProviderQuotationApi(4)
      const oc = await createPurchaseOrderApi({
        id_proveedor: selected.id_proveedor,
        id_solicitud: 2,
        id_cotizacion: selected.id_cotizacion,
        detalles: [
          {
            id_producto: 5,
            descripcion: 'x',
            cantidad_ordenada: 20,
            precio_unitario: selected.precio_unitario,
            tiempo_entrega_dias: selected.tiempo_entrega_dias,
          },
        ],
      })
      await markPoTransitApi(oc.id_orden_compra)
      await receiveAgainstPoApi(oc.id_orden_compra, { product_id: 5, quantity: 20 })

      const report = await getProviderExpenseReportApi()
      const prov1 = report.find((r) => r.id_proveedor === 1)
      expect(prov1).toBeDefined()
      expect(prov1!.gasto_total).toBe(20 * 35000)
      expect(prov1!.numero_oc).toBeGreaterThanOrEqual(1)
    })

    it('should report average delivery time per provider and sort ascending', async () => {
      const report = await getProviderDeliveryReportApi()
      expect(report.length).toBeGreaterThan(0)
      for (const row of report) {
        expect(row.nombre_proveedor.length).toBeGreaterThan(0)
        expect(row.tiempo_promedio_dias).toBeGreaterThanOrEqual(0)
      }
      const times = report.map((r) => r.tiempo_promedio_dias)
      const sorted = [...times].sort((a, b) => a - b)
      expect(times).toEqual(sorted)
    })
  })

  describe('4. Listado de órdenes por estado', () => {
    it('should filter OCs by estado en_transito', async () => {
      const res = await getPurchaseOrdersApi(0, 100, 'en_transito')
      expect(res.items.every((o) => o.estado === 'en_transito')).toBe(true)
      expect(res.items.map((o) => o.numero_oc)).toContain('OC-0001')
    })
  })
})

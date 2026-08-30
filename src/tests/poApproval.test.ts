import { describe, it, expect, beforeEach } from 'vitest'
import {
  createPurchaseOrderApi,
  markPoTransitApi,
  receiveAgainstPoApi,
  approvePurchaseOrderApi,
  getPurchaseOrdersPendingApprovalApi,
  getPurchaseOrdersApi,
} from '../api/purchaseOrderApi'
import { selectProviderQuotationApi } from '../api/providerQuotationApi'
import { updateSettingsApi } from '../api/settingsApi'
import { StorageEngine } from '../services/localStorage/storageEngine'
import type { PurchaseOrderCreate } from '../types/purchaseOrder'

const buildOc = async (cantidad: number, precio: number) => {
  const selected = await selectProviderQuotationApi(4)
  const data: PurchaseOrderCreate = {
    id_proveedor: selected.id_proveedor,
    id_solicitud: 2,
    id_cotizacion: selected.id_cotizacion,
    detalles: [
      {
        id_producto: 5,
        descripcion: 'Caballete Articulado UPVC Blanco 1.05m',
        cantidad_ordenada: cantidad,
        precio_unitario: precio,
        tiempo_entrega_dias: selected.tiempo_entrega_dias,
      },
    ],
  }
  return createPurchaseOrderApi(data)
}

describe('PURCHASE ORDER APPROVAL (Gerencia/Admin) - LocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
  })

  describe('1. Regla de aprobación desactivada (por defecto)', () => {
    it('debe crear la OC en "enviada" aunque el monto sea alto', async () => {
      const oc = await buildOc(100, 35000)
      expect(oc.estado).toBe('enviada')
    })

    it('no debe listar aprobaciones pendientes', async () => {
      await buildOc(100, 35000)
      const pending = await getPurchaseOrdersPendingApprovalApi()
      expect(pending.length).toBe(0)
    })
  })

  describe('2. Regla de aprobación activada', () => {
    beforeEach(async () => {
      await updateSettingsApi({ aprobacionOcHabilitada: true, aprobacionOcMontoMinimo: 1000000 })
    })

    it('debe poner la OC en "pendiente_aprobacion" si supera el umbral', async () => {
      // 40 * 35000 = 1.400.000 >= 1.000.000
      const oc = await buildOc(40, 35000)
      expect(oc.estado).toBe('pendiente_aprobacion')

      const pending = await getPurchaseOrdersPendingApprovalApi()
      expect(pending.some((o) => o.id_orden_compra === oc.id_orden_compra)).toBe(true)
    })

    it('debe dejar la OC en "enviada" si NO supera el umbral', async () => {
      // 20 * 35000 = 700.000 < 1.000.000
      const oc = await buildOc(20, 35000)
      expect(oc.estado).toBe('enviada')
    })

    it('debe poder filtrar las OC por estado pendiente_aprobacion', async () => {
      await buildOc(40, 35000)
      const res = await getPurchaseOrdersApi(0, 100, 'pendiente_aprobacion')
      expect(res.items.every((o) => o.estado === 'pendiente_aprobacion')).toBe(true)
      expect(res.total).toBeGreaterThan(0)
    })
  })

  describe('3. Aprobación y rechazo', () => {
    beforeEach(async () => {
      await updateSettingsApi({ aprobacionOcHabilitada: true, aprobacionOcMontoMinimo: 1000000 })
    })

    it('al aprobar pasa a "enviada" y puede marcarse en tránsito', async () => {
      const oc = await buildOc(40, 35000)
      expect(oc.estado).toBe('pendiente_aprobacion')

      const approved = await approvePurchaseOrderApi(oc.id_orden_compra, true)
      expect(approved.estado).toBe('enviada')

      const transit = await markPoTransitApi(oc.id_orden_compra)
      expect(transit.estado).toBe('en_transito')
    })

    it('al rechazar pasa a "rechazada"', async () => {
      const oc = await buildOc(40, 35000)
      const rejected = await approvePurchaseOrderApi(oc.id_orden_compra, false)
      expect(rejected.estado).toBe('rechazada')

      const res = await getPurchaseOrdersApi(0, 100, 'rechazada')
      expect(res.items.some((o) => o.id_orden_compra === oc.id_orden_compra)).toBe(true)
    })

    it('registra los audits de pendiente, aprobación y rechazo', async () => {
      const pendiente = await buildOc(40, 35000)
      const pendingAudits = StorageEngine.getAuditLog(0, 100, {
        accion: 'purchase_order_pending_approval',
      })
      expect(
        pendingAudits.items.some((a) => a.detalle.includes(pendiente.numero_oc)),
      ).toBe(true)

      await approvePurchaseOrderApi(pendiente.id_orden_compra, true)
      const approvedAudits = StorageEngine.getAuditLog(0, 100, {
        accion: 'purchase_order_approved',
      })
      expect(
        approvedAudits.items.some((a) => a.detalle.includes(pendiente.numero_oc)),
      ).toBe(true)
    })

    it('debe rechazar aprobar una OC que no está pendiente', async () => {
      // OC-0001 está en tránsito
      await expect(approvePurchaseOrderApi(1, true)).rejects.toThrow(
        /no está pendiente de aprobación/i,
      )
    })
  })

  describe('4. Guardas del ciclo de vida', () => {
    beforeEach(async () => {
      await updateSettingsApi({ aprobacionOcHabilitada: true, aprobacionOcMontoMinimo: 1000000 })
    })

    it('no debe permitir marcar en tránsito una OC pendiente de aprobación', async () => {
      const oc = await buildOc(40, 35000)
      await expect(markPoTransitApi(oc.id_orden_compra)).rejects.toThrow(
        /en estado "enviada"/i,
      )
    })

    it('no debe permitir recibir una OC pendiente de aprobación', async () => {
      const oc = await buildOc(40, 35000)
      await expect(
        receiveAgainstPoApi(oc.id_orden_compra, { product_id: 5, quantity: 10 }),
      ).rejects.toThrow(/en tránsito para registrar la entrada/i)
    })
  })

  describe('5. Validación del monto mínimo en settings', () => {
    it('debe rechazar un monto mínimo negativo', async () => {
      await expect(
        updateSettingsApi({ aprobacionOcMontoMinimo: -1 }),
      ).rejects.toThrow('El monto mínimo de aprobación no puede ser negativo')
    })

    it('debe persistir los parámetros de aprobación', async () => {
      await updateSettingsApi({ aprobacionOcHabilitada: true, aprobacionOcMontoMinimo: 2500000 })
      const settings = StorageEngine.getSettings()
      expect(settings.aprobacionOcHabilitada).toBe(true)
      expect(settings.aprobacionOcMontoMinimo).toBe(2500000)
    })
  })
})

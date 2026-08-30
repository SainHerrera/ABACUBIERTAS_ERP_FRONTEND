import { describe, it, expect, beforeEach } from 'vitest'
import {
  getPurchaseOrderApi,
  receiveAgainstPoApi,
} from '../api/purchaseOrderApi'
import { getSalesApi, createSaleApi, confirmDispatchApi } from '../api/saleApi'
import { getClientsApi } from '../api/clientApi'
import { createProductApi, getProductApi } from '../api/productApi'
import { createEntryApi, createAdjustmentApi, getMovementsApi } from '../api/movementApi'
import { StorageEngine } from '../services/localStorage/storageEngine'

describe('INVENTORY FLOWS - Purchase Orders, Dispatch & Adjustment (LocalStorage)', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
  })

  describe('1. Purchase Orders - receive merchandise against an approved PO', () => {
    it('should seed an in-transit PO, receive partially and fully, updating stock and movements', async () => {
      // 1. Seeded in-transit PO for product 1 (Cubierta UPVC, stock 45) ordering 60
      const po = await getPurchaseOrderApi(1)
      expect(po.numero_oc).toBe('OC-0001')
      expect(po.estado).toBe('en_transito')

      const detail = po.detalles.find((d) => d.id_producto === 1)!
      expect(detail.cantidad_ordenada).toBe(60)
      expect(detail.cantidad_recibida).toBe(0)

      // 2. Partial receive of 20 units -> stock 45 -> 65
      const fecha = '2026-08-28T10:00:00.000Z'
      const afterPartial = await receiveAgainstPoApi(1, {
        product_id: 1,
        quantity: 20,
        fecha,
        note: 'Primera remesa recibida',
      })
      expect(afterPartial.estado).toBe('en_transito')

      const prodAfterPartial = await getProductApi(1)
      expect(prodAfterPartial.stock_actual).toBe(65)

      // 3. Receive an amount that exceeds the pending (40 more) -> error
      await expect(
        receiveAgainstPoApi(1, { product_id: 1, quantity: 41 }),
      ).rejects.toThrow(/no se puede recibir más de lo ordenado/i)

      // 4. Receive the remaining 40 units of product 1 -> stock 105 (PO still en_transito
      //    because product 2 is still pending)
      const afterFull1 = await receiveAgainstPoApi(1, {
        product_id: 1,
        quantity: 40,
        note: 'Segunda remesa recibida',
      })
      expect(afterFull1.estado).toBe('en_transito')

      const prodAfterFull = await getProductApi(1)
      expect(prodAfterFull.stock_actual).toBe(105)

      // 5. Complete product 2 (30 ordered) -> PO becomes received; stock 8 -> 38
      const afterProduct2 = await receiveAgainstPoApi(1, {
        product_id: 2,
        quantity: 30,
        note: 'Recepción completa del perfil C',
      })
      expect(afterProduct2.estado).toBe('recibida')

      const prod2 = await getProductApi(2)
      expect(prod2.stock_actual).toBe(38)

      // 6. cantidad_recibida persisted in abacubiertas_pos
      const raw: Array<{ id_orden_compra: number; detalles: Array<{ id_producto: number; cantidad_recibida: number }> }> =
        JSON.parse(localStorage.getItem('abacubiertas_pos') || '[]')
      const persisted = raw.find((o) => o.id_orden_compra === 1)!
      expect(persisted.detalles.find((d) => d.id_producto === 1)!.cantidad_recibida).toBe(60)
      expect(persisted.detalles.find((d) => d.id_producto === 2)!.cantidad_recibida).toBe(30)

      // 7. Entry movement registered with the manual fecha
      const movements = await getMovementsApi(0, 1000, 1)
      const entry = movements.items.find(
        (m) => m.tipo === 'entrada' && m.referencia === 'OC-0001' && m.cantidad === 20,
      )
      expect(entry).toBeDefined()
      expect(entry!.fecha).toBe(fecha)
    })

    it('should reject receiving against a completed PO', async () => {
      const po = await getPurchaseOrderApi(1)
      const productId = po.detalles[0].id_producto
      await receiveAgainstPoApi(1, { product_id: productId, quantity: po.detalles[0].cantidad_ordenada })
      // The second detail (product 2) is still pending, so the PO may still be 'en_transito'.
      // Receiving the exact same product remains impossible because it exceeds the ordered amount.
      await expect(
        receiveAgainstPoApi(1, { product_id: productId, quantity: 1 }),
      ).rejects.toThrow(/no se puede recibir más de lo ordenado/i)
    })
  })

  describe('2. Purchase Orders - entrada con fecha manual', () => {
    it('should register an entry movement with a manual date via createEntry', async () => {
      const product = await createProductApi({
        nombre: 'Producto Fecha Manual',
        stock_inicial: 0,
        stock_minimo: 5,
      })
      const manualDate = '2025-01-15T08:30:00.000Z'
      await createEntryApi({
        product_id: product.id_producto,
        quantity: 10,
        reference: 'DOC-FECHA',
        fecha: manualDate,
      })
      const movements = await getMovementsApi(0, 100, product.id_producto)
      const entry = movements.items.find((m) => m.referencia === 'DOC-FECHA')
      expect(entry).toBeDefined()
      expect(entry!.fecha).toBe(manualDate)
    })
  })

  describe('3. Adjustment with mandatory motive', () => {
    it('should reject an adjustment without a motive', async () => {
      const product = await createProductApi({
        nombre: 'Producto Ajuste Sin Motivo',
        stock_inicial: 40,
        stock_minimo: 10,
      })
      await expect(
        createAdjustmentApi({
          product_id: product.id_producto,
          quantity: 30,
        }),
      ).rejects.toThrow('El motivo del ajuste es obligatorio')

      // Stock unchanged because the adjustment was rejected
      const prod = await getProductApi(product.id_producto)
      expect(prod.stock_actual).toBe(40)
    })

    it('should accept an adjustment with a motive', async () => {
      const product = await createProductApi({
        nombre: 'Producto Ajuste Con Motivo',
        stock_inicial: 40,
        stock_minimo: 10,
      })
      const movement = await createAdjustmentApi({
        product_id: product.id_producto,
        quantity: 35,
        reference: 'CONTEO-FISICO',
        note: 'Diferencia detectada en el despacho del pedido PED-0001',
      })
      expect(movement.tipo).toBe('ajuste')
      const prod = await getProductApi(product.id_producto)
      expect(prod.stock_actual).toBe(35)
    })
  })

  describe('4. Dispatch confirmation deducts stock', () => {
    it('should NOT deduct stock on createSale, and deduct only when dispatch is confirmed', async () => {
      const product = await createProductApi({
        nombre: 'Producto Despacho',
        stock_inicial: 30,
        stock_minimo: 5,
      })
      const client = (await getClientsApi(0, 1)).items[0]

      const sale = await createSaleApi({
        id_cliente: client.id_cliente,
        observaciones: 'Pedido para despacho',
        detalles: [
          {
            id_detalle_venta: 1,
            id_producto: product.id_producto,
            descripcion: product.nombre,
            cantidad: 12,
            precio_unitario: 10000,
            descuento: 0,
            subtotal: 120000,
          },
        ],
      })

      // createSale does not deduct
      expect(sale.estado).toBe('pendiente')
      const prodAfterCreate = await getProductApi(product.id_producto)
      expect(prodAfterCreate.stock_actual).toBe(30)

      // Confirm dispatch deducts
      await confirmDispatchApi(sale.id_orden_venta)
      const prodAfterDispatch = await getProductApi(product.id_producto)
      expect(prodAfterDispatch.stock_actual).toBe(18)

      // Sale list reflects entregada and output movement was created
      const sales = await getSalesApi(0, 1000)
      const updated = sales.items.find((s) => s.id_orden_venta === sale.id_orden_venta)!
      expect(updated.estado).toBe('entregada')
    })
  })
})

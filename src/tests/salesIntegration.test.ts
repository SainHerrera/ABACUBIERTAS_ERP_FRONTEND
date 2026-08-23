import { describe, it, expect, beforeEach } from 'vitest'
import {
  getClientsApi,
  createClientApi,
  updateClientApi,
  deleteClientApi,
} from '../api/clientApi'
import {
  getQuoteApi,
  createQuoteApi,
  updateQuoteStatusApi,
  deleteQuoteApi,
} from '../api/quotationApi'
import {
  createSaleApi,
  cancelSaleApi,
  convertQuoteToSaleApi,
} from '../api/saleApi'
import { getProductApi, createProductApi } from '../api/productApi'
import { StorageEngine } from '../services/localStorage/storageEngine'

describe('SALES, QUOTATIONS & CLIENTS - Full Integration Flow with LocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
  })

  describe('1. Clients Flow (/sales/customers)', () => {
    it('should list seed clients and create, edit, search, and delete a client', async () => {
      // 1. Initial list
      const initial = await getClientsApi(0, 1000)
      expect(initial.items.length).toBeGreaterThan(0)
      expect(initial.total).toBeGreaterThan(0)

      // 2. Create client
      const newClient = await createClientApi({
        tipo_cliente: 'empresa',
        nombre_razon_social: 'Distribuidora del Valle S.A.S.',
        nit_cc: '901999888-7',
        nombre_contacto: 'Elena Morales',
        telefono: '3157778899',
        email: 'ventas@distrivalle.co',
        ciudad: 'Cali',
      })

      expect(newClient.id_cliente).toBeDefined()
      expect(newClient.nombre_razon_social).toBe('Distribuidora del Valle S.A.S.')
      expect(newClient.nit_cc).toBe('901999888-7')

      // 3. Search client
      const searchRes = await getClientsApi(0, 10, 'Distribuidora')
      expect(searchRes.items.some((c) => c.id_cliente === newClient.id_cliente)).toBe(true)

      // 4. Update client
      const updated = await updateClientApi(newClient.id_cliente, {
        telefono: '3150001122',
        ciudad: 'Palmira',
      })
      expect(updated.telefono).toBe('3150001122')
      expect(updated.ciudad).toBe('Palmira')

      // 5. Delete client
      await deleteClientApi(newClient.id_cliente)
      const afterDelete = await getClientsApi(0, 1000)
      expect(afterDelete.items.some((c) => c.id_cliente === newClient.id_cliente)).toBe(false)
    })
  })

  describe('2. Quotations Flow (/sales/quotations)', () => {
    it('should create a quotation, update status, and calculate totals', async () => {
      // 1. Get seed client and product
      const clients = await getClientsApi(0, 10)
      const client = clients.items[0]

      const quote = await createQuoteApi({
        id_cliente: client.id_cliente,
        descuento: 50000,
        observaciones: 'Cotización prueba automatizada',
        detalles: [
          {
            id_detalle: 1,
            id_producto: 1,
            descripcion: 'Cubierta UPVC',
            cantidad: 10,
            precio_unitario: 85000,
            descuento: 0,
            subtotal: 850000,
          },
        ],
      })

      expect(quote.id_cotizacion).toBeDefined()
      expect(quote.numero_consecutivo).toMatch(/^COT-/)
      expect(quote.estado).toBe('borrador')
      expect(quote.subtotal).toBe(850000)
      expect(quote.descuento).toBe(50000)
      // subtotal after discount = 800,000; IVA 19% = 152,000; total = 952,000
      expect(quote.total).toBe(952000)

      // 2. Change status
      const updated = await updateQuoteStatusApi(quote.id_cotizacion, { estado: 'enviada' })
      expect(updated.estado).toBe('enviada')

      // 3. Delete quote
      await deleteQuoteApi(quote.id_cotizacion)
      await expect(getQuoteApi(quote.id_cotizacion)).rejects.toThrow(/no encontrada/)
    })
  })

  describe('3. Orders & Stock Integration Flow (/sales/orders)', () => {
    it('should create order and deduct stock, cancel order and restore stock', async () => {
      // 1. Create a specific test product
      const product = await createProductApi({
        nombre: 'Teja Test Pedido Stock',
        stock_inicial: 50,
        stock_minimo: 10,
        precio_unitario: 100000,
      })
      expect(product.stock_actual).toBe(50)

      const client = (await getClientsApi(0, 1)).items[0]

      // 2. Create Order for 20 units -> stock becomes 30
      const sale = await createSaleApi({
        id_cliente: client.id_cliente,
        observaciones: 'Pedido prueba stock',
        detalles: [
          {
            id_detalle_venta: 1,
            id_producto: product.id_producto,
            descripcion: product.nombre,
            cantidad: 20,
            precio_unitario: product.precio_unitario,
            descuento: 0,
            subtotal: 2000000,
          },
        ],
      })

      expect(sale.id_orden_venta).toBeDefined()
      expect(sale.numero_orden).toMatch(/^PED-/)
      expect(sale.estado).toBe('pendiente')

      const prodAfterSale = await getProductApi(product.id_producto)
      expect(prodAfterSale.stock_actual).toBe(30)

      // 3. Trying to create order for 40 units should fail due to insufficient stock (only 30 available)
      await expect(
        createSaleApi({
          id_cliente: client.id_cliente,
          detalles: [
            {
              id_detalle_venta: 1,
              id_producto: product.id_producto,
              descripcion: product.nombre,
              cantidad: 40,
              precio_unitario: product.precio_unitario,
              descuento: 0,
              subtotal: 4000000,
            },
          ],
        }),
      ).rejects.toThrow(/Stock insuficiente/)

      // 4. Cancel the sale -> stock should be restored from 30 back to 50
      const cancelledSale = await cancelSaleApi(sale.id_orden_venta)
      expect(cancelledSale.estado).toBe('cancelada')

      const prodAfterCancel = await getProductApi(product.id_producto)
      expect(prodAfterCancel.stock_actual).toBe(50)
    })

    it('should convert quotation to sale, deduct stock, and approve quotation', async () => {
      const client = (await getClientsApi(0, 1)).items[0]
      const product = await createProductApi({
        nombre: 'Producto Convertir Cotizacion',
        stock_inicial: 25,
        stock_minimo: 5,
        precio_unitario: 50000,
      })

      const quote = await createQuoteApi({
        id_cliente: client.id_cliente,
        descuento: 0,
        detalles: [
          {
            id_detalle: 1,
            id_producto: product.id_producto,
            descripcion: product.nombre,
            cantidad: 15,
            precio_unitario: 50000,
            descuento: 0,
            subtotal: 750000,
          },
        ],
      })

      const sale = await convertQuoteToSaleApi(quote.id_cotizacion)
      expect(sale.id_orden_venta).toBeDefined()
      expect(sale.id_cotizacion).toBe(quote.id_cotizacion)

      // Stock should be deducted from 25 to 10
      const prodCheck = await getProductApi(product.id_producto)
      expect(prodCheck.stock_actual).toBe(10)

      // Quote status should be aprobada
      const updatedQuote = await getQuoteApi(quote.id_cotizacion)
      expect(updatedQuote.estado).toBe('aprobada')
    })
  })
})

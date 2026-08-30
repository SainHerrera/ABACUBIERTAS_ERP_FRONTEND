import { describe, it, expect, beforeEach } from 'vitest'
import { StorageEngine } from '../services/localStorage/storageEngine'
import {
  getDashboardKpisApi,
  getSalesBySellerReportApi,
  getSalesMonthlyTrendApi,
  getInventoryValuationReportApi,
} from '../api/reportApi'
import { createSaleApi } from '../api/saleApi'
import { getClientsApi } from '../api/clientApi'

describe('DASHBOARD & REPORTS (Gerencia/Admin) - LocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
  })

  describe('1. KPIs del dashboard', () => {
    it('debe calcular los KPIs a partir de los datos seed', async () => {
      const kpis = await getDashboardKpisApi()

      // Cotización COT-0001 en "enviada" -> 1
      expect(kpis.cotizacionesPendientes).toBe(1)
      // Productos low_stock en seed: ids 2, 3 y 5 -> 3
      expect(kpis.stockCritico).toBe(3)
      // OC seed: OC-0001 en tránsito + OC-0002 enviada -> 2
      expect(kpis.comprasPendientes).toBe(2)
      expect(kpis.aprobacionesPendientes).toBe(0)
      // Venta seed no cancelada -> 2.023.000
      expect(kpis.totalVentas).toBe(2023000)
      expect(typeof kpis.ventasDelMes).toBe('number')
      expect(kpis.ventasDelMes).toBeGreaterThanOrEqual(0)
    })

    it('debe incrementar ventasDelMes al crear una venta en el mes actual', async () => {
      const before = await getDashboardKpisApi()
      const client = (await getClientsApi(0, 1)).items[0]

      await createSaleApi({
        id_cliente: client.id_cliente,
        observaciones: 'Venta de prueba para reporte',
        detalles: [
          {
            id_detalle_venta: 1,
            id_producto: 1,
            descripcion: 'Cubierta UPVC Termoacústica 3 Capas 2.44m',
            cantidad: 2,
            precio_unitario: 85000,
            descuento: 0,
            subtotal: 170000,
          },
        ],
      })

      const after = await getDashboardKpisApi()
      expect(after.ventasDelMes).toBe(before.ventasDelMes + 170000)
      expect(after.totalVentas).toBe(before.totalVentas + 170000)
    })
  })

  describe('2. Ventas por vendedor', () => {
    it('debe agrupar por id_usuario con el nombre del vendedor', async () => {
      const report = await getSalesBySellerReportApi()
      // La venta seed es del usuario 1 (Administrador ERP)
      expect(report.length).toBeGreaterThan(0)
      const row = report.find((r) => r.id_usuario === 1)
      expect(row).toBeDefined()
      expect(row!.vendedor).toBe('Administrador ERP')
      expect(row!.total).toBe(2023000)
      expect(row!.ventas).toBe(1)
    })

    it('debe ordenar por total descendente', async () => {
      const report = await getSalesBySellerReportApi()
      const totals = report.map((r) => r.total)
      const sorted = [...totals].sort((a, b) => b - a)
      expect(totals).toEqual(sorted)
    })
  })

  describe('3. Tendencia de ventas por mes', () => {
    it('debe devolver una tendencia mensual con los meses ordenados', async () => {
      const trend = await getSalesMonthlyTrendApi()
      expect(trend.length).toBeGreaterThan(0)
      const keys = trend.map((t) => t.mes)
      const sorted = [...keys].sort()
      expect(keys).toEqual(sorted)
      for (const t of trend) {
        expect(t.total).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('4. Valorización de inventario', () => {
    it('debe calcular la valorización total como suma de stock * precio', async () => {
      const report = await getInventoryValuationReportApi()
      expect(report.porProducto.length).toBeGreaterThan(0)
      const expectedTotal = report.porProducto.reduce(
        (sum, p) => sum + p.stock_actual * p.precio_unitario,
        0,
      )
      expect(report.valorTotal).toBe(expectedTotal)
      expect(report.valorTotal).toBeGreaterThan(0)
      for (const p of report.porProducto) {
        expect(p.valor).toBe(p.stock_actual * p.precio_unitario)
      }
    })

    it('debe ordenar por valor descendente', async () => {
      const report = await getInventoryValuationReportApi()
      const valores = report.porProducto.map((p) => p.valor)
      const sorted = [...valores].sort((a, b) => b - a)
      expect(valores).toEqual(sorted)
    })
  })
})

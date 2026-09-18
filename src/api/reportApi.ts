import axiosInstance from './axiosInstance'
import { isMockAuthEnabled } from './authApi'
import { StorageEngine } from '../services/localStorage/storageEngine'

export const getDashboardKpisApi = async (): Promise<{
  ventasDelMes: number
  totalVentas: number
  cotizacionesPendientes: number
  stockCritico: number
  comprasPendientes: number
  aprobacionesPendientes: number
}> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<{
      ventasDelMes: number
      totalVentas: number
      cotizacionesPendientes: number
      stockCritico: number
      comprasPendientes: number
      aprobacionesPendientes: number
    }>('/reports/kpis')
    return data
  }
  return StorageEngine.getDashboardKpis()
}

export const getSalesBySellerReportApi = async (): Promise<
  Array<{ id_usuario: string; vendedor: string; total: number; ventas: number }>
> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<
      Array<{ id_usuario: string; vendedor: string; total: number; ventas: number }>
    >('/reports/sales-by-seller')
    return data
  }
  return StorageEngine.getSalesBySellerReport()
}

export const getSalesMonthlyTrendApi = async (): Promise<
  Array<{ mes: string; total: number }>
> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<Array<{ mes: string; total: number }>>(
      '/reports/sales-monthly-trend',
    )
    return data
  }
  return StorageEngine.getSalesMonthlyTrend()
}

export const getInventoryValuationReportApi = async (): Promise<{
  valorTotal: number
  porProducto: Array<{
    id_producto: string
    nombre: string
    stock_actual: number
    precio_unitario: number
    valor: number
  }>
}> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<{
      valorTotal: number
      porProducto: Array<{
        id_producto: string
        nombre: string
        stock_actual: number
        precio_unitario: number
        valor: number
      }>
    }>('/reports/inventory-valuation')
    return data
  }
  return StorageEngine.getInventoryValuationReport()
}
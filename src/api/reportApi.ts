import { StorageEngine } from '../services/localStorage/storageEngine'

export const getDashboardKpisApi = async (): Promise<{
  ventasDelMes: number
  totalVentas: number
  cotizacionesPendientes: number
  stockCritico: number
  comprasPendientes: number
  aprobacionesPendientes: number
}> => {
  return StorageEngine.getDashboardKpis()
}

export const getSalesBySellerReportApi = async (): Promise<
  Array<{ id_usuario: number; vendedor: string; total: number; ventas: number }>
> => {
  return StorageEngine.getSalesBySellerReport()
}

export const getSalesMonthlyTrendApi = async (): Promise<
  Array<{ mes: string; total: number }>
> => {
  return StorageEngine.getSalesMonthlyTrend()
}

export const getInventoryValuationReportApi = async (): Promise<{
  valorTotal: number
  porProducto: Array<{
    id_producto: number
    nombre: string
    stock_actual: number
    precio_unitario: number
    valor: number
  }>
}> => {
  return StorageEngine.getInventoryValuationReport()
}

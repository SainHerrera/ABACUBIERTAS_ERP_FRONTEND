import type {
  PurchaseOrder,
  PurchaseOrderCreate,
  PurchaseOrderListResponse,
} from '../types/purchaseOrder'
import { StorageEngine } from '../services/localStorage/storageEngine'

export const getPurchaseOrdersApi = async (
  skip = 0,
  limit = 50,
  estado?: string,
): Promise<PurchaseOrderListResponse> => {
  return StorageEngine.getPurchaseOrders(skip, limit, estado)
}

export const getPurchaseOrderApi = async (poId: number): Promise<PurchaseOrder> => {
  return StorageEngine.getPurchaseOrder(poId)
}

export const createPurchaseOrderApi = async (data: PurchaseOrderCreate): Promise<PurchaseOrder> => {
  return StorageEngine.createPurchaseOrder(data)
}

export const receiveAgainstPoApi = async (
  poId: number,
  data: { product_id: number; quantity: number; fecha?: string; note?: string },
): Promise<PurchaseOrder> => {
  return StorageEngine.receiveAgainstPo(poId, data)
}

export const markPoTransitApi = async (poId: number): Promise<PurchaseOrder> => {
  return StorageEngine.markPoTransit(poId)
}

export const approvePurchaseOrderApi = async (
  poId: number,
  aprobar: boolean,
): Promise<PurchaseOrder> => {
  return StorageEngine.approvePurchaseOrder(poId, aprobar)
}

export const getPurchaseOrdersPendingApprovalApi = async (): Promise<PurchaseOrder[]> => {
  return StorageEngine.getPurchaseOrdersPendingApproval()
}

export const getProviderExpenseReportApi = async (): Promise<
  Array<{ id_proveedor: number; nombre_proveedor: string; gasto_total: number; numero_oc: number }>
> => {
  return StorageEngine.getProviderExpenseReport()
}

export const getProviderDeliveryReportApi = async (): Promise<
  Array<{
    id_proveedor: number
    nombre_proveedor: string
    tiempo_promedio_dias: number
    cotizaciones: number
  }>
> => {
  return StorageEngine.getProviderDeliveryReport()
}

export type { PurchaseOrder, PurchaseOrderCreate, PurchaseOrderListResponse }

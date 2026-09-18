import axiosInstance from './axiosInstance'
import { isMockAuthEnabled } from './authApi'
import type {
  PurchaseOrder,
  PurchaseOrderCreate,
  PurchaseOrderListResponse,
  ApiPurchaseOrder,
  ApiPurchaseOrderListResponse,
} from '../types/purchaseOrder'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { mapApiPurchaseOrder } from '../utils/catalogMappers'

export type { PurchaseOrder, PurchaseOrderCreate, PurchaseOrderListResponse }

export const getPurchaseOrdersApi = async (
  skip = 0,
  limit = 50,
  estado?: string,
): Promise<PurchaseOrderListResponse> => {
  if (!isMockAuthEnabled()) {
    const params: { skip: number; limit: number; estado?: string } = {
      skip,
      limit: Math.min(limit, 500),
    }
    if (estado && estado !== 'Todos los estados' && estado !== '') params.estado = estado
    const { data } = await axiosInstance.get<ApiPurchaseOrderListResponse>('/purchase-orders', {
      params,
    })
    return {
      items: data.items.map(mapApiPurchaseOrder),
      total: data.total,
      skip: data.skip,
      limit: data.limit,
    }
  }
  return StorageEngine.getPurchaseOrders(skip, limit, estado)
}

export const getPurchaseOrderApi = async (poId: string): Promise<PurchaseOrder> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<ApiPurchaseOrder>(`/purchase-orders/${poId}`)
    return mapApiPurchaseOrder(data)
  }
  return StorageEngine.getPurchaseOrder(poId)
}

export const createPurchaseOrderApi = async (data: PurchaseOrderCreate): Promise<PurchaseOrder> => {
  if (!isMockAuthEnabled()) {
    const { data: created } = await axiosInstance.post<ApiPurchaseOrder>(
      '/purchase-orders',
      toApiPurchaseOrderCreate(data),
    )
    return mapApiPurchaseOrder(created)
  }
  return StorageEngine.createPurchaseOrder(data)
}

export const receiveAgainstPoApi = async (
  poId: string,
  data: { product_id: string; quantity: number; fecha?: string; note?: string },
): Promise<PurchaseOrder> => {
  if (!isMockAuthEnabled()) {
    const { data: updated } = await axiosInstance.post<ApiPurchaseOrder>(
      `/purchase-orders/${poId}/receive`,
      data,
    )
    return mapApiPurchaseOrder(updated)
  }
  return StorageEngine.receiveAgainstPo(poId, data)
}

export const markPoTransitApi = async (poId: string): Promise<PurchaseOrder> => {
  if (!isMockAuthEnabled()) {
    const { data: updated } = await axiosInstance.post<ApiPurchaseOrder>(
      `/purchase-orders/${poId}/mark-transit`,
    )
    return mapApiPurchaseOrder(updated)
  }
  return StorageEngine.markPoTransit(poId)
}

export const approvePurchaseOrderApi = async (
  poId: string,
  aprobar: boolean,
): Promise<PurchaseOrder> => {
  if (!isMockAuthEnabled()) {
    const { data: updated } = await axiosInstance.post<ApiPurchaseOrder>(
      `/purchase-orders/${poId}/approve`,
      { aprobar },
    )
    return mapApiPurchaseOrder(updated)
  }
  return StorageEngine.approvePurchaseOrder(poId, aprobar)
}

export const getPurchaseOrdersPendingApprovalApi = async (): Promise<PurchaseOrder[]> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<ApiPurchaseOrder[]>('/purchase-orders/pending-approval')
    return data.map(mapApiPurchaseOrder)
  }
  return StorageEngine.getPurchaseOrdersPendingApproval()
}

export const getProviderExpenseReportApi = async (): Promise<
  Array<{ id_proveedor: string; nombre_proveedor: string; gasto_total: number; numero_oc: number }>
> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<
      Array<{
        id_proveedor: string
        nombre_proveedor: string
        gasto_total: number
        numero_oc: number
      }>
    >('/reports/provider-expense')
    return data
  }
  return StorageEngine.getProviderExpenseReport()
}

export const getProviderDeliveryReportApi = async (): Promise<
  Array<{
    id_proveedor: string
    nombre_proveedor: string
    tiempo_promedio_dias: number
    cotizaciones: number
  }>
> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<
      Array<{
        id_proveedor: string
        nombre_proveedor: string
        tiempo_promedio_dias: number
        cotizaciones: number
      }>
    >('/reports/provider-delivery')
    return data
  }
  return StorageEngine.getProviderDeliveryReport()
}

function toApiPurchaseOrderCreate(data: PurchaseOrderCreate) {
  return {
    id_proveedor: data.id_proveedor,
    fecha_emision: data.fecha_emision ?? null,
    observaciones: data.observaciones ?? null,
    id_solicitud: data.id_solicitud != null ? String(data.id_solicitud) : null,
    id_cotizacion: data.id_cotizacion != null ? String(data.id_cotizacion) : null,
    detalles: data.detalles.map((d) => ({
      id_producto: d.id_producto,
      descripcion: d.descripcion || null,
      cantidad_ordenada: d.cantidad_ordenada,
      precio_unitario: d.precio_unitario,
      tiempo_entrega_dias: d.tiempo_entrega_dias ?? null,
    })),
  }
}
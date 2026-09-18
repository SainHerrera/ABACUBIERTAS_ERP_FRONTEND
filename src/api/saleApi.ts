import axiosInstance from './axiosInstance'
import { isMockAuthEnabled } from './authApi'
import type {
  Sale,
  SaleCreate,
  SaleUpdate,
  SaleListResponse,
  ApiSale,
  ApiSaleListResponse,
} from '../types/sales'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { mapApiSale } from '../utils/catalogMappers'

export type { Sale, SaleCreate, SaleUpdate, SaleListResponse }

export const getSalesApi = async (
  skip = 0,
  limit = 50,
  id_cliente?: string,
  estado?: string,
): Promise<SaleListResponse> => {
  if (!isMockAuthEnabled()) {
    const params: { skip: number; limit: number; id_cliente?: string; estado?: string } = {
      skip,
      limit: Math.min(limit, 500),
    }
    if (id_cliente) params.id_cliente = id_cliente
    if (estado && estado !== 'Todos los estados' && estado !== '') params.estado = estado
    const { data } = await axiosInstance.get<ApiSaleListResponse>('/sales', { params })
    return {
      items: data.items.map(mapApiSale),
      total: data.total,
      skip: data.skip,
      limit: data.limit,
    }
  }
  return StorageEngine.getSales(skip, limit, id_cliente, estado)
}

export const getSaleApi = async (saleId: string): Promise<Sale> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<ApiSale>(`/sales/${saleId}`)
    return mapApiSale(data)
  }
  return StorageEngine.getSale(saleId)
}

export const createSaleApi = async (data: SaleCreate): Promise<Sale> => {
  if (!isMockAuthEnabled()) {
    const { data: created } = await axiosInstance.post<ApiSale>('/sales', toApiSaleCreate(data))
    return mapApiSale(created)
  }
  return StorageEngine.createSale(data)
}

export const updateSaleApi = async (
  saleId: string,
  data: SaleUpdate,
): Promise<Sale> => {
  if (!isMockAuthEnabled()) {
    const { data: updated } = await axiosInstance.patch<ApiSale>(
      `/sales/${saleId}`,
      toApiSaleUpdate(data),
    )
    return mapApiSale(updated)
  }
  return StorageEngine.updateSale(saleId, data)
}

export const cancelSaleApi = async (saleId: string, observaciones?: string): Promise<Sale> => {
  if (!isMockAuthEnabled()) {
    const config = observaciones ? { params: { observaciones } } : undefined
    const { data: updated } = await axiosInstance.post<ApiSale>(
      `/sales/${saleId}/cancel`,
      undefined,
      config,
    )
    return mapApiSale(updated)
  }
  return StorageEngine.cancelSale(saleId)
}

export const confirmDispatchApi = async (
  saleId: string,
  observaciones?: string,
): Promise<Sale> => {
  if (!isMockAuthEnabled()) {
    const config = observaciones ? { params: { observaciones } } : undefined
    const { data: updated } = await axiosInstance.post<ApiSale>(
      `/sales/${saleId}/confirm-dispatch`,
      undefined,
      config,
    )
    return mapApiSale(updated)
  }
  return StorageEngine.confirmDispatch(saleId, observaciones)
}

export const convertQuoteToSaleApi = async (
  quoteId: string,
  observaciones?: string,
): Promise<Sale> => {
  if (!isMockAuthEnabled()) {
    const config = observaciones ? { params: { observaciones } } : undefined
    const { data } = await axiosInstance.post<ApiSale>(
      `/quotations/${quoteId}/convert-to-sale`,
      undefined,
      config,
    )
    return mapApiSale(data)
  }
  return StorageEngine.convertQuoteToSale(quoteId, observaciones)
}

function toApiSaleUpdate(data: SaleUpdate): Partial<{ estado?: Sale['estado']; observaciones?: string }> {
  const body: Partial<{ estado?: Sale['estado']; observaciones?: string }> = {}
  if (data.estado !== undefined) body.estado = data.estado
  if (data.observaciones !== undefined) body.observaciones = data.observaciones
  return body
}

function toApiSaleCreate(data: SaleCreate) {
  return {
    id_cliente: data.id_cliente,
    id_cotizacion: data.id_cotizacion ?? null,
    observaciones: data.observaciones ?? null,
    detalles: data.detalles.map((d) => ({
      id_producto: d.id_producto,
      descripcion: d.descripcion || null,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      descuento: d.descuento,
    })),
  }
}
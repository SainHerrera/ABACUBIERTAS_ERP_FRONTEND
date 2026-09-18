import axiosInstance from './axiosInstance'
import { isMockAuthEnabled } from './authApi'
import type {
  StockRequest,
  StockRequestCreate,
  StockRequestListResponse,
  ApiStockRequest,
  ApiStockRequestListResponse,
} from '../types/stockRequest'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { mapApiStockRequest } from '../utils/catalogMappers'

export type { StockRequest, StockRequestCreate, StockRequestListResponse }

export const getStockRequestsApi = async (
  skip = 0,
  limit = 50,
  estado?: string,
): Promise<StockRequestListResponse> => {
  if (!isMockAuthEnabled()) {
    const params: { skip: number; limit: number; estado?: string } = {
      skip,
      limit: Math.min(limit, 500),
    }
    if (estado && estado !== 'Todos los estados' && estado !== '' && !estado.includes(',')) {
      params.estado = estado
    }
    const { data } = await axiosInstance.get<ApiStockRequestListResponse>('/stock-requests', {
      params,
    })
    let items = data.items.map(mapApiStockRequest)
    if (estado && estado.includes(',')) {
      const estados = estado.split(',').map((s) => s.trim()).filter(Boolean)
      items = items.filter((i) => estados.includes(i.estado))
    }
    return {
      items,
      total: data.total,
      skip: data.skip,
      limit: data.limit,
    }
  }
  return StorageEngine.getStockRequests(skip, limit, estado)
}

export const getStockRequestApi = async (requestId: string): Promise<StockRequest> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<ApiStockRequest>(`/stock-requests/${requestId}`)
    return mapApiStockRequest(data)
  }
  return StorageEngine.getStockRequest(requestId)
}

export const createStockRequestApi = async (data: StockRequestCreate): Promise<StockRequest> => {
  if (!isMockAuthEnabled()) {
    const { data: created } = await axiosInstance.post<ApiStockRequest>('/stock-requests', data)
    return mapApiStockRequest(created)
  }
  return StorageEngine.createStockRequest(data)
}

export const updateStockRequestStatusApi = async (
  requestId: string,
  estado: StockRequest['estado'],
  observaciones?: string,
): Promise<StockRequest> => {
  if (!isMockAuthEnabled()) {
    const { data: updated } = await axiosInstance.patch<ApiStockRequest>(
      `/stock-requests/${requestId}/status`,
      { estado, observaciones: observaciones ?? null },
    )
    return mapApiStockRequest(updated)
  }
  return StorageEngine.updateStockRequestStatus(requestId, estado, observaciones)
}

export const getStockRequestByIdApi = async (requestId: string): Promise<StockRequest> => {
  return getStockRequestApi(requestId)
}

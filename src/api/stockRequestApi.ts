import type {
  StockRequest,
  StockRequestCreate,
  StockRequestListResponse,
  StockRequestStatus,
} from '../types/stockRequest'
import { StorageEngine } from '../services/localStorage/storageEngine'

export const getStockRequestsApi = async (
  skip = 0,
  limit = 50,
  estado?: string,
): Promise<StockRequestListResponse> => {
  return StorageEngine.getStockRequests(skip, limit, estado)
}

export const getStockRequestApi = async (requestId: number): Promise<StockRequest> => {
  return StorageEngine.getStockRequest(requestId)
}

export const createStockRequestApi = async (data: StockRequestCreate): Promise<StockRequest> => {
  return StorageEngine.createStockRequest(data)
}

export const updateStockRequestStatusApi = async (
  requestId: number,
  estado: StockRequestStatus,
  observaciones?: string,
): Promise<StockRequest> => {
  return StorageEngine.updateStockRequestStatus(requestId, estado, observaciones)
}

export type { StockRequest, StockRequestCreate, StockRequestListResponse, StockRequestStatus }

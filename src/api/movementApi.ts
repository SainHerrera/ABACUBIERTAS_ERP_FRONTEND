import type {
  Movement,
  MovementEntryCreate,
  MovementOutputCreate,
  MovementAdjustmentCreate,
  MovementListResponse,
} from '../types/movement'
import { StorageEngine } from '../services/localStorage/storageEngine'

export const getMovementsApi = async (
  skip = 0,
  limit = 50,
  product_id?: number,
  date_from?: string,
  date_to?: string,
): Promise<MovementListResponse> => {
  return StorageEngine.getMovements(skip, limit, product_id, date_from, date_to)
}

export const createEntryApi = async (data: MovementEntryCreate): Promise<Movement> => {
  return StorageEngine.createEntry(data)
}

export const createOutputApi = async (data: MovementOutputCreate): Promise<Movement> => {
  return StorageEngine.createOutput(data)
}

export const createAdjustmentApi = async (
  data: MovementAdjustmentCreate,
): Promise<Movement> => {
  return StorageEngine.createAdjustment(data)
}

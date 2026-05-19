import axiosInstance from './axiosInstance'
import type {
  Movement,
  MovementEntryCreate,
  MovementOutputCreate,
  MovementAdjustmentCreate,
  MovementListResponse,
} from '../types/movement'

export const getMovementsApi = async (
  skip = 0,
  limit = 50,
  product_id?: number,
  date_from?: string,
  date_to?: string,
): Promise<MovementListResponse> => {
  const response = await axiosInstance.get<MovementListResponse>('/movements', {
    params: { skip, limit, product_id, date_from, date_to },
  })
  return response.data
}

export const createEntryApi = async (data: MovementEntryCreate): Promise<Movement> => {
  const response = await axiosInstance.post<Movement>('/movements/entry', data)
  return response.data
}

export const createOutputApi = async (data: MovementOutputCreate): Promise<Movement> => {
  const response = await axiosInstance.post<Movement>('/movements/output', data)
  return response.data
}

export const createAdjustmentApi = async (
  data: MovementAdjustmentCreate,
): Promise<Movement> => {
  const response = await axiosInstance.post<Movement>('/movements/adjustment', data)
  return response.data
}

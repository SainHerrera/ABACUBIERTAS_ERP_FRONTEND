import axiosInstance from './axiosInstance'
import { isMockAuthEnabled } from './authApi'
import type {
  Movement,
  MovementEntryCreate,
  MovementOutputCreate,
  MovementAdjustmentCreate,
  MovementListResponse,
  ApiMovement,
  ApiMovementListResponse,
} from '../types/movement'
import type { ApiProductListResponse } from '../types/product'
import type { ApiUser } from '../types/auth'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { mapApiMovement } from '../utils/catalogMappers'

const ENRICHMENT_LIMIT = 500

const fillMovementEnrichment = async (items: Movement[]): Promise<Movement[]> => {
  const [productsRes, usersRes] = await Promise.all([
    axiosInstance.get<ApiProductListResponse>('/products', {
      params: { skip: 0, limit: ENRICHMENT_LIMIT },
    }),
    axiosInstance.get<ApiUser[]>('/users', {
      params: { skip: 0, limit: ENRICHMENT_LIMIT },
    }),
  ])
  const products = productsRes.data.items
  const users = usersRes.data
  return items.map((m) => ({
    ...m,
    nombre_producto:
      products.find((p) => p.id_producto === m.id_producto)?.nombre ??
      m.nombre_producto,
    nombre_usuario:
      users.find((u) => String(u.id) === String(m.id_usuario))?.name ??
      m.nombre_usuario,
  }))
}

export const getMovementsApi = async (
  skip = 0,
  limit = 50,
  product_id?: string,
  date_from?: string,
  date_to?: string,
): Promise<MovementListResponse> => {
  if (!isMockAuthEnabled()) {
    const params: {
      skip: number
      limit: number
      product_id?: string
      date_from?: string
      date_to?: string
    } = { skip, limit: Math.min(limit, 500) }
    if (product_id) params.product_id = product_id
    if (date_from) params.date_from = date_from
    if (date_to) params.date_to = date_to
    const { data } = await axiosInstance.get<ApiMovementListResponse>('/movements', {
      params,
    })
    const items = data.items.map(mapApiMovement)
    return {
      items: await fillMovementEnrichment(items),
      total: data.total,
      skip: data.skip,
      limit: data.limit,
    }
  }
  return StorageEngine.getMovements(skip, limit, product_id, date_from, date_to)
}

const createBackendMovement = async (
  endpoint: string,
  data: MovementEntryCreate | MovementOutputCreate | MovementAdjustmentCreate,
): Promise<Movement> => {
  const { data: created } = await axiosInstance.post<ApiMovement>(endpoint, data)
  const withNames = await fillMovementEnrichment([mapApiMovement(created)])
  return withNames[0]
}

export const createEntryApi = async (data: MovementEntryCreate): Promise<Movement> => {
  if (!isMockAuthEnabled()) {
    return createBackendMovement('/movements/entry', data)
  }
  return StorageEngine.createEntry(data)
}

export const createOutputApi = async (data: MovementOutputCreate): Promise<Movement> => {
  if (!isMockAuthEnabled()) {
    return createBackendMovement('/movements/output', data)
  }
  return StorageEngine.createOutput(data)
}

export const createAdjustmentApi = async (
  data: MovementAdjustmentCreate,
): Promise<Movement> => {
  if (!isMockAuthEnabled()) {
    return createBackendMovement('/movements/adjustment', data)
  }
  return StorageEngine.createAdjustment(data)
}
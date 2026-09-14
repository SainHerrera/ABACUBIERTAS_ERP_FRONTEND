import axiosInstance from './axiosInstance'
import { isMockAuthEnabled } from './authApi'
import type {
  Provider,
  ProviderCreate,
  ProviderUpdate,
  ProviderListResponse,
  ApiProvider,
  ApiProviderListResponse,
} from '../types/provider'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { mapApiProvider } from '../utils/catalogMappers'

const ACTIVE_ONLY = (p: ApiProvider): boolean => p.estado !== 'inactivo' && p.activo !== false

export const getProvidersApi = async (
  skip = 0,
  limit = 50,
  search?: string,
): Promise<ProviderListResponse> => {
  if (!isMockAuthEnabled()) {
    const params: { skip: number; limit: number; search?: string } = { skip, limit }
    if (search) params.search = search
    const { data } = await axiosInstance.get<ApiProviderListResponse>('/providers', {
      params,
    })
    return {
      items: data.items.filter(ACTIVE_ONLY).map(mapApiProvider),
      total: data.items.filter(ACTIVE_ONLY).length,
      skip: data.skip,
      limit: data.limit,
    }
  }
  return StorageEngine.getProviders(skip, limit, search)
}

export const getProviderApi = async (providerId: string): Promise<Provider> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<ApiProvider>(`/providers/${providerId}`)
    return mapApiProvider(data)
  }
  return StorageEngine.getProvider(providerId)
}

export const createProviderApi = async (data: ProviderCreate): Promise<Provider> => {
  if (!isMockAuthEnabled()) {
    const { data: created } = await axiosInstance.post<ApiProvider>('/providers', data)
    return mapApiProvider(created)
  }
  return StorageEngine.createProvider(data)
}

export const updateProviderApi = async (
  providerId: string,
  data: ProviderUpdate,
): Promise<Provider> => {
  if (!isMockAuthEnabled()) {
    const { data: updated } = await axiosInstance.patch<ApiProvider>(
      `/providers/${providerId}`,
      data,
    )
    return mapApiProvider(updated)
  }
  return StorageEngine.updateProvider(providerId, data)
}

export const deleteProviderApi = async (providerId: string): Promise<void> => {
  if (!isMockAuthEnabled()) {
    await axiosInstance.delete(`/providers/${providerId}`)
    return
  }
  StorageEngine.deleteProvider(providerId)
}
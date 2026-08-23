import type {
  Provider,
  ProviderCreate,
  ProviderUpdate,
  ProviderListResponse,
} from '../types/provider'
import { StorageEngine } from '../services/localStorage/storageEngine'

export const getProvidersApi = async (
  skip = 0,
  limit = 50,
  search?: string,
): Promise<ProviderListResponse> => {
  return StorageEngine.getProviders(skip, limit, search)
}

export const getProviderApi = async (providerId: number): Promise<Provider> => {
  return StorageEngine.getProvider(providerId)
}

export const createProviderApi = async (data: ProviderCreate): Promise<Provider> => {
  return StorageEngine.createProvider(data)
}

export const updateProviderApi = async (
  providerId: number,
  data: ProviderUpdate,
): Promise<Provider> => {
  return StorageEngine.updateProvider(providerId, data)
}

export const deleteProviderApi = async (providerId: number): Promise<void> => {
  StorageEngine.deleteProvider(providerId)
}

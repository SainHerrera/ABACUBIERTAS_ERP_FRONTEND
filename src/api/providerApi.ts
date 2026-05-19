import axiosInstance from './axiosInstance'
import type { Provider, ProviderCreate, ProviderUpdate, ProviderListResponse } from '../types/provider'

export const getProvidersApi = async (
  skip = 0,
  limit = 50,
  search?: string,
): Promise<ProviderListResponse> => {
  const response = await axiosInstance.get<ProviderListResponse>('/providers', {
    params: { skip, limit, search },
  })
  return response.data
}

export const createProviderApi = async (data: ProviderCreate): Promise<Provider> => {
  const response = await axiosInstance.post<Provider>('/providers', data)
  return response.data
}

export const updateProviderApi = async (
  providerId: number,
  data: ProviderUpdate,
): Promise<Provider> => {
  const response = await axiosInstance.put<Provider>(`/providers/${providerId}`, data)
  return response.data
}

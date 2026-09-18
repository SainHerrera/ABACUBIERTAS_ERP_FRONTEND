import axiosInstance from './axiosInstance'
import { isMockAuthEnabled } from './authApi'
import type {
  Client,
  ClientCreate,
  ClientUpdate,
  ClientListResponse,
  ApiClient,
  ApiClientListResponse,
} from '../types/sales'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { mapApiClient } from '../utils/catalogMappers'

const ACTIVE_ONLY = (c: ApiClient): boolean => c.activo !== false

export const getClientsApi = async (
  skip = 0,
  limit = 50,
  search?: string,
  estado?: string,
  tipo?: string,
): Promise<ClientListResponse> => {
  if (!isMockAuthEnabled()) {
    const params: {
      skip: number
      limit: number
      search?: string
      estado?: string
      tipo?: string
    } = { skip, limit: Math.min(limit, 500) }
    if (search) params.search = search
    if (estado) params.estado = estado
    if (tipo) params.tipo = tipo
    const { data } = await axiosInstance.get<ApiClientListResponse>('/clients', {
      params,
    })
    const items = data.items.filter(ACTIVE_ONLY).map(mapApiClient)
    return { items, total: items.length, skip: data.skip, limit: data.limit }
  }
  return StorageEngine.getClients(skip, limit, search, estado, tipo)
}

export const getClientApi = async (clientId: string): Promise<Client> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<ApiClient>(`/clients/${clientId}`)
    return mapApiClient(data)
  }
  return StorageEngine.getClient(clientId)
}

export const createClientApi = async (data: ClientCreate): Promise<Client> => {
  if (!isMockAuthEnabled()) {
    const { data: created } = await axiosInstance.post<ApiClient>('/clients', data)
    return mapApiClient(created)
  }
  return StorageEngine.createClient(data)
}

export const updateClientApi = async (
  clientId: string,
  data: ClientUpdate,
): Promise<Client> => {
  if (!isMockAuthEnabled()) {
    const { data: updated } = await axiosInstance.patch<ApiClient>(
      `/clients/${clientId}`,
      data,
    )
    return mapApiClient(updated)
  }
  return StorageEngine.updateClient(clientId, data)
}

export const deleteClientApi = async (clientId: string): Promise<void> => {
  if (!isMockAuthEnabled()) {
    await axiosInstance.delete(`/clients/${clientId}`)
    return
  }
  StorageEngine.deleteClient(clientId)
}

export const getClientsByIdApi = async (clientId: string): Promise<Client> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<ApiClient>(`/clients/${clientId}`)
    return mapApiClient(data)
  }
  return StorageEngine.getClient(clientId)
}
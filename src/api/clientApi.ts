import axiosInstance from './axiosInstance'
import type { Client, ClientCreate, ClientUpdate, ClientListResponse } from '../types/sales'
import type { Quotation, QuotationCreate, QuotationUpdate, QuotationEstadoUpdate, QuotationListResponse } from '../types/sales'
import type { Sale, SaleCreate, SaleUpdate, SaleListResponse } from '../types/sales'

export const getClientsApi = async (
  skip = 0,
  limit = 50,
  search?: string,
  estado?: string,
  tipo?: string,
): Promise<ClientListResponse> => {
  const response = await axiosInstance.get<ClientListResponse>('/clients', {
    params: { skip, limit, search, estado, tipo },
  })
  return response.data
}

export const getClientApi = async (clientId: number): Promise<Client> => {
  const response = await axiosInstance.get<Client>(`/clients/${clientId}`)
  return response.data
}

export const createClientApi = async (data: ClientCreate): Promise<Client> => {
  const response = await axiosInstance.post<Client>('/clients', data)
  return response.data
}

export const updateClientApi = async (
  clientId: number,
  data: ClientUpdate,
): Promise<Client> => {
  const response = await axiosInstance.put<Client>(`/clients/${clientId}`, data)
  return response.data
}

export const deleteClientApi = async (clientId: number): Promise<void> => {
  await axiosInstance.delete(`/clients/${clientId}`)
}

export const getClientsByIdApi = async (clientId: number): Promise<Client> => {
  return getClientApi(clientId)
}

// Export types for compatibility
export type { Client, ClientCreate, ClientUpdate, ClientListResponse }

// Export helper function
export const mapClientFromApi = (client: Client): Client => ({
  ...client,
  tipo_cliente: client.tipo_cliente as 'empresa' | 'persona_natural',
  estado: client.estado as 'activo' | 'inactivo' | 'prospecto' | 'frecuente' | 'corporativo',
})
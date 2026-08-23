import type { Client, ClientCreate, ClientUpdate, ClientListResponse } from '../types/sales'
import { StorageEngine } from '../services/localStorage/storageEngine'

export const getClientsApi = async (
  skip = 0,
  limit = 50,
  search?: string,
  estado?: string,
  tipo?: string,
): Promise<ClientListResponse> => {
  return StorageEngine.getClients(skip, limit, search, estado, tipo)
}

export const getClientApi = async (clientId: number): Promise<Client> => {
  return StorageEngine.getClient(clientId)
}

export const createClientApi = async (data: ClientCreate): Promise<Client> => {
  return StorageEngine.createClient(data)
}

export const updateClientApi = async (
  clientId: number,
  data: ClientUpdate,
): Promise<Client> => {
  return StorageEngine.updateClient(clientId, data)
}

export const deleteClientApi = async (clientId: number): Promise<void> => {
  StorageEngine.deleteClient(clientId)
}

export const getClientsByIdApi = async (clientId: number): Promise<Client> => {
  return StorageEngine.getClient(clientId)
}

export type { Client, ClientCreate, ClientUpdate, ClientListResponse }

export const mapClientFromApi = (client: Client): Client => ({
  ...client,
  tipo_cliente: client.tipo_cliente as 'empresa' | 'persona_natural',
  estado: client.estado as 'activo' | 'inactivo' | 'prospecto' | 'frecuente' | 'corporativo',
})
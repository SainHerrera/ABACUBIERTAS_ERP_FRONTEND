import axiosInstance from './axiosInstance'
import { isMockAuthEnabled } from './authApi'
import type {
  ProviderQuotation,
  ProviderQuotationCreate,
  ProviderQuotationListResponse,
  ApiProviderQuotation,
  ApiProviderQuotationListResponse,
} from '../types/providerQuotation'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { mapApiProviderQuotation } from '../utils/catalogMappers'

export type { ProviderQuotation, ProviderQuotationCreate, ProviderQuotationListResponse }

export const getProviderQuotationsApi = async (
  skip = 0,
  limit = 50,
  id_solicitud?: string,
): Promise<ProviderQuotationListResponse> => {
  if (!isMockAuthEnabled()) {
    const params: { skip: number; limit: number; id_solicitud?: string } = {
      skip,
      limit: Math.min(limit, 500),
    }
    if (id_solicitud) params.id_solicitud = id_solicitud
    const { data } = await axiosInstance.get<ApiProviderQuotationListResponse>(
      '/provider-quotations',
      { params },
    )
    const items = data.items.map(mapApiProviderQuotation)
    return { items, total: data.total, skip: data.skip, limit: data.limit }
  }
  return StorageEngine.getProviderQuotations(skip, limit, id_solicitud)
}

export const getProviderQuotationApi = async (quotationId: string): Promise<ProviderQuotation> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<ApiProviderQuotation>(
      `/provider-quotations/${quotationId}`,
    )
    return mapApiProviderQuotation(data)
  }
  return StorageEngine.getProviderQuotation(quotationId)
}

export const createProviderQuotationApi = async (
  data: ProviderQuotationCreate,
): Promise<ProviderQuotation> => {
  if (!isMockAuthEnabled()) {
    const { data: created } = await axiosInstance.post<ApiProviderQuotation>(
      '/provider-quotations',
      data,
    )
    return mapApiProviderQuotation(created)
  }
  return StorageEngine.createProviderQuotation(data)
}

export const selectProviderQuotationApi = async (quotationId: string): Promise<ProviderQuotation> => {
  if (!isMockAuthEnabled()) {
    const { data: updated } = await axiosInstance.patch<ApiProviderQuotation>(
      `/provider-quotations/${quotationId}/seleccionar`,
      { seleccionada: true },
    )
    return mapApiProviderQuotation(updated)
  }
  return StorageEngine.selectProviderQuotation(quotationId)
}

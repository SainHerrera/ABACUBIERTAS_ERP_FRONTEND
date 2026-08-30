import type {
  ProviderQuotation,
  ProviderQuotationCreate,
  ProviderQuotationListResponse,
} from '../types/providerQuotation'
import { StorageEngine } from '../services/localStorage/storageEngine'

export const getProviderQuotationsApi = async (
  skip = 0,
  limit = 50,
  id_solicitud?: number,
): Promise<ProviderQuotationListResponse> => {
  return StorageEngine.getProviderQuotations(skip, limit, id_solicitud)
}

export const getProviderQuotationApi = async (quotationId: number): Promise<ProviderQuotation> => {
  return StorageEngine.getProviderQuotation(quotationId)
}

export const createProviderQuotationApi = async (
  data: ProviderQuotationCreate,
): Promise<ProviderQuotation> => {
  return StorageEngine.createProviderQuotation(data)
}

export const selectProviderQuotationApi = async (quotationId: number): Promise<ProviderQuotation> => {
  return StorageEngine.selectProviderQuotation(quotationId)
}

export type {
  ProviderQuotation,
  ProviderQuotationCreate,
  ProviderQuotationListResponse,
}

import axiosInstance from './axiosInstance'
import { isMockAuthEnabled } from './authApi'
import type {
  Quotation,
  QuotationCreate,
  QuotationUpdate,
  QuotationEstadoUpdate,
  QuotationListResponse,
  ApiQuotation,
  ApiQuotationListResponse,
} from '../types/sales'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { mapApiQuotation } from '../utils/catalogMappers'

export const getQuotesApi = async (
  skip = 0,
  limit = 50,
  id_cliente?: string,
  estado?: string,
): Promise<QuotationListResponse> => {
  if (!isMockAuthEnabled()) {
    const params: { skip: number; limit: number; id_cliente?: string; estado?: string } = {
      skip,
      limit: Math.min(limit, 500),
    }
    if (id_cliente) params.id_cliente = id_cliente
    if (estado && estado !== 'Todos los estados' && estado !== '') params.estado = estado
    const { data } = await axiosInstance.get<ApiQuotationListResponse>('/quotations', { params })
    return {
      items: data.items.map(mapApiQuotation),
      total: data.total,
      skip: data.skip,
      limit: data.limit,
    }
  }
  return StorageEngine.getQuotes(skip, limit, id_cliente, estado)
}

export const getQuoteApi = async (quoteId: string): Promise<Quotation> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<ApiQuotation>(`/quotations/${quoteId}`)
    return mapApiQuotation(data)
  }
  return StorageEngine.getQuote(quoteId)
}

export const createQuoteApi = async (data: QuotationCreate): Promise<Quotation> => {
  if (!isMockAuthEnabled()) {
    const { data: created } = await axiosInstance.post<ApiQuotation>('/quotations', data)
    return mapApiQuotation(created)
  }
  return StorageEngine.createQuote(data)
}

export const updateQuoteApi = async (
  quoteId: string,
  data: QuotationUpdate,
): Promise<Quotation> => {
  if (!isMockAuthEnabled()) {
    const { data: updated } = await axiosInstance.patch<ApiQuotation>(
      `/quotations/${quoteId}`,
      data,
    )
    return mapApiQuotation(updated)
  }
  return StorageEngine.updateQuote(quoteId, data)
}

export const updateQuoteStatusApi = async (
  quoteId: string,
  data: QuotationEstadoUpdate,
): Promise<Quotation> => {
  if (!isMockAuthEnabled()) {
    const { data: updated } = await axiosInstance.patch<ApiQuotation>(
      `/quotations/${quoteId}/estado`,
      data,
    )
    return mapApiQuotation(updated)
  }
  return StorageEngine.updateQuoteStatus(quoteId, data)
}

export const getQuotesByClientApi = async (
  clientId: string,
  skip = 0,
  limit = 50,
): Promise<QuotationListResponse> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<ApiQuotationListResponse>(
      `/clients/${clientId}/quotations`,
      { params: { skip, limit: Math.min(limit, 500) } },
    )
    return {
      items: data.items.map(mapApiQuotation),
      total: data.total,
      skip: data.skip,
      limit: data.limit,
    }
  }
  return StorageEngine.getQuotes(skip, limit, clientId)
}

export const deleteQuoteApi = async (quoteId: string): Promise<void> => {
  if (!isMockAuthEnabled()) {
    await axiosInstance.delete(`/quotations/${quoteId}`)
    return
  }
  StorageEngine.deleteQuote(quoteId)
}

export type {
  Quotation,
  QuotationCreate,
  QuotationUpdate,
  QuotationEstadoUpdate,
  QuotationListResponse,
}
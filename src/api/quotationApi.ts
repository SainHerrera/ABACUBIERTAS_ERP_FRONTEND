import axiosInstance from './axiosInstance'
import type { Quotation, QuotationCreate, QuotationUpdate, QuotationEstadoUpdate, QuotationListResponse } from '../types/sales'

export const getQuotesApi = async (
  skip = 0,
  limit = 50,
  id_cliente?: number,
  estado?: string,
): Promise<QuotationListResponse> => {
  const response = await axiosInstance.get<QuotationListResponse>('/quotes', {
    params: { skip, limit, id_cliente, estado },
  })
  return response.data
}

export const getQuoteApi = async (quoteId: number): Promise<Quotation> => {
  const response = await axiosInstance.get<Quotation>(`/quotes/${quoteId}`)
  return response.data
}

export const createQuoteApi = async (data: QuotationCreate): Promise<Quotation> => {
  const response = await axiosInstance.post<Quotation>('/quotes', data)
  return response.data
}

export const updateQuoteApi = async (
  quoteId: number,
  data: QuotationUpdate,
): Promise<Quotation> => {
  const response = await axiosInstance.put<Quotation>(`/quotes/${quoteId}`, data)
  return response.data
}

export const updateQuoteStatusApi = async (
  quoteId: number,
  data: QuotationEstadoUpdate,
): Promise<Quotation> => {
  const response = await axiosInstance.patch<Quotation>(`/quotes/${quoteId}/status`, data)
  return response.data
}

export const getQuotesByClientApi = async (
  clientId: number,
  skip = 0,
  limit = 50,
): Promise<QuotationListResponse> => {
  const response = await axiosInstance.get<QuotationListResponse>(
    `/clients/${clientId}/quotes`,
    { params: { skip, limit } }
  )
  return response.data
}

export const deleteQuoteApi = async (quoteId: number): Promise<void> => {
  await axiosInstance.delete(`/quotes/${quoteId}`)
}

export type { Quotation, QuotationCreate, QuotationUpdate, QuotationEstadoUpdate, QuotationListResponse }
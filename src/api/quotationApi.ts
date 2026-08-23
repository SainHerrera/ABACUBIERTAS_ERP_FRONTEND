import type {
  Quotation,
  QuotationCreate,
  QuotationUpdate,
  QuotationEstadoUpdate,
  QuotationListResponse,
} from '../types/sales'
import { StorageEngine } from '../services/localStorage/storageEngine'

export const getQuotesApi = async (
  skip = 0,
  limit = 50,
  id_cliente?: number,
  estado?: string,
): Promise<QuotationListResponse> => {
  return StorageEngine.getQuotes(skip, limit, id_cliente, estado)
}

export const getQuoteApi = async (quoteId: number): Promise<Quotation> => {
  return StorageEngine.getQuote(quoteId)
}

export const createQuoteApi = async (data: QuotationCreate): Promise<Quotation> => {
  return StorageEngine.createQuote(data)
}

export const updateQuoteApi = async (
  quoteId: number,
  data: QuotationUpdate,
): Promise<Quotation> => {
  return StorageEngine.updateQuote(quoteId, data)
}

export const updateQuoteStatusApi = async (
  quoteId: number,
  data: QuotationEstadoUpdate,
): Promise<Quotation> => {
  return StorageEngine.updateQuoteStatus(quoteId, data)
}

export const getQuotesByClientApi = async (
  clientId: number,
  skip = 0,
  limit = 50,
): Promise<QuotationListResponse> => {
  return StorageEngine.getQuotes(skip, limit, clientId)
}

export const deleteQuoteApi = async (quoteId: number): Promise<void> => {
  StorageEngine.deleteQuote(quoteId)
}

export type {
  Quotation,
  QuotationCreate,
  QuotationUpdate,
  QuotationEstadoUpdate,
  QuotationListResponse,
}
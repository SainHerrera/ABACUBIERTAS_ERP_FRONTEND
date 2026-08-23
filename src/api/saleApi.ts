import type { Sale, SaleCreate, SaleUpdate, SaleListResponse } from '../types/sales'
import { StorageEngine } from '../services/localStorage/storageEngine'

export const getSalesApi = async (
  skip = 0,
  limit = 50,
  id_cliente?: number,
  estado?: string,
): Promise<SaleListResponse> => {
  return StorageEngine.getSales(skip, limit, id_cliente, estado)
}

export const getSaleApi = async (saleId: number): Promise<Sale> => {
  return StorageEngine.getSale(saleId)
}

export const createSaleApi = async (data: SaleCreate): Promise<Sale> => {
  return StorageEngine.createSale(data)
}

export const updateSaleApi = async (
  saleId: number,
  data: SaleUpdate,
): Promise<Sale> => {
  return StorageEngine.updateSale(saleId, data)
}

export const cancelSaleApi = async (saleId: number): Promise<Sale> => {
  return StorageEngine.cancelSale(saleId)
}

export const convertQuoteToSaleApi = async (
  quoteId: number,
  observaciones?: string,
): Promise<Sale> => {
  return StorageEngine.convertQuoteToSale(quoteId, observaciones)
}

export type { Sale, SaleCreate, SaleUpdate, SaleListResponse }
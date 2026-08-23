import axiosInstance from './axiosInstance'
import type { Sale, SaleCreate, SaleUpdate, SaleListResponse } from '../types/sales'

export const getSalesApi = async (
  skip = 0,
  limit = 50,
  id_cliente?: number,
  estado?: string,
): Promise<SaleListResponse> => {
  const response = await axiosInstance.get<SaleListResponse>('/sales', {
    params: { skip, limit, id_cliente, estado },
  })
  return response.data
}

export const getSaleApi = async (saleId: number): Promise<Sale> => {
  const response = await axiosInstance.get<Sale>(`/sales/${saleId}`)
  return response.data
}

export const createSaleApi = async (data: SaleCreate): Promise<Sale> => {
  const response = await axiosInstance.post<Sale>('/sales', data)
  return response.data
}

export const updateSaleApi = async (
  saleId: number,
  data: SaleUpdate,
): Promise<Sale> => {
  const response = await axiosInstance.put<Sale>(`/sales/${saleId}`, data)
  return response.data
}

export const cancelSaleApi = async (saleId: number): Promise<Sale> => {
  const response = await axiosInstance.delete<Sale>(`/sales/${saleId}`)
  return response.data
}

export const convertQuoteToSaleApi = async (
  quoteId: number,
  observaciones?: string,
): Promise<Sale> => {
  const response = await axiosInstance.post<Sale>(`/sales/convert-quote/${quoteId}`, { observaciones })
  return response.data
}

export type { Sale, SaleCreate, SaleUpdate, SaleListResponse }
import axiosInstance from './axiosInstance'
import type { Product, ProductCreate, ProductUpdate, ProductListResponse } from '../types/product'

export const getProductsApi = async (
  skip = 0,
  limit = 50,
  search?: string,
): Promise<ProductListResponse> => {
  const response = await axiosInstance.get<ProductListResponse>('/products', {
    params: { skip, limit, search },
  })
  return response.data
}

export const getProductApi = async (productId: number): Promise<Product> => {
  const response = await axiosInstance.get<Product>(`/products/${productId}`)
  return response.data
}

export const createProductApi = async (data: ProductCreate): Promise<Product> => {
  const response = await axiosInstance.post<Product>('/products', data)
  return response.data
}

export const updateProductApi = async (
  productId: number,
  data: ProductUpdate,
): Promise<Product> => {
  const response = await axiosInstance.put<Product>(`/products/${productId}`, data)
  return response.data
}

export const deleteProductApi = async (productId: number): Promise<void> => {
  await axiosInstance.delete(`/products/${productId}`)
}

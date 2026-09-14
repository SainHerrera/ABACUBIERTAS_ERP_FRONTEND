import axiosInstance from './axiosInstance'
import { isMockAuthEnabled } from './authApi'
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductListResponse,
  ApiProduct,
  ApiProductListResponse,
} from '../types/product'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { mapApiProduct } from '../utils/catalogMappers'

const ACTIVE_ONLY = (p: ApiProduct): boolean => p.activo !== false

export const getProductsApi = async (
  skip = 0,
  limit = 50,
  search?: string,
): Promise<ProductListResponse> => {
  if (!isMockAuthEnabled()) {
    const params: { skip: number; limit: number; search?: string } = { skip, limit }
    if (search) params.search = search
    const { data } = await axiosInstance.get<ApiProductListResponse>('/products', {
      params,
    })
    const items = data.items.filter(ACTIVE_ONLY).map(mapApiProduct)
    return { items, total: items.length, skip: data.skip, limit: data.limit }
  }
  return StorageEngine.getProducts(skip, limit, search)
}

export const getProductApi = async (productId: string): Promise<Product> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<ApiProduct>(`/products/${productId}`)
    return mapApiProduct(data)
  }
  return StorageEngine.getProduct(productId)
}

export const createProductApi = async (data: ProductCreate): Promise<Product> => {
  if (!isMockAuthEnabled()) {
    const { data: created } = await axiosInstance.post<ApiProduct>('/products', data)
    return mapApiProduct(created)
  }
  return StorageEngine.createProduct(data)
}

export const updateProductApi = async (
  productId: string,
  data: ProductUpdate,
): Promise<Product> => {
  if (!isMockAuthEnabled()) {
    const { data: updated } = await axiosInstance.patch<ApiProduct>(
      `/products/${productId}`,
      data,
    )
    return mapApiProduct(updated)
  }
  return StorageEngine.updateProduct(productId, data)
}

export const deleteProductApi = async (productId: string): Promise<void> => {
  if (!isMockAuthEnabled()) {
    await axiosInstance.delete(`/products/${productId}`)
    return
  }
  StorageEngine.deleteProduct(productId)
}
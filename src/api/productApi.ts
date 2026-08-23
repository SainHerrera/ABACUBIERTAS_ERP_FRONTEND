import type { Product, ProductCreate, ProductUpdate, ProductListResponse } from '../types/product'
import { StorageEngine } from '../services/localStorage/storageEngine'

export const getProductsApi = async (
  skip = 0,
  limit = 50,
  search?: string,
): Promise<ProductListResponse> => {
  return StorageEngine.getProducts(skip, limit, search)
}

export const getProductApi = async (productId: number): Promise<Product> => {
  return StorageEngine.getProduct(productId)
}

export const createProductApi = async (data: ProductCreate): Promise<Product> => {
  return StorageEngine.createProduct(data)
}

export const updateProductApi = async (
  productId: number,
  data: ProductUpdate,
): Promise<Product> => {
  return StorageEngine.updateProduct(productId, data)
}

export const deleteProductApi = async (productId: number): Promise<void> => {
  StorageEngine.deleteProduct(productId)
}

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Product, ProductCreate, ProductUpdate } from '../../types/product'
import { getProductsApi, getProductApi, createProductApi, updateProductApi, deleteProductApi } from '../../api/productApi'

interface ProductState {
  items: Product[]
  total: number
  selectedProduct: Product | null
  isLoading: boolean
  error: string | null
}

const initialState: ProductState = {
  items: [],
  total: 0,
  selectedProduct: null,
  isLoading: false,
  error: null,
}

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (
    params: { skip?: number; limit?: number; search?: string },
    { rejectWithValue },
  ) => {
    try {
      return await getProductsApi(params.skip, params.limit, params.search)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar productos')
    }
  },
)

export const fetchProduct = createAsyncThunk(
  'products/fetchOne',
  async (productId: number, { rejectWithValue }) => {
    try {
      return await getProductApi(productId)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar producto')
    }
  },
)

export const createProduct = createAsyncThunk(
  'products/create',
  async (data: ProductCreate, { rejectWithValue }) => {
    try {
      return await createProductApi(data)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al crear producto')
    }
  },
)

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ productId, data }: { productId: number; data: ProductUpdate }, { rejectWithValue }) => {
    try {
      return await updateProductApi(productId, data)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al actualizar producto')
    }
  },
)

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (productId: number, { rejectWithValue }) => {
    try {
      await deleteProductApi(productId)
      return productId
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al eliminar producto')
    }
  },
)

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSelectedProduct(state) {
      state.selectedProduct = null
    },
    clearProductError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedProduct = action.payload
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.total += 1
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id_producto === action.payload.id_producto)
        if (idx !== -1) state.items[idx] = action.payload
        if (state.selectedProduct?.id_producto === action.payload.id_producto) {
          state.selectedProduct = action.payload
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id_producto !== action.payload)
        state.total -= 1
      })
  },
})

export const { clearSelectedProduct, clearProductError } = productSlice.actions
export default productSlice.reducer

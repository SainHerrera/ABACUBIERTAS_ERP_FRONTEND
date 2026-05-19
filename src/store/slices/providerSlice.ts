import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Provider, ProviderCreate, ProviderUpdate } from '../../types/provider'
import { getProvidersApi, createProviderApi, updateProviderApi } from '../../api/providerApi'

interface ProviderState {
  items: Provider[]
  total: number
  isLoading: boolean
  error: string | null
}

const initialState: ProviderState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null,
}

export const fetchProviders = createAsyncThunk(
  'providers/fetch',
  async (
    params: { skip?: number; limit?: number; search?: string },
    { rejectWithValue },
  ) => {
    try {
      return await getProvidersApi(params.skip, params.limit, params.search)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar proveedores')
    }
  },
)

export const createProvider = createAsyncThunk(
  'providers/create',
  async (data: ProviderCreate, { rejectWithValue }) => {
    try {
      return await createProviderApi(data)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al crear proveedor')
    }
  },
)

export const updateProvider = createAsyncThunk(
  'providers/update',
  async (
    { providerId, data }: { providerId: number; data: ProviderUpdate },
    { rejectWithValue },
  ) => {
    try {
      return await updateProviderApi(providerId, data)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al actualizar proveedor')
    }
  },
)

const providerSlice = createSlice({
  name: 'providers',
  initialState,
  reducers: {
    clearProviderError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProviders.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createProvider.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.total += 1
      })
      .addCase(updateProvider.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id_proveedor === action.payload.id_proveedor)
        if (idx !== -1) state.items[idx] = action.payload
      })
  },
})

export const { clearProviderError } = providerSlice.actions
export default providerSlice.reducer

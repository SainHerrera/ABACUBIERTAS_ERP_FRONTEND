import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Sale, SaleCreate, SaleUpdate } from '../../types/sales'
import { getSalesApi, getSaleApi, createSaleApi, updateSaleApi, cancelSaleApi, convertQuoteToSaleApi } from '../../api/saleApi'

interface SaleState {
  items: Sale[]
  total: number
  selectedSale: Sale | null
  isLoading: boolean
  error: string | null
}

const initialState: SaleState = {
  items: [],
  total: 0,
  selectedSale: null,
  isLoading: false,
  error: null,
}

export const fetchSales = createAsyncThunk(
  'sales/fetch',
  async (
    params: { skip?: number; limit?: number; id_cliente?: number; estado?: string },
    { rejectWithValue },
  ) => {
    try {
      return await getSalesApi(params.skip, params.limit, params.id_cliente, params.estado)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar ventas')
    }
  },
)

export const fetchSale = createAsyncThunk(
  'sales/fetchOne',
  async (saleId: number, { rejectWithValue }) => {
    try {
      return await getSaleApi(saleId)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar venta')
    }
  },
)

export const createSale = createAsyncThunk(
  'sales/create',
  async (data: SaleCreate, { rejectWithValue }) => {
    try {
      return await createSaleApi(data)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al crear venta')
    }
  },
)

export const updateSale = createAsyncThunk(
  'sales/update',
  async ({ saleId, data }: { saleId: number; data: SaleUpdate }, { rejectWithValue }) => {
    try {
      return await updateSaleApi(saleId, data)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al actualizar venta')
    }
  },
)

export const cancelSale = createAsyncThunk(
  'sales/cancel',
  async (saleId: number, { rejectWithValue }) => {
    try {
      return await cancelSaleApi(saleId)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cancelar venta')
    }
  },
)

export const convertQuoteToSale = createAsyncThunk(
  'sales/convertQuote',
  async (quoteId: number, { rejectWithValue }) => {
    try {
      return await convertQuoteToSaleApi(quoteId)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al convertir cotización a venta')
    }
  },
)

const saleSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearSelectedSale(state) {
      state.selectedSale = null
    },
    clearSaleError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSales.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchSale.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedSale = action.payload
      })
      .addCase(fetchSale.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.total += 1
      })
      .addCase(updateSale.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id_orden_venta === action.payload.id_orden_venta)
        if (idx !== -1) state.items[idx] = action.payload
        if (state.selectedSale?.id_orden_venta === action.payload.id_orden_venta) {
          state.selectedSale = action.payload
        }
      })
      .addCase(cancelSale.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id_orden_venta === action.payload.id_orden_venta)
        if (idx !== -1) state.items[idx] = action.payload
        if (state.selectedSale?.id_orden_venta === action.payload.id_orden_venta) {
          state.selectedSale = action.payload
        }
      })
      .addCase(convertQuoteToSale.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.total += 1
      })
  },
})

export const { clearSelectedSale, clearSaleError } = saleSlice.actions
export default saleSlice.reducer
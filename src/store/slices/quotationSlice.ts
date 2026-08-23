import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Quotation, QuotationCreate, QuotationUpdate, QuotationEstadoUpdate } from '../../types/sales'
import { getQuotesApi, getQuoteApi, createQuoteApi, updateQuoteApi, updateQuoteStatusApi, getQuotesByClientApi, deleteQuoteApi } from '../../api/quotationApi'

interface QuotationState {
  items: Quotation[]
  total: number
  selectedQuotation: Quotation | null
  isLoading: boolean
  error: string | null
}

const initialState: QuotationState = {
  items: [],
  total: 0,
  selectedQuotation: null,
  isLoading: false,
  error: null,
}

export const fetchQuotes = createAsyncThunk(
  'quotes/fetch',
  async (
    params: { skip?: number; limit?: number; id_cliente?: number; estado?: string },
    { rejectWithValue },
  ) => {
    try {
      return await getQuotesApi(params.skip, params.limit, params.id_cliente, params.estado)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar cotizaciones')
    }
  },
)

export const fetchQuote = createAsyncThunk(
  'quotes/fetchOne',
  async (quoteId: number, { rejectWithValue }) => {
    try {
      return await getQuoteApi(quoteId)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar cotización')
    }
  },
)

export const createQuote = createAsyncThunk(
  'quotes/create',
  async (data: QuotationCreate, { rejectWithValue }) => {
    try {
      return await createQuoteApi(data)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al crear cotización')
    }
  },
)

export const updateQuote = createAsyncThunk(
  'quotes/update',
  async ({ quoteId, data }: { quoteId: number; data: QuotationUpdate }, { rejectWithValue }) => {
    try {
      return await updateQuoteApi(quoteId, data)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al actualizar cotización')
    }
  },
)

export const updateQuoteStatus = createAsyncThunk(
  'quotes/status',
  async ({ quoteId, data }: { quoteId: number; data: QuotationEstadoUpdate }, { rejectWithValue }) => {
    try {
      return await updateQuoteStatusApi(quoteId, data)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al actualizar estado de cotización')
    }
  },
)

export const fetchQuotesByClient = createAsyncThunk(
  'quotes/fetchByClient',
  async (clientId: number, { rejectWithValue }) => {
    try {
      return await getQuotesByClientApi(clientId)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar cotizaciones del cliente')
    }
  },
)

export const deleteQuote = createAsyncThunk(
  'quotes/delete',
  async (quoteId: number, { rejectWithValue }) => {
    try {
      await deleteQuoteApi(quoteId)
      return quoteId
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al eliminar cotización')
    }
  },
)

const quotationSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
    clearSelectedQuotation(state) {
      state.selectedQuotation = null
    },
    clearQuoteError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotes.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchQuote.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedQuotation = action.payload
      })
      .addCase(fetchQuote.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createQuote.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.total += 1
      })
      .addCase(updateQuote.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id_cotizacion === action.payload.id_cotizacion)
        if (idx !== -1) state.items[idx] = action.payload
        if (state.selectedQuotation?.id_cotizacion === action.payload.id_cotizacion) {
          state.selectedQuotation = action.payload
        }
      })
      .addCase(updateQuoteStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id_cotizacion === action.payload.id_cotizacion)
        if (idx !== -1) state.items[idx] = action.payload
        if (state.selectedQuotation?.id_cotizacion === action.payload.id_cotizacion) {
          state.selectedQuotation = action.payload
        }
      })
      .addCase(fetchQuotesByClient.fulfilled, (state, action) => {
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(deleteQuote.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id_cotizacion !== action.payload)
        state.total -= 1
      })
  },
})

export const { clearSelectedQuotation, clearQuoteError } = quotationSlice.actions
export default quotationSlice.reducer

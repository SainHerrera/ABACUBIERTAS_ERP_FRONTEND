import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type {
  Movement,
  MovementEntryCreate,
  MovementOutputCreate,
  MovementAdjustmentCreate,
} from '../../types/movement'
import {
  getMovementsApi,
  createEntryApi,
  createOutputApi,
  createAdjustmentApi,
} from '../../api/movementApi'

interface MovementState {
  items: Movement[]
  total: number
  isLoading: boolean
  error: string | null
}

const initialState: MovementState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null,
}

export const fetchMovements = createAsyncThunk(
  'movements/fetch',
  async (
    params: {
      skip?: number
      limit?: number
      product_id?: number
      date_from?: string
      date_to?: string
    },
    { rejectWithValue },
  ) => {
    try {
      return await getMovementsApi(
        params.skip,
        params.limit,
        params.product_id,
        params.date_from,
        params.date_to,
      )
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar movimientos')
    }
  },
)

export const createEntry = createAsyncThunk(
  'movements/entry',
  async (data: MovementEntryCreate, { rejectWithValue }) => {
    try {
      return await createEntryApi(data)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al registrar entrada')
    }
  },
)

export const createOutput = createAsyncThunk(
  'movements/output',
  async (data: MovementOutputCreate, { rejectWithValue }) => {
    try {
      return await createOutputApi(data)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al registrar salida')
    }
  },
)

export const createAdjustment = createAsyncThunk(
  'movements/adjustment',
  async (data: MovementAdjustmentCreate, { rejectWithValue }) => {
    try {
      return await createAdjustmentApi(data)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al registrar ajuste')
    }
  },
)

const movementSlice = createSlice({
  name: 'movements',
  initialState,
  reducers: {
    clearMovementError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovements.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMovements.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchMovements.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createEntry.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.total += 1
      })
      .addCase(createOutput.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.total += 1
      })
      .addCase(createAdjustment.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.total += 1
      })
  },
})

export const { clearMovementError } = movementSlice.actions
export default movementSlice.reducer

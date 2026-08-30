import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { AuditLogEntry } from '../../types/auditLog'
import { getAuditLogApi, clearAuditLogApi } from '../../api/auditLogApi'

interface AuditLogState {
  items: AuditLogEntry[]
  total: number
  isLoading: boolean
  error: string | null
}

const initialState: AuditLogState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null,
}

export const fetchAuditLog = createAsyncThunk(
  'auditLog/fetch',
  async (
    params: { skip?: number; limit?: number; usuario?: string; accion?: string },
    { rejectWithValue },
  ) => {
    try {
      return await getAuditLogApi(
        params.skip,
        params.limit,
        { usuario: params.usuario, accion: params.accion },
      )
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Error al cargar el log de auditoría',
      )
    }
  },
)

export const clearAuditLog = createAsyncThunk('auditLog/clear', async () => {
  await clearAuditLogApi()
})

const auditLogSlice = createSlice({
  name: 'auditLog',
  initialState,
  reducers: {
    clearAuditError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLog.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAuditLog.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchAuditLog.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(clearAuditLog.fulfilled, (state) => {
        state.items = []
        state.total = 0
      })
  },
})

export const { clearAuditError } = auditLogSlice.actions
export default auditLogSlice.reducer

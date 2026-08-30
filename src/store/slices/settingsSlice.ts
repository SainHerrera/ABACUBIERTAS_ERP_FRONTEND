import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { SystemSettings, SystemSettingsUpdate } from '../../types/settings'
import {
  getSettingsApi,
  updateSettingsApi,
  resetSettingsApi,
  loadInitialCatalogApi,
} from '../../api/settingsApi'

interface SettingsState {
  data: SystemSettings | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

const initialState: SettingsState = {
  data: null,
  isLoading: false,
  isSaving: false,
  error: null,
}

export const fetchSettings = createAsyncThunk(
  'settings/fetch',
  async (_: void, { rejectWithValue }) => {
    try {
      return await getSettingsApi()
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar parámetros')
    }
  },
)

export const updateSettings = createAsyncThunk(
  'settings/update',
  async (data: SystemSettingsUpdate, { rejectWithValue }) => {
    try {
      return await updateSettingsApi(data)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al guardar parámetros')
    }
  },
)

export const resetSettings = createAsyncThunk(
  'settings/reset',
  async (_: void, { rejectWithValue }) => {
    try {
      return await resetSettingsApi()
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al restablecer parámetros')
    }
  },
)

export const loadInitialCatalog = createAsyncThunk(
  'settings/loadCatalog',
  async (_: void, { rejectWithValue }) => {
    try {
      return await loadInitialCatalogApi()
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar catálogo inicial')
    }
  },
)

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(updateSettings.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isSaving = false
        state.data = action.payload
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload as string
      })
      .addCase(resetSettings.fulfilled, (state, action) => {
        state.data = action.payload
      })
      .addCase(resetSettings.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(loadInitialCatalog.fulfilled, (state) => {
        if (state.data) {
          state.data.catalogoInicialCargado = true
        }
      })
      .addCase(loadInitialCatalog.rejected, (state) => {
        state.error = 'Error al cargar catálogo inicial'
      })
  },
})

export const { clearSettingsError } = settingsSlice.actions
export default settingsSlice.reducer

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Client, ClientCreate, ClientUpdate } from '../../types/sales'
import { getClientsApi, getClientApi, createClientApi, updateClientApi, deleteClientApi } from '../../api/clientApi'

interface ClientState {
  items: Client[]
  total: number
  selectedClient: Client | null
  isLoading: boolean
  error: string | null
}

const initialState: ClientState = {
  items: [],
  total: 0,
  selectedClient: null,
  isLoading: false,
  error: null,
}

export const fetchClients = createAsyncThunk(
  'clients/fetch',
  async (
    params: { skip?: number; limit?: number; search?: string; estado?: string; tipo?: string },
    { rejectWithValue },
  ) => {
    try {
      return await getClientsApi(params.skip, params.limit, params.search, params.estado, params.tipo)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar clientes')
    }
  },
)

export const fetchClient = createAsyncThunk(
  'clients/fetchOne',
  async (clientId: number, { rejectWithValue }) => {
    try {
      return await getClientApi(clientId)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar cliente')
    }
  },
)

export const createClient = createAsyncThunk(
  'clients/create',
  async (data: ClientCreate, { rejectWithValue }) => {
    try {
      return await createClientApi(data)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al crear cliente')
    }
  },
)

export const updateClient = createAsyncThunk(
  'clients/update',
  async ({ clientId, data }: { clientId: number; data: ClientUpdate }, { rejectWithValue }) => {
    try {
      return await updateClientApi(clientId, data)
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al actualizar cliente')
    }
  },
)

export const deleteClient = createAsyncThunk(
  'clients/delete',
  async (clientId: number, { rejectWithValue }) => {
    try {
      await deleteClientApi(clientId)
      return clientId
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al eliminar cliente')
    }
  },
)

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearSelectedClient(state) {
      state.selectedClient = null
    },
    clearClientError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchClient.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedClient = action.payload
      })
      .addCase(fetchClient.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.total += 1
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id_cliente === action.payload.id_cliente)
        if (idx !== -1) state.items[idx] = action.payload
        if (state.selectedClient?.id_cliente === action.payload.id_cliente) {
          state.selectedClient = action.payload
        }
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id_cliente !== action.payload)
        state.total -= 1
      })
  },
})

export const { clearSelectedClient, clearClientError } = clientSlice.actions
export default clientSlice.reducer

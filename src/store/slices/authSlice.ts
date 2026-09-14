import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  AuthState,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
  UserUpdateRequest,
} from '../../types/auth';
import {
  loginApi,
  registerApi,
  refreshApi,
  logoutApi,
  getMeApi,
  getUsersApi,
  updateUserApi,
  deleteUserApi,
} from '../../api/authApi';
import { getCurrentUserFromToken } from '../../utils/jwt';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (
    error instanceof Error &&
    (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
  ) {
    const detail = (
      error as { response?: { data?: { detail?: string } } }
    ).response?.data?.detail;
    return detail || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

const token = localStorage.getItem('accessToken');
const initialUser = token ? getCurrentUserFromToken(token) : null;

const initialState: AuthState = {
  user: initialUser,
  accessToken: token,
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!token && !!initialUser,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk<
  { tokens: TokenResponse; user: User },
  LoginRequest
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const tokens = await loginApi(credentials);
    const user = await getMeApi(tokens.access_token);
    return { tokens, user };
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error, 'Error al iniciar sesión'));
  }
});

export const register = createAsyncThunk<User, RegisterRequest>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      return await registerApi(data);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Error al registrar'));
    }
  },
);

export const restoreSession = createAsyncThunk<User, void>(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return rejectWithValue('No hay sesión activa');
    try {
      return await getMeApi(token);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Error al restaurar la sesión'),
      );
    }
  },
);

export const logoutUser = createAsyncThunk<void, void>(
  'auth/logoutUser',
  async (_, { getState, dispatch }) => {
    const state = getState() as { auth: AuthState };
    const refreshToken = state.auth.refreshToken;
    try {
      await logoutApi(refreshToken ?? undefined);
    } catch {
      // Ignorar errores de la revocación remota: siempre limpiar la sesión local
    }
    dispatch(logout());
  },
);

export const refreshTokenThunk = createAsyncThunk<TokenResponse, void>(
  'auth/refresh',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.refreshToken;
    if (!token) return rejectWithValue('No refresh token');
    try {
      return await refreshApi(token);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Error al refrescar token'));
    }
  },
);

export const fetchUsers = createAsyncThunk<
  User[],
  { skip?: number; limit?: number; rol?: string; status?: string }
>(
  'auth/fetchUsers',
  async ({ skip = 0, limit = 100, rol, status }, { rejectWithValue }) => {
    try {
      return await getUsersApi(skip, limit, { rol, status });
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Error al obtener usuarios'));
    }
  },
);

export const updateUser = createAsyncThunk<
  User,
  { userId: string | number; data: UserUpdateRequest }
>('auth/updateUser', async ({ userId, data }, { rejectWithValue }) => {
  try {
    return await updateUserApi(userId, data);
  } catch (error: unknown) {
    return rejectWithValue(
      getErrorMessage(error, 'Error al actualizar usuario'),
    );
  }
});

export const deleteUser = createAsyncThunk<string | number, string | number>(
  'auth/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await deleteUserApi(userId);
      return userId;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Error al desactivar usuario'),
      );
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>,
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.tokens.access_token;
        state.refreshToken = action.payload.tokens.refresh_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('accessToken', action.payload.tokens.access_token);
        localStorage.setItem('refreshToken', action.payload.tokens.refresh_token);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Error al iniciar sesión';
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Error al registrar';
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.accessToken = localStorage.getItem('accessToken');
        state.refreshToken = localStorage.getItem('refreshToken');
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const matches =
          state.user &&
          (state.user.id && action.payload.id
            ? state.user.id === action.payload.id
            : state.user.id_usuario === action.payload.id_usuario);
        if (matches) {
          state.user = action.payload;
        }
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        localStorage.setItem('accessToken', action.payload.access_token);
        localStorage.setItem('refreshToken', action.payload.refresh_token);
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });
  },
});

export const { setCredentials, setUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
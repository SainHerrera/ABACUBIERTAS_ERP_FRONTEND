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
  getUsersApi,
  updateUserApi,
  deleteUserApi,
} from '../../api/authApi';
import { getCurrentUserFromToken } from '../../utils/jwt';

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk<TokenResponse, LoginRequest>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await loginApi(credentials);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error al iniciar sesión';
      return rejectWithValue(message);
    }
  },
);

export const register = createAsyncThunk<User, RegisterRequest>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      return await registerApi(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error al registrar';
      return rejectWithValue(message);
    }
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
      const message =
        error instanceof Error ? error.message : 'Error al refrescar token';
      return rejectWithValue(message);
    }
  },
);

export const fetchUsers = createAsyncThunk<User[], { skip?: number; limit?: number }>(
  'auth/fetchUsers',
  async ({ skip = 0, limit = 100 }, { rejectWithValue }) => {
    try {
      return await getUsersApi(skip, limit);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error al obtener usuarios';
      return rejectWithValue(message);
    }
  },
);

export const updateUser = createAsyncThunk<
  User,
  { userId: number; data: UserUpdateRequest }
>('auth/updateUser', async ({ userId, data }, { rejectWithValue }) => {
  try {
    return await updateUserApi(userId, data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al actualizar usuario';
    return rejectWithValue(message);
  }
});

export const deleteUser = createAsyncThunk<number, number>(
  'auth/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await deleteUserApi(userId);
      return userId;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error al desactivar usuario';
      return rejectWithValue(message);
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
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.user = getCurrentUserFromToken(action.payload.access_token);
        state.isAuthenticated = true;
        localStorage.setItem('accessToken', action.payload.access_token);
        localStorage.setItem('refreshToken', action.payload.refresh_token);
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
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.user = getCurrentUserFromToken(action.payload.access_token);
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

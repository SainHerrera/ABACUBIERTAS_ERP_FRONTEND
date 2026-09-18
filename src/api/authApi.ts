import axios from 'axios';
import axiosInstance from './axiosInstance';
import type {
  ApiUser,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
  UserUpdateRequest,
} from '../types/auth';
import { StorageEngine } from '../services/localStorage/storageEngine';
import { getCurrentUserFromToken } from '../utils/jwt';

const MOCK_AUTH_KEY = 'abacubiertas_mock_auth';

export const isMockAuthEnabled = (): boolean => {
  if (typeof localStorage !== 'undefined') {
    const override = localStorage.getItem(MOCK_AUTH_KEY);
    if (override !== null) return override === '1';
  }
  return import.meta.env.MODE === 'test';
};

export const toNumericId = (id: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 1_000_000 || 1;
};

export const mapApiUser = (api: ApiUser): User => ({
  id: api.id,
  id_usuario: toNumericId(api.id),
  email: api.email,
  nombre: api.name,
  rol: api.rol,
  activo: api.status,
});

export interface UserFilters {
  rol?: string;
  status?: string;
}

export const toApiUpdateRequest = (
  data: UserUpdateRequest,
): Partial<{ name: string; email: string; password: string; rol: UserRole; status: boolean }> => {
  const body: Partial<{ name: string; email: string; password: string; rol: UserRole; status: boolean }> = {};
  if (data.nombre !== undefined) body.name = data.nombre;
  if (data.email !== undefined) body.email = data.email;
  if (data.password !== undefined) body.password = data.password;
  if (data.rol !== undefined) body.rol = data.rol;
  if (data.activo !== undefined) body.status = data.activo;
  return body;
};

const applyUserFilters = (users: User[], filters?: UserFilters): User[] => {
  return users.filter((u) => {
    if (filters?.rol && u.rol !== filters.rol) return false;
    if (filters?.status === 'activo' && !u.activo) return false;
    if (filters?.status === 'inactivo' && u.activo) return false;
    return true;
  });
};

export const loginApi = async (data: LoginRequest): Promise<TokenResponse> => {
  if (!isMockAuthEnabled()) {
    const { data: tokens } = await axiosInstance.post<TokenResponse>(
      '/auth/login',
      data,
    );
    return tokens;
  }
  return StorageEngine.login(data);
};

export const getMeApi = async (accessToken?: string): Promise<User> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<ApiUser>('/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken ?? localStorage.getItem('accessToken') ?? ''}`,
      },
    });
    return mapApiUser(data);
  }
  const token = accessToken ?? localStorage.getItem('accessToken') ?? '';
  const user = getCurrentUserFromToken(token);
  if (!user) {
    throw new Error('No se pudo obtener el usuario de la sesión');
  }
  return user;
};

export const registerApi = async (data: RegisterRequest): Promise<User> => {
  if (!isMockAuthEnabled()) {
    const { data: user } = await axiosInstance.post<ApiUser>('/auth/register', {
      name: data.nombre,
      email: data.email,
      password: data.password,
      rol: data.rol,
    });
    return mapApiUser(user);
  }
  return StorageEngine.register(data);
};

export const refreshApi = async (
  refreshToken: string,
): Promise<TokenResponse> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  }
  return StorageEngine.refresh(refreshToken);
};

export const logoutApi = async (refreshToken?: string | null): Promise<void> => {
  if (!refreshToken) return;
  if (!isMockAuthEnabled()) {
    await axios.post('/auth/logout', { refresh_token: refreshToken }, { baseURL: '/api/v1' });
    return;
  }
  StorageEngine.logout(refreshToken);
};

export const getUsersApi = async (
  skip = 0,
  limit = 100,
  filters?: UserFilters,
): Promise<User[]> => {
  if (!isMockAuthEnabled()) {
    const params: { skip: number; limit: number; rol?: string; status?: string } = {
      skip,
      limit,
    };
    if (filters?.rol) params.rol = filters.rol;
    if (filters?.status) params.status = filters.status;
    const { data } = await axiosInstance.get<ApiUser[]>('/users', { params });
    return data.map(mapApiUser);
  }
  return applyUserFilters(StorageEngine.getUsers(skip, limit), filters);
};

export const getUserApi = async (userId: string | number): Promise<User> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<ApiUser>(`/users/${userId}`);
    return mapApiUser(data);
  }
  return StorageEngine.getUser(userId as number);
};

export const createUserApi = async (
  data: RegisterRequest,
): Promise<User> => {
  return registerApi(data);
};

export const updateUserApi = async (
  userId: string | number,
  data: UserUpdateRequest,
): Promise<User> => {
  if (!isMockAuthEnabled()) {
    const { data: user } = await axiosInstance.patch<ApiUser>(
      `/users/${userId}`,
      toApiUpdateRequest(data),
    );
    return mapApiUser(user);
  }
  const currentUser = StorageEngine.getCurrentUser();
  if (currentUser.rol !== 'admin') {
    throw new Error('Se requieren permisos de administrador');
  }
  return StorageEngine.updateUser(userId as number, data);
};

export const deleteUserApi = async (userId: string | number): Promise<void> => {
  if (!isMockAuthEnabled()) {
    await axiosInstance.delete(`/users/${userId}`);
    return;
  }
  const currentUser = StorageEngine.getCurrentUser();
  if (currentUser.rol !== 'admin') {
    throw new Error('Se requieren permisos de administrador');
  }
  StorageEngine.deleteUser(userId as number);
};

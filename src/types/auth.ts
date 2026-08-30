export type UserRole = 'admin' | 'ventas' | 'compras' | 'bodega' | 'gerencia';

export interface User {
  id_usuario: number;
  email: string;
  nombre: string;
  rol: UserRole;
  activo: boolean;
  password_hash?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  rol?: UserRole;
}

export interface UserUpdateRequest {
  email?: string;
  password?: string;
  nombre?: string;
  rol?: UserRole;
  activo?: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PaginationParams {
  skip: number;
  limit: number;
}

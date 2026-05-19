import axiosInstance from './axiosInstance';
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
  UserUpdateRequest,
} from '../types/auth';

export const loginApi = async (data: LoginRequest): Promise<TokenResponse> => {
  const response = await axiosInstance.post<TokenResponse>('/login', data);
  return response.data;
};

export const registerApi = async (data: RegisterRequest): Promise<User> => {
  const response = await axiosInstance.post<User>('/register', data);
  return response.data;
};

export const refreshApi = async (
  refreshToken: string,
): Promise<TokenResponse> => {
  const response = await axiosInstance.post<TokenResponse>('/refresh', {
    refresh_token: refreshToken,
  });
  return response.data;
};

export const getUsersApi = async (
  skip = 0,
  limit = 100,
): Promise<User[]> => {
  const response = await axiosInstance.get<User[]>('/users', {
    params: { skip, limit },
  });
  return response.data;
};

export const getUserApi = async (userId: number): Promise<User> => {
  const response = await axiosInstance.get<User>(`/users/${userId}`);
  return response.data;
};

export const createUserApi = async (
  data: RegisterRequest,
): Promise<User> => {
  const response = await axiosInstance.post<User>('/register', data);
  return response.data;
};

export const updateUserApi = async (
  userId: number,
  data: UserUpdateRequest,
): Promise<User> => {
  const response = await axiosInstance.put<User>(`/users/${userId}`, data);
  return response.data;
};

export const deleteUserApi = async (userId: number): Promise<void> => {
  await axiosInstance.delete(`/users/${userId}`);
};

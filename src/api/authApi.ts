import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
  UserUpdateRequest,
} from '../types/auth'
import { StorageEngine } from '../services/localStorage/storageEngine'

export const loginApi = async (data: LoginRequest): Promise<TokenResponse> => {
  return StorageEngine.login(data)
}

export const registerApi = async (data: RegisterRequest): Promise<User> => {
  return StorageEngine.register(data)
}

export const refreshApi = async (
  refreshToken: string,
): Promise<TokenResponse> => {
  return StorageEngine.refresh(refreshToken)
}

export const getUsersApi = async (
  skip = 0,
  limit = 100,
): Promise<User[]> => {
  return StorageEngine.getUsers(skip, limit)
}

export const getUserApi = async (userId: number): Promise<User> => {
  return StorageEngine.getUser(userId)
}

export const createUserApi = async (
  data: RegisterRequest,
): Promise<User> => {
  return StorageEngine.register(data)
}

export const updateUserApi = async (
  userId: number,
  data: UserUpdateRequest,
): Promise<User> => {
  return StorageEngine.updateUser(userId, data)
}

export const deleteUserApi = async (userId: number): Promise<void> => {
  StorageEngine.deleteUser(userId)
}

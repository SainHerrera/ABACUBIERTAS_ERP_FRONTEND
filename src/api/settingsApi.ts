import axiosInstance from './axiosInstance'
import { isMockAuthEnabled } from './authApi'
import type {
  SystemSettings,
  SystemSettingsUpdate,
  ApiSystemSettings,
} from '../types/settings'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { mapApiSettings, toApiSettingsUpdate } from '../utils/settingsMappers'

export const getSettingsApi = async (): Promise<SystemSettings> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.get<ApiSystemSettings>('/settings')
    return mapApiSettings(data)
  }
  return StorageEngine.getSettings()
}

export const updateSettingsApi = async (data: SystemSettingsUpdate): Promise<SystemSettings> => {
  if (!isMockAuthEnabled()) {
    const { data: updated } = await axiosInstance.patch<ApiSystemSettings>(
      '/settings',
      toApiSettingsUpdate(data),
    )
    return mapApiSettings(updated)
  }
  return StorageEngine.updateSettings(data)
}

export const resetSettingsApi = async (): Promise<SystemSettings> => {
  if (!isMockAuthEnabled()) {
    const { data: updated } = await axiosInstance.post<ApiSystemSettings>('/settings/reset')
    return mapApiSettings(updated)
  }
  return StorageEngine.resetSettings()
}

export const loadInitialCatalogApi = async (): Promise<{
  products: number
  providers: number
}> => {
  if (!isMockAuthEnabled()) {
    const { data } = await axiosInstance.post<{ products: number; providers: number }>(
      '/settings/load-catalog',
    )
    return data
  }
  return StorageEngine.loadInitialCatalog()
}
import type { SystemSettings, SystemSettingsUpdate } from '../types/settings'
import { StorageEngine } from '../services/localStorage/storageEngine'

export const getSettingsApi = async (): Promise<SystemSettings> => {
  return StorageEngine.getSettings()
}

export const updateSettingsApi = async (data: SystemSettingsUpdate): Promise<SystemSettings> => {
  return StorageEngine.updateSettings(data)
}

export const resetSettingsApi = async (): Promise<SystemSettings> => {
  return StorageEngine.resetSettings()
}

export const loadInitialCatalogApi = async (): Promise<{
  products: number
  providers: number
}> => {
  return StorageEngine.loadInitialCatalog()
}

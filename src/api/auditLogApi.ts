import axiosInstance from './axiosInstance'
import { isMockAuthEnabled } from './authApi'
import type { AuditLogListResponse } from '../types/auditLog'
import { StorageEngine } from '../services/localStorage/storageEngine'

export const getAuditLogApi = async (
  skip = 0,
  limit = 50,
  filters?: { usuario?: string; accion?: string },
): Promise<AuditLogListResponse> => {
  if (!isMockAuthEnabled()) {
    const params: { skip: number; limit: number; usuario?: string; accion?: string } = {
      skip,
      limit: Math.min(limit, 500),
    }
    if (filters?.usuario && filters.usuario.trim()) params.usuario = filters.usuario.trim()
    if (filters?.accion) params.accion = filters.accion
    const { data } = await axiosInstance.get<AuditLogListResponse>('/audit-log', { params })
    return data
  }
  return StorageEngine.getAuditLog(skip, limit, filters)
}

export const clearAuditLogApi = async (): Promise<void> => {
  if (!isMockAuthEnabled()) {
    await axiosInstance.delete('/audit-log')
    return
  }
  StorageEngine.clearAuditLog()
}
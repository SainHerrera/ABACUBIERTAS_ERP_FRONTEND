import type { AuditLogListResponse } from '../types/auditLog'
import { StorageEngine } from '../services/localStorage/storageEngine'

export const getAuditLogApi = async (
  skip = 0,
  limit = 50,
  filters?: { usuario?: string; accion?: string },
): Promise<AuditLogListResponse> => {
  return StorageEngine.getAuditLog(skip, limit, filters)
}

export const clearAuditLogApi = async (): Promise<void> => {
  StorageEngine.clearAuditLog()
}

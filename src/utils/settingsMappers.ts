import type { ApiSystemSettings } from '../types/settings'
import type { SystemSettings } from '../types/settings'
import type { SystemSettingsUpdate } from '../types/settings'

export function mapApiSettings(raw: ApiSystemSettings): SystemSettings {
  return {
    stockMinimoDefault: Number(raw.stock_minimo_default) || 0,
    margenUtilidadDefault: Number(raw.margen_utilidad_default) || 0,
    catalogoInicialCargado: Boolean(raw.catalogo_inicial_cargado),
    aprobacionOcHabilitada: Boolean(raw.aprobacion_oc_habilitada),
    aprobacionOcMontoMinimo: Number(raw.aprobacion_oc_monto_minimo) || 0,
    updatedAt: raw.updated_at ?? undefined,
  }
}

export function toApiSettingsUpdate(
  data: SystemSettingsUpdate,
): Partial<ApiSystemSettings> {
  const body: Partial<ApiSystemSettings> = {}
  if (data.stockMinimoDefault !== undefined) {
    body.stock_minimo_default = Number(data.stockMinimoDefault)
  }
  if (data.margenUtilidadDefault !== undefined) {
    body.margen_utilidad_default = Number(data.margenUtilidadDefault)
  }
  if (data.aprobacionOcHabilitada !== undefined) {
    body.aprobacion_oc_habilitada = Boolean(data.aprobacionOcHabilitada)
  }
  if (data.aprobacionOcMontoMinimo !== undefined) {
    body.aprobacion_oc_monto_minimo = String(Number(data.aprobacionOcMontoMinimo))
  }
  return body
}
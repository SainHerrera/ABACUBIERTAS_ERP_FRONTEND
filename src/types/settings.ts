export interface SystemSettings {
  stockMinimoDefault: number
  margenUtilidadDefault: number
  catalogoInicialCargado: boolean
  aprobacionOcHabilitada: boolean
  aprobacionOcMontoMinimo: number
  updatedAt?: string
}

export interface SystemSettingsUpdate {
  stockMinimoDefault?: number
  margenUtilidadDefault?: number
  aprobacionOcHabilitada?: boolean
  aprobacionOcMontoMinimo?: number
}

export interface ApiSystemSettings {
  stock_minimo_default: number
  margen_utilidad_default: number
  catalogo_inicial_cargado: boolean
  aprobacion_oc_habilitada: boolean
  aprobacion_oc_monto_minimo: string
  updated_at?: string | null
}

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

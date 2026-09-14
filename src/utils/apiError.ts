import axios from 'axios'

type FastApErrorDetail = string | Array<{ loc?: unknown[]; msg?: string; type?: string }>

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error inesperado.',
): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: FastApErrorDetail } | undefined)
      ?.detail
    if (typeof detail === 'string' && detail.trim()) return detail
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0]
      if (first && typeof first.msg === 'string' && first.msg.trim()) return first.msg
    }
    return fallback
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
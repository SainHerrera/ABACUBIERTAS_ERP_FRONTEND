const rawBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? '';

export const API_BASE_URL = rawBaseUrl
  ? rawBaseUrl.replace(/\/+$/, '') + '/api/v1'
  : '/api/v1';
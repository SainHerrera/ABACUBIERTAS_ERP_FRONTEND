import { type Page } from '@playwright/test'

export const isBackendMode = (): boolean => process.env.E2E_BACKEND === '1'

export const mockAuthValue = (): '1' | '0' => (isBackendMode() ? '0' : '1')

export const SEED_USERS: {
  email: string
  password: string
  nombre: string
  rol: string
}[] = [
  { email: 'admin@test.com', password: 'Admin12345!', nombre: 'Administrador ERP', rol: 'admin' },
  { email: 'ventas@test.com', password: 'Ventas12345!', nombre: 'Asesor Comercial', rol: 'ventas' },
  { email: 'compras@test.com', password: 'Compras12345!', nombre: 'Encargado Compras', rol: 'compras' },
  { email: 'bodega@test.com', password: 'Bodega12345!', nombre: 'Encargado Bodega', rol: 'bodega' },
  { email: 'gerencia@test.com', password: 'Gerencia12345!', nombre: 'Gerencia General', rol: 'gerencia' },
]

/**
 * Prepara el estado antes de cada test: en modo backend hace reset + seed de la BD
 * (los tests son stateful, por eso se restaura la semilla en cada beforeEach).
 */
export const prepareE2E = async (): Promise<void> => {
  if (isBackendMode()) {
    const { resetAndSeedBackend } = await import('./backend-seed')
    await resetAndSeedBackend()
  }
}

/**
 * Limpia la sesión local y fija el modo de autenticación (mock '1' o backend '0').
 */
export const setMockAuth = async (page: Page): Promise<void> => {
  await page.goto('/login')
  await page.evaluate((mode) => {
    localStorage.clear()
    localStorage.setItem('abacubiertas_mock_auth', mode)
  }, mockAuthValue())
  await page.reload()
}

const BACKEND_URL = 'http://localhost:8000/api/v1'

/**
 * Rol del usuario autenticado. El JWT del backend NO incluye `rol` (el mock sí),
 * así que en modo backend se resuelve vía GET /auth/me.
 */
export const getCurrentRol = async (page: Page): Promise<string> => {
  const token = await page.evaluate(() => localStorage.getItem('accessToken'))
  if (!token) throw new Error('No hay accessToken')
  if (!isBackendMode()) {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.rol as string
  }
  const res = await fetch(`${BACKEND_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`GET /auth/me falló: ${res.status}`)
  const me = (await res.json()) as { rol: string }
  return me.rol
}
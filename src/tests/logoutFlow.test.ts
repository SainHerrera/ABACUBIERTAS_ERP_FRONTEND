import { describe, it, expect, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, {
  login,
  logoutUser,
} from '../store/slices/authSlice'
import { loginApi, logoutApi, refreshApi } from '../api/authApi'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { SEED_PASSWORDS } from '../services/localStorage/seedData'
import type { AuthState } from '../types/auth'

type RootState = { auth: AuthState }

const createTestStore = () =>
  configureStore<RootState>({
    reducer: { auth: authReducer },
  })

describe('LOGOUT - Revocación de refresh token', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
    localStorage.removeItem('abacubiertas_mock_auth')
  })

  const loginAsAdmin = async (store: ReturnType<typeof createTestStore>) => {
    await store.dispatch(
      login({
        email: 'admin@test.com',
        password: SEED_PASSWORDS['admin@test.com'],
      }),
    )
    return store.getState().auth
  }

  it('logoutUser limpia sesión, tokens del store y localStorage tras iniciar sesión', async () => {
    const store = createTestStore()
    await loginAsAdmin(store)

    await store.dispatch(logoutUser())

    const state = store.getState().auth
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })

  it('tras logoutUser, refreshApi rechaza con "Token inválido o expirado" (token revocado)', async () => {
    const store = createTestStore()
    const state = await loginAsAdmin(store)
    const refreshToken = state.refreshToken as string

    await store.dispatch(logoutUser())

    await expect(refreshApi(refreshToken)).rejects.toThrow(
      'Token inválido o expirado',
    )
  })

  it('logoutApi registra el evento logout en el log de auditoría', async () => {
    const store = createTestStore()
    await loginAsAdmin(store)

    await store.dispatch(logoutUser())

    const { items } = StorageEngine.getAuditLog(0, 10, { accion: 'logout' })
    expect(items.length).toBeGreaterThan(0)
    expect(items[0].accion).toBe('logout')
    expect(items[0].email_usuario).toBe('admin@test.com')
  })

  it('logoutApi con null o vacío no lanza error y no revoca tokens existentes', async () => {
    const tokens = await loginApi({
      email: 'admin@test.com',
      password: SEED_PASSWORDS['admin@test.com'],
    })

    await expect(logoutApi(null)).resolves.toBeUndefined()
    await expect(logoutApi(undefined)).resolves.toBeUndefined()
    await expect(logoutApi('')).resolves.toBeUndefined()

    const refreshed = await refreshApi(tokens.refresh_token)
    expect(refreshed.access_token).toBeTruthy()
  })

  it('logoutApi es idempotente: llamar dos veces con el mismo token no lanza error', async () => {
    const tokens = await loginApi({
      email: 'admin@test.com',
      password: SEED_PASSWORDS['admin@test.com'],
    })

    await expect(logoutApi(tokens.refresh_token)).resolves.toBeUndefined()
    await expect(logoutApi(tokens.refresh_token)).resolves.toBeUndefined()
  })

  it('un nuevo inicio de sesión tras logout emite un refresh token válido (no revocado)', async () => {
    const store = createTestStore()
    const first = await loginAsAdmin(store)

    await store.dispatch(logoutUser())

    const second = await loginAsAdmin(store)
    expect(second.refreshToken).not.toBe(first.refreshToken)

    const refreshed = await refreshApi(second.refreshToken as string)
    expect(refreshed.access_token).toBeTruthy()
  })
})
import { describe, it, expect, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, {
  login,
  logout,
  restoreSession,
} from '../store/slices/authSlice'
import {
  mapApiUser,
  toNumericId,
  isMockAuthEnabled,
  loginApi,
  getMeApi,
} from '../api/authApi'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { SEED_PASSWORDS } from '../services/localStorage/seedData'
import type { ApiUser, AuthState } from '../types/auth'

type RootState = { auth: AuthState }

const createTestStore = () =>
  configureStore<RootState>({
    reducer: { auth: authReducer },
  })

describe('AUTH API - Conexión con el backend', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
    localStorage.removeItem('abacubiertas_mock_auth')
  })

  it('mapApiUser mapea la respuesta del backend al formato del frontend', () => {
    const apiUser: ApiUser = {
      id: '98a08ffe-b863-400f-bae8-c05737e0d6f3',
      name: 'Prueba',
      email: 'prueba@erp.com',
      rol: 'ventas',
      status: true,
      created_at: '2026-09-14T15:45:37.066421Z',
    }

    const user = mapApiUser(apiUser)

    expect(user.nombre).toBe('Prueba')
    expect(user.email).toBe('prueba@erp.com')
    expect(user.rol).toBe('ventas')
    expect(user.activo).toBe(true)
    expect(user.id_usuario).toBeGreaterThan(0)
  })

  it('mapApiUser mapea un usuario inactivo', () => {
    const user = mapApiUser({
      id: '98a08ffe-b863-400f-bae8-c05737e0d6f3',
      name: 'Inactivo',
      email: 'inactivo@erp.com',
      rol: 'bodega',
      status: false,
    })

    expect(user.activo).toBe(false)
  })

  it('toNumericId es determinista y estable para un mismo UUID', () => {
    const uuid = '98a08ffe-b863-400f-bae8-c05737e0d6f3'
    expect(toNumericId(uuid)).toBe(toNumericId(uuid))
    expect(Number.isInteger(toNumericId(uuid))).toBe(true)
    expect(toNumericId(uuid)).toBeGreaterThan(0)
    expect(toNumericId('f0f1a2b3-c4d5-4e6f-8a9b-0c1d2e3f4a5b')).not.toBe(
      toNumericId(uuid),
    )
  })

  it('isMockAuthEnabled respeta el override de localStorage', () => {
    localStorage.setItem('abacubiertas_mock_auth', '1')
    expect(isMockAuthEnabled()).toBe(true)

    localStorage.setItem('abacubiertas_mock_auth', '0')
    expect(isMockAuthEnabled()).toBe(false)
  })

  it('getMeApi retorna el perfil completo a partir del token en modo mock', async () => {
    const tokens = await loginApi({
      email: 'admin@test.com',
      password: SEED_PASSWORDS['admin@test.com'],
    })

    const user = await getMeApi(tokens.access_token)

    expect(user.email).toBe('admin@test.com')
    expect(user.rol).toBe('admin')
    expect(user.nombre).toBe('Administrador ERP')
    expect(user.activo).toBe(true)
  })

  it('login thunk guarda tokens y usuario en el store y localStorage', async () => {
    const store = createTestStore()

    const result = await store.dispatch(
      login({
        email: 'admin@test.com',
        password: SEED_PASSWORDS['admin@test.com'],
      }),
    )

    expect(login.fulfilled.match(result)).toBe(true)
    const state = store.getState().auth
    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.email).toBe('admin@test.com')
    expect(state.user?.rol).toBe('admin')
    expect(localStorage.getItem('accessToken')).toBeTruthy()
    expect(localStorage.getItem('refreshToken')).toBeTruthy()
  })

  it('login thunk rechaza con credenciales inválidas', async () => {
    const store = createTestStore()

    const result = await store.dispatch(
      login({ email: 'admin@test.com', password: 'wrong-password-123' }),
    )

    expect(login.fulfilled.match(result)).toBe(false)
    expect(store.getState().auth.isAuthenticated).toBe(false)
    expect(store.getState().auth.user).toBeNull()
    expect(store.getState().auth.error).toBe(
      'Credenciales incorrectas. Verifique su correo y contraseña.',
    )
    expect(localStorage.getItem('accessToken')).toBeNull()
  })

  it('restoreSession restaura la sesión desde localStorage', async () => {
    const loginStore = createTestStore()
    await loginStore.dispatch(
      login({
        email: 'ventas@test.com',
        password: SEED_PASSWORDS['ventas@test.com'],
      }),
    )

    const store = createTestStore()
    const result = await store.dispatch(restoreSession())

    expect(restoreSession.fulfilled.match(result)).toBe(true)
    const state = store.getState().auth
    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.email).toBe('ventas@test.com')
    expect(state.user?.rol).toBe('ventas')
  })

  it('logout limpia tokens y sesión', async () => {
    const store = createTestStore()
    await store.dispatch(
      login({
        email: 'admin@test.com',
        password: SEED_PASSWORDS['admin@test.com'],
      }),
    )

    store.dispatch(logout())

    const state = store.getState().auth
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })
})
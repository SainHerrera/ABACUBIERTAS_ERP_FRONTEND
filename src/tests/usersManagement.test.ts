import { describe, it, expect, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, {
  fetchUsers,
  updateUser,
  deleteUser,
} from '../store/slices/authSlice'
import {
  mapApiUser,
  toApiUpdateRequest,
  getUsersApi,
  getUserApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from '../api/authApi'
import { StorageEngine } from '../services/localStorage/storageEngine'
import type { ApiUser, AuthState, User } from '../types/auth'

type RootState = { auth: AuthState }

const createTestStore = () =>
  configureStore<RootState>({
    reducer: { auth: authReducer },
  })

describe('Gestión de usuarios - Conexión con backend', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
    localStorage.removeItem('abacubiertas_mock_auth')
  })

  it('mapApiUser conserva el UUID del backend en user.id', () => {
    const apiUser: ApiUser = {
      id: '98a08ffe-b863-400f-bae8-c05737e0d6f3',
      name: 'Prueba',
      email: 'prueba@erp.com',
      rol: 'ventas',
      status: true,
    }

    const user = mapApiUser(apiUser)

    expect(user.id).toBe('98a08ffe-b863-400f-bae8-c05737e0d6f3')
    expect(user.id_usuario).toBeGreaterThan(0)
  })

  it('toApiUpdateRequest mapea nombre/activo a name/status del backend', () => {
    const body = toApiUpdateRequest({
      nombre: 'Nuevo Nombre',
      email: 'nuevo@erp.com',
      activo: false,
      rol: 'compras',
    })

    expect(body).toEqual({
      name: 'Nuevo Nombre',
      email: 'nuevo@erp.com',
      status: false,
      rol: 'compras',
    })
  })

  it('toApiUpdateRequest no incluye claves ausentes (PATCH parcial)', () => {
    expect(toApiUpdateRequest({ activo: true })).toEqual({ status: true })
    expect(toApiUpdateRequest({})).toEqual({})
  })

  it('getUsersApi aplica filtro por rol', async () => {
    const ventas = await getUsersApi(0, 100, { rol: 'ventas' })

    expect(ventas.length).toBeGreaterThan(0)
    expect(ventas.every((u) => u.rol === 'ventas')).toBe(true)
  })

  it('getUsersApi aplica filtro por estado activo/inactivo', async () => {
    await StorageEngine.updateUser(2, { activo: false })

    const inactivos = await getUsersApi(0, 100, { status: 'inactivo' })
    const activos = await getUsersApi(0, 100, { status: 'activo' })

    expect(inactivos.find((u) => u.email === 'ventas@test.com')?.activo).toBe(false)
    expect(inactivos.every((u) => !u.activo)).toBe(true)
    expect(activos.every((u) => u.activo)).toBe(true)
  })

  it('getUsersApi sin filtros devuelve todos los usuarios', async () => {
    const all = await getUsersApi(0, 100)

    expect(all.some((u) => u.email === 'admin@test.com')).toBe(true)
    expect(all.some((u) => u.email === 'gerencia@test.com')).toBe(true)
  })

  it('fetchUsers thunk pasa filtros de rol y estado', async () => {
    const store = createTestStore()

    const result = await store.dispatch(
      fetchUsers({ skip: 0, limit: 100, rol: 'bodega', status: 'activo' }),
    )
    expect(fetchUsers.fulfilled.match(result)).toBe(true)

    const users = result.payload as User[]
    expect(users.every((u) => u.rol === 'bodega' && u.activo)).toBe(true)
  })

  it('updateUserApi guarda cambios de rol y nombre', async () => {
    const user = await getUserApi(2)
    const updated = await updateUserApi(user.id_usuario, {
      nombre: 'Asesor Promovido',
      rol: 'compras',
    })

    expect(updated.nombre).toBe('Asesor Promovido')
    expect(updated.rol).toBe('compras')

    const reloaded = await getUserApi(user.id_usuario)
    expect(reloaded.nombre).toBe('Asesor Promovido')
    expect(reloaded.rol).toBe('compras')
  })

  it('updateUser thunk actualiza usuario', async () => {
    const store = createTestStore()
    const user = await getUserApi(3)

    const result = await store.dispatch(
      updateUser({ userId: user.id_usuario, data: { activo: false } }),
    )

    expect(updateUser.fulfilled.match(result)).toBe(true)
    expect((result.payload as { activo: boolean }).activo).toBe(false)
  })

  it('deleteUserApi hace soft delete (activo=false) y persiste', async () => {
    const user = await getUserApi(4)
    await deleteUserApi(user.id_usuario)

    const updated = await getUserApi(user.id_usuario)
    expect(updated.activo).toBe(false)
    expect(StorageEngine.getUsers().some((u) => u.email === 'bodega@test.com')).toBe(true)
  })

  it('deleteUser thunk desactiva y retorna el id', async () => {
    const store = createTestStore()
    const user = await getUserApi(5)

    const result = await store.dispatch(deleteUser(user.id_usuario))

    expect(deleteUser.fulfilled.match(result)).toBe(true)
    expect((await getUserApi(user.id_usuario)).activo).toBe(false)
  })

  it('getUserApi lanza error con mensaje exacto si el usuario no existe', async () => {
    await expect(getUserApi(999999)).rejects.toThrow(
      'Usuario con ID 999999 no encontrado',
    )
  })

  it('createUserApi crea un usuario listable y editable', async () => {
    const created = await createUserApi({
      nombre: 'Nuevo Usuario',
      email: 'nuevo.usuario@abacubiertas.com',
      password: 'SecurePassword123!',
      rol: 'ventas',
    })

    expect(created.id_usuario).toBeDefined()
    const list = await getUsersApi()
    expect(list.some((u) => u.id_usuario === created.id_usuario)).toBe(true)
  })
})
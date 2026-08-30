import { describe, it, expect, beforeEach } from 'vitest'
import {
  loginApi,
  getUsersApi,
  getUserApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from '../api/authApi'
import { getCurrentUserFromToken } from '../utils/jwt'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { SEED_PASSWORDS } from '../services/localStorage/seedData'
import { isAdmin, canManageInventory } from '../utils/permissions'

describe('Admin Authentication & User Management Flow', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
  })

  it('1. Admin logs in with admin credentials and receives decoded admin profile', async () => {
    const tokenResponse = await loginApi({
      email: 'admin@test.com',
      password: SEED_PASSWORDS['admin@test.com'],
    })

    expect(tokenResponse.access_token).toBeDefined()
    expect(tokenResponse.refresh_token).toBeDefined()

    const user = getCurrentUserFromToken(tokenResponse.access_token)
    expect(user).not.toBeNull()
    expect(user?.email).toBe('admin@test.com')
    expect(user?.rol).toBe('admin')
    expect(user?.nombre).toBe('Administrador ERP')
    expect(user?.id_usuario).toBe(1)
    expect(user?.activo).toBe(true)

    expect(isAdmin(user?.rol)).toBe(true)
    expect(canManageInventory(user?.rol)).toBe(true)
  })

  it('2. Admin enters user management panel and lists all users', async () => {
    const users = await getUsersApi(0, 100)
    expect(users.length).toBeGreaterThanOrEqual(3)

    const adminUser = users.find((u) => u.email === 'admin@test.com')
    expect(adminUser).toBeDefined()
    expect(adminUser?.rol).toBe('admin')

    const ventasUser = users.find((u) => u.email === 'ventas@test.com')
    expect(ventasUser).toBeDefined()
    expect(ventasUser?.rol).toBe('ventas')
  })

  it('3. Admin creates a new user, edits their role, deactivates and reactivates them', async () => {
    // 1. Create new user
    const newUser = await createUserApi({
      nombre: 'Nuevo Asesor',
      email: 'nuevo.asesor@abacubiertas.com',
      password: 'SecurePassword123!',
      rol: 'ventas',
    })

    expect(newUser.id_usuario).toBeDefined()
    expect(newUser.nombre).toBe('Nuevo Asesor')
    expect(newUser.email).toBe('nuevo.asesor@abacubiertas.com')
    expect(newUser.rol).toBe('ventas')
    expect(newUser.activo).toBe(true)

    // 2. Verify user is in the list
    let list = await getUsersApi()
    expect(list.some((u) => u.id_usuario === newUser.id_usuario)).toBe(true)

    // 3. Edit user role to 'compras' and name
    const updated = await updateUserApi(newUser.id_usuario, {
      nombre: 'Nuevo Asesor Promovido',
      rol: 'compras',
    })
    expect(updated.nombre).toBe('Nuevo Asesor Promovido')
    expect(updated.rol).toBe('compras')

    // 4. Deactivate user
    const deactivated = await updateUserApi(newUser.id_usuario, {
      activo: false,
    })
    expect(deactivated.activo).toBe(false)

    // Verify deactivated user cannot log in
    await expect(
      loginApi({
        email: 'nuevo.asesor@abacubiertas.com',
        password: 'SecurePassword123!',
      }),
    ).rejects.toThrow('desactivado')

    // 5. Admin can still see deactivated user in the panel
    list = await getUsersApi()
    const userInList = list.find((u) => u.id_usuario === newUser.id_usuario)
    expect(userInList).toBeDefined()
    expect(userInList?.activo).toBe(false)

    // 6. Admin reactivates the user
    const reactivated = await updateUserApi(newUser.id_usuario, {
      activo: true,
    })
    expect(reactivated.activo).toBe(true)

    // Now user can log in again
    const loginRes = await loginApi({
      email: 'nuevo.asesor@abacubiertas.com',
      password: 'SecurePassword123!',
    })
    expect(loginRes.access_token).toBeDefined()
  })

  it('4. Soft-deleting a user sets activo to false and persists', async () => {
    const users = await getUsersApi()
    const userToDeactivate = users[2]

    await deleteUserApi(userToDeactivate.id_usuario)

    const updatedUser = await getUserApi(userToDeactivate.id_usuario)
    expect(updatedUser.activo).toBe(false)
  })
})
